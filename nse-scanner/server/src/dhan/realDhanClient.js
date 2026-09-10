import { DhanHttpClient } from './httpClient.js';
import { DhanMarketFeed } from './marketFeed.js';
import { loadInstrumentMaster, mapUniverseToSecurityIds } from './instrumentMaster.js';

const REQUESTS_PER_SECOND = Number(process.env.DHAN_REQUESTS_PER_SECOND || 3);
const HISTORY_LOOKBACK_DAYS = 75; // enough calendar days to cover ~45 trading days for PMH/PML

/** Real market-data source backed by the DhanHQ v2 API. Read-only: no order placement. */
export class RealDhanClient {
  constructor(clientId, accessToken) {
    this.http = new DhanHttpClient(clientId, accessToken);
    this.feed = new DhanMarketFeed(clientId, accessToken);
    this.securityIdBySymbol = new Map();
  }

  get mode() {
    return 'live';
  }

  async init() {
    this._masterBySymbol = await loadInstrumentMaster();
  }

  mapSecurityIds(universe) {
    this.securityIdBySymbol = mapUniverseToSecurityIds(universe, this._masterBySymbol);
    return this.securityIdBySymbol;
  }

  async bootstrapDailyHistory(universe) {
    const result = new Map();
    const toDate = dateStr(new Date());
    const fromDate = dateStr(new Date(Date.now() - HISTORY_LOOKBACK_DAYS * 86400000));
    const wait = makeRateLimiter(REQUESTS_PER_SECOND);

    let done = 0;
    for (const stock of universe) {
      const securityId = this.securityIdBySymbol.get(stock.symbol);
      if (!securityId) continue;
      await wait();
      try {
        const resp = await this.http.post('/charts/historical', {
          securityId,
          exchangeSegment: 'NSE_EQ',
          instrument: 'EQUITY',
          expiryCode: 0,
          oi: false,
          fromDate,
          toDate,
        });
        const candles = parseColumnarCandles(resp);
        if (candles.length) result.set(stock.symbol, candles);
      } catch (err) {
        console.warn(`[dhan] historical fetch failed for ${stock.symbol}: ${err.message}`);
      }
      done++;
      if (done % 50 === 0) console.log(`[dhan] bootstrap progress: ${done}/${universe.length}`);
    }
    console.log(`[dhan] bootstrap complete: ${result.size}/${universe.length} symbols have daily history`);
    return result;
  }

  startLiveFeed(universe, onTick) {
    const symbolBySecurityId = new Map();
    const instrumentIds = [];
    for (const stock of universe) {
      const id = this.securityIdBySymbol.get(stock.symbol);
      if (!id) continue;
      symbolBySecurityId.set(String(id), stock.symbol);
      instrumentIds.push(id);
    }
    return this.feed.connect(instrumentIds, (securityId, tick) => {
      const symbol = symbolBySecurityId.get(securityId);
      if (symbol) onTick(symbol, tick);
    });
  }
}

/** Dhan's charts API returns columnar arrays: { open:[], high:[], low:[], close:[], volume:[], timestamp:[] }. */
function parseColumnarCandles(resp) {
  if (!resp || !Array.isArray(resp.open)) return [];
  const { open, high, low, close, volume, timestamp } = resp;
  const n = open.length;
  const candles = [];
  for (let i = 0; i < n; i++) {
    const t = timestamp[i];
    const ms = typeof t === 'number' ? t * 1000 : /^\d+$/.test(String(t)) ? Number(t) * 1000 : Date.parse(t);
    candles.push({ time: ms, open: open[i], high: high[i], low: low[i], close: close[i], volume: volume?.[i] ?? 0 });
  }
  return candles;
}

function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

function makeRateLimiter(perSecond) {
  const minGapMs = 1000 / perSecond;
  let last = 0;
  return async function wait() {
    const now = Date.now();
    const elapsed = now - last;
    if (elapsed < minGapMs) await sleep(minGapMs - elapsed);
    last = Date.now();
  };
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
