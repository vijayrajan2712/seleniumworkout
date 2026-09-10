// Loads Dhan's instrument master ("scrip master") CSV and maps Nifty 500 trading symbols
// to Dhan securityIds for the NSE equity segment. Column names are confirmed from Dhan's
// official Python SDK / docs (SEM_EXM_EXCH_ID, SEM_SEGMENT, SEM_SMST_SECURITY_ID,
// SEM_TRADING_SYMBOL, SEM_SERIES) but we match headers defensively (case-insensitive
// keyword match) so a minor Dhan-side column rename doesn't silently break the mapping.

const DETAILED_CSV_URL = 'https://images.dhan.co/api-data/api-scrip-master-detailed.csv';

const HEADER_KEYWORDS = {
  securityId: ['SEM_SMST_SECURITY_ID', 'SECURITY_ID'],
  tradingSymbol: ['SEM_TRADING_SYMBOL', 'TRADING_SYMBOL'],
  exchange: ['SEM_EXM_EXCH_ID', 'EXCH_ID', 'EXCHANGE'],
  segment: ['SEM_SEGMENT', 'SEGMENT'],
  series: ['SEM_SERIES', 'SERIES'],
  instrumentName: ['SEM_INSTRUMENT_NAME', 'INSTRUMENT_NAME', 'INSTRUMENT'],
};

export async function loadInstrumentMaster() {
  const res = await fetch(DETAILED_CSV_URL, { headers: { Accept: 'text/csv' } });
  if (!res.ok) throw new Error(`Failed to fetch Dhan instrument master: HTTP ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('Dhan instrument master CSV came back empty');

  const header = rows[0];
  const colIndex = resolveColumns(header);
  console.log(`[dhan/instrumentMaster] resolved columns: ${JSON.stringify(colIndex)}`);

  const entries = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < header.length) continue;
    const exchange = row[colIndex.exchange]?.trim().toUpperCase();
    const segment = row[colIndex.segment]?.trim().toUpperCase();
    if (exchange !== 'NSE') continue;
    if (segment && !['E', 'EQUITY'].includes(segment)) continue;
    entries.push({
      securityId: row[colIndex.securityId]?.trim(),
      tradingSymbol: row[colIndex.tradingSymbol]?.trim().toUpperCase(),
      series: colIndex.series != null ? row[colIndex.series]?.trim() : undefined,
    });
  }

  const bySymbol = new Map();
  for (const e of entries) {
    if (!e.tradingSymbol || !e.securityId) continue;
    // Prefer the plain EQ series row if a symbol appears more than once.
    if (!bySymbol.has(e.tradingSymbol) || e.series === 'EQ') {
      bySymbol.set(e.tradingSymbol, e.securityId);
    }
  }
  console.log(`[dhan/instrumentMaster] indexed ${bySymbol.size} NSE equity symbols`);
  return bySymbol;
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

function resolveColumns(header) {
  const upper = header.map((h) => h.trim().toUpperCase());
  const colIndex = {};
  for (const [key, candidates] of Object.entries(HEADER_KEYWORDS)) {
    let idx = -1;
    for (const candidate of candidates) {
      idx = upper.findIndex((h) => h === candidate);
      if (idx === -1) idx = upper.findIndex((h) => h.includes(candidate));
      if (idx !== -1) break;
    }
    if (idx === -1 && key !== 'series' && key !== 'instrumentName') {
      throw new Error(`Could not find a column for "${key}" in Dhan instrument master CSV header: ${header.join(',')}`);
    }
    colIndex[key] = idx === -1 ? null : idx;
  }
  return colIndex;
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
