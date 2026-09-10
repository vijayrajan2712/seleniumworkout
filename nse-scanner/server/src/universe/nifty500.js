import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '../../data/nifty500.json');

// NSE publishes the authoritative, current list here - refreshed semi-annually on index reconstitution.
const NSE_LIVE_URL = 'https://archives.nseindia.com/content/indices/ind_nifty500list.csv';

/**
 * Loads the Nifty 500 constituent universe. Ships with a bundled point-in-time
 * snapshot (data/nifty500.json) so the app runs immediately; optionally attempts
 * to refresh from NSE's live CSV first (best-effort - NSE aggressively rate-limits
 * / bot-blocks archive requests, so failures here are expected and non-fatal).
 */
export async function loadNifty500({ tryLiveRefresh = true } = {}) {
  if (tryLiveRefresh) {
    try {
      const live = await fetchLiveList();
      if (live && live.length > 400) {
        console.log(`[nifty500] loaded ${live.length} symbols from live NSE list`);
        return live;
      }
    } catch (err) {
      console.warn(`[nifty500] live NSE fetch failed (${err.message}), falling back to bundled snapshot`);
    }
  }
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  console.log(`[nifty500] loaded ${snapshot.length} symbols from bundled snapshot (data/nifty500.json)`);
  return snapshot;
}

async function fetchLiveList() {
  const res = await fetch(NSE_LIVE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/csv',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split('\n');
  const [, ...rows] = lines; // drop header: Company Name,Industry,Symbol,Series,ISIN Code
  return rows
    .map((line) => line.split(','))
    .filter((cols) => cols.length >= 5)
    .map(([name, industry, symbol, series, isin]) => ({
      symbol: symbol.trim(),
      name: name.trim(),
      industry: industry.trim(),
      series: series.trim(),
      isin: isin.trim(),
    }));
}
