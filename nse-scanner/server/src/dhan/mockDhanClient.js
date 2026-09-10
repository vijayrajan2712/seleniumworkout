// Simulated market data source with the exact same interface as the real DhanMarketDataSource
// (dhan/realDhanClient.js), so the scan engine and the rest of the app run identically whether
// or not real Dhan credentials are configured. Used automatically when DHAN_ACCESS_TOKEN /
// DHAN_CLIENT_ID are not set.

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h || 1;
}
function gaussian(rand) {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TICK_SIM_MINUTES = 1; // each real tick advances simulated time by 1 minute

export class MockDhanClient {
  constructor() {
    this.state = new Map(); // symbolId -> { price, rand, driftBias, cumVolume, cumBuy, cumSell, simTime }
  }

  get mode() {
    return 'mock';
  }

  async init() {
    // no auth needed
  }

  mapSecurityIds(universe) {
    // Mock security IDs: just use the symbol itself.
    return new Map(universe.map((s) => [s.symbol, s.symbol]));
  }

  async bootstrapDailyHistory(universe) {
    const result = new Map();
    const now = Date.now();
    for (const stock of universe) {
      const rand = mulberry32(hashSeed(stock.symbol));
      const basePrice = 50 + rand() * 3000; // spread across typical NSE price ranges
      const volatility = basePrice * (0.01 + rand() * 0.015);
      let price = basePrice;
      const candles = [];
      for (let i = 45; i >= 1; i--) {
        const time = now - i * DAY_MS;
        const open = price;
        let high = open;
        let low = open;
        for (let s = 0; s < 6; s++) {
          price += gaussian(rand) * volatility * 0.3;
          high = Math.max(high, price);
          low = Math.min(low, price);
        }
        const close = price;
        high = Math.max(high, open, close);
        low = Math.min(low, open, close);
        const volume = Math.round(200000 + rand() * 800000);
        candles.push({ time, open: round2(open), high: round2(high), low: round2(low), close: round2(close), volume });
      }
      result.set(stock.symbol, candles);

      const last = candles[candles.length - 1];
      this.state.set(stock.symbol, {
        price: last.close,
        rand,
        volatility,
        driftBias: 0,
        cumVolume: 0,
        cumBuy: 0,
        cumSell: 0,
        simTime: startOfTodaySession(now),
      });
    }
    return result;
  }

  startLiveFeed(universe, onTick) {
    const timer = setInterval(() => {
      for (const stock of universe) {
        const st = this.state.get(stock.symbol);
        if (!st) continue;

        if (st.rand() < 0.03) st.driftBias = (st.rand() - 0.5) * st.volatility * 0.5;
        st.price += gaussian(st.rand) * st.volatility * 0.12 + st.driftBias / 10;
        st.price = Math.max(st.price, 1);
        st.simTime += TICK_SIM_MINUTES * 60 * 1000;

        const tickVolume = Math.round(500 + st.rand() * 4000 * (st.rand() < 0.05 ? 6 : 1)); // occasional volume spike
        st.cumVolume += tickVolume;
        const buyShare = 0.5 + (st.driftBias >= 0 ? 1 : -1) * st.rand() * 0.15;
        st.cumBuy += Math.round(tickVolume * buyShare);
        st.cumSell += Math.round(tickVolume * (1 - buyShare));

        onTick(stock.symbol, {
          ltp: round2(st.price),
          ltt: st.simTime,
          volume: st.cumVolume,
          buyQuantity: st.cumBuy,
          sellQuantity: st.cumSell,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }
}

function round2(v) {
  return Math.round(v * 100) / 100;
}
function startOfTodaySession(now) {
  const d = new Date(now);
  d.setHours(9, 15, 0, 0); // NSE cash session open
  return d.getTime();
}
