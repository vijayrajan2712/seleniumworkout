// Loads Dhan's instrument master ("scrip master") CSV and maps Nifty 500 trading symbols
// to Dhan securityIds for the NSE equity segment.
//
// Dhan's real CSV column names have changed over time and don't match older SDK/forum docs
// (e.g. there is currently no "TRADING_SYMBOL" column at all - the live header is
// EXCH_ID,SEGMENT,SECURITY_ID,ISIN,INSTRUMENT,UNDERLYING_SECURITY_ID,UNDERLYING_SYMBOL,
// SYMBOL_NAME,DISPLAY_NAME,INSTRUMENT_TYPE,SERIES,LOT_SIZE,... - confirmed from a live fetch).
// Rather than hard-code one guessed "symbol" column and risk silently breaking again on the
// next Dhan-side rename, this loader tries several plausible candidate columns and picks
// whichever one actually matches the most symbols in our Nifty 500 universe at runtime.

const DETAILED_CSV_URL = 'https://images.dhan.co/api-data/api-scrip-master-detailed.csv';

const SECURITY_ID_CANDIDATES = ['SEM_SMST_SECURITY_ID', 'SECURITY_ID'];
const EXCHANGE_CANDIDATES = ['SEM_EXM_EXCH_ID', 'EXCH_ID', 'EXCHANGE'];
const SERIES_CANDIDATES = ['SEM_SERIES', 'SERIES'];
const SYMBOL_COLUMN_CANDIDATES = [
  'UNDERLYING_SYMBOL',
  'SEM_TRADING_SYMBOL',
  'TRADING_SYMBOL',
  'SYMBOL_NAME',
  'DISPLAY_NAME',
];

/** `universe` (optional): the Nifty 500 list, used to self-verify which column is the real symbol column. */
export async function loadInstrumentMaster(universe) {
  const res = await fetch(DETAILED_CSV_URL, { headers: { Accept: 'text/csv' } });
  if (!res.ok) throw new Error(`Failed to fetch Dhan instrument master: HTTP ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('Dhan instrument master CSV came back empty');

  const header = rows[0];
  const upper = header.map((h) => h.trim().toUpperCase());

  const securityIdIdx = findColumn(upper, SECURITY_ID_CANDIDATES);
  const exchangeIdx = findColumn(upper, EXCHANGE_CANDIDATES);
  const seriesIdx = findColumn(upper, SERIES_CANDIDATES);

  if (securityIdIdx == null || exchangeIdx == null) {
    throw new Error(
      `Could not find required security-id/exchange columns in Dhan instrument master CSV header: ${header.join(',')}`
    );
  }

  let best = null;
  for (const candidateName of SYMBOL_COLUMN_CANDIDATES) {
    const symbolIdx = upper.findIndex((h) => h === candidateName);
    if (symbolIdx === -1) continue;
    const map = buildSymbolMap(rows, { securityIdIdx, exchangeIdx, seriesIdx, symbolIdx });
    const matchCount = universe ? universe.filter((s) => map.has(s.symbol.toUpperCase())).length : map.size;
    console.log(`[dhan/instrumentMaster] candidate column "${candidateName}" -> ${matchCount} matches`);
    if (!best || matchCount > best.matchCount) best = { column: candidateName, map, matchCount };
  }

  if (!best || best.matchCount === 0) {
    throw new Error(
      `Could not find a usable trading-symbol column in Dhan instrument master CSV header: ${header.join(
        ','
      )} (tried: ${SYMBOL_COLUMN_CANDIDATES.join(', ')})`
    );
  }

  console.log(
    `[dhan/instrumentMaster] using "${best.column}" as the symbol column - matched ${best.matchCount}${
      universe ? `/${universe.length}` : ''
    } symbols, ${best.map.size} total NSE equity rows indexed`
  );
  return best.map;
}

function buildSymbolMap(rows, { securityIdIdx, exchangeIdx, seriesIdx, symbolIdx }) {
  const bySymbol = new Map();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const exchange = row[exchangeIdx]?.trim().toUpperCase();
    if (exchange !== 'NSE') continue;
    // Restrict to the plain equity (EQ) series when the column is available, so we get the
    // single cash-market row per stock rather than one of its many F&O derivative contracts.
    if (seriesIdx != null && row[seriesIdx]?.trim().toUpperCase() !== 'EQ') continue;

    const symbol = row[symbolIdx]?.trim().toUpperCase();
    const securityId = row[securityIdIdx]?.trim();
    if (!symbol || !securityId) continue;
    if (!bySymbol.has(symbol)) bySymbol.set(symbol, securityId);
  }
  return bySymbol;
}

function findColumn(upperHeader, candidates) {
  for (const candidate of candidates) {
    let idx = upperHeader.findIndex((h) => h === candidate);
    if (idx === -1) idx = upperHeader.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return null;
}

/** Maps each Nifty500 universe entry to a Dhan securityId; logs and skips any that don't resolve. */
export function mapUniverseToSecurityIds(universe, bySymbolMap) {
  const mapped = new Map();
  const unmapped = [];
  for (const stock of universe) {
    const id = bySymbolMap.get(stock.symbol.toUpperCase());
    if (id) mapped.set(stock.symbol, id);
    else unmapped.push(stock.symbol);
  }
  if (unmapped.length > 0) {
    console.warn(
      `[dhan/instrumentMaster] ${unmapped.length}/${universe.length} symbols did not map to a Dhan securityId: ${unmapped
        .slice(0, 20)
        .join(', ')}${unmapped.length > 20 ? '...' : ''}`
    );
  }
  return mapped;
}

/** Minimal RFC4180-ish CSV parser (handles quoted fields containing commas). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
