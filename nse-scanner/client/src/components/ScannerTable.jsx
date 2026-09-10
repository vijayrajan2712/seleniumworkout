import { useMemo, useState } from 'react';

function verdictClass(verdict = 'NEUTRAL') {
  if (verdict.includes('BUY')) return 'bull';
  if (verdict.includes('SELL')) return 'bear';
  return 'neutral';
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'buy', label: 'Buy signals' },
  { id: 'sell', label: 'Sell signals' },
  { id: 'unusual', label: 'Unusual volume' },
  { id: 'institutional', label: 'Big money' },
];

export default function ScannerTable({ universe, signals, tickPrices, activeId, onSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'score', dir: 'desc' });

  const rows = useMemo(() => {
    const q = search.trim().toUpperCase();
    let list = universe.map((stock) => {
      const sig = signals[stock.symbol];
      const price = tickPrices[stock.symbol] ?? sig?.price ?? null;
      return { stock, sig, price };
    });

    if (q) list = list.filter(({ stock }) => stock.symbol.includes(q) || stock.name.toUpperCase().includes(q));

    if (filter === 'buy') list = list.filter(({ sig }) => sig?.verdict.includes('BUY'));
    else if (filter === 'sell') list = list.filter(({ sig }) => sig?.verdict.includes('SELL'));
    else if (filter === 'unusual') list = list.filter(({ sig }) => sig?.unusualVolume?.unusual);
    else if (filter === 'institutional') list = list.filter(({ sig }) => sig?.institutional?.flagged);

    const dir = sort.dir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return list;
  }, [universe, signals, tickPrices, search, filter, sort]);

  function toggleSort(key) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  }

  return (
    <div className="scanner-panel">
      <div className="scanner-toolbar">
        <input
          className="scanner-search"
          placeholder="Search symbol or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="scanner-filters">
          {FILTERS.map((f) => (
            <button key={f.id} className={`filter-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="scanner-count">{rows.length} / {universe.length}</span>
      </div>

      <div className="scanner-table-wrap">
        <table className="scanner-table">
          <thead>
            <tr>
              <Th label="Symbol" active={sort.key === 'symbol'} dir={sort.dir} onClick={() => toggleSort('symbol')} />
              <Th label="Price" active={sort.key === 'price'} dir={sort.dir} onClick={() => toggleSort('price')} />
              <Th label="Chg%" active={sort.key === 'change'} dir={sort.dir} onClick={() => toggleSort('change')} />
              <Th label="Verdict" active={sort.key === 'score'} dir={sort.dir} onClick={() => toggleSort('score')} />
              <Th label="Conf%" active={sort.key === 'confidence'} dir={sort.dir} onClick={() => toggleSort('confidence')} />
              <th>Vol</th>
              <th>Flow</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ stock, sig, price }) => (
              <tr
                key={stock.symbol}
                className={`${stock.symbol === activeId ? 'active' : ''}`}
                onClick={() => onSelect(stock.symbol)}
              >
                <td className="cell-symbol">
                  <span className="symbol-id">{stock.symbol}</span>
                  <span className="symbol-name">{stock.name}</span>
                </td>
                <td className="cell-price">{price != null ? price.toFixed(2) : '—'}</td>
                <td className={`cell-change ${changeClass(sig?.changePct)}`}>
                  {sig?.changePct != null ? `${sig.changePct > 0 ? '+' : ''}${sig.changePct.toFixed(2)}%` : '—'}
                </td>
                <td>
                  <span className={`verdict-chip ${verdictClass(sig?.verdict)}`}>{sig?.verdict ?? '…'}</span>
                </td>
                <td className="cell-conf">{sig?.confidence ?? '—'}</td>
                <td>{sig?.unusualVolume?.unusual && <span className="flag-badge vol">VOL {sig.unusualVolume.volumeRatio}x</span>}</td>
                <td>
                  {sig?.institutional?.flagged && (
                    <span className={`flag-badge ${sig.institutional.direction === 'buy_side' ? 'bull' : 'bear'}`}>
                      {sig.institutional.direction === 'buy_side' ? 'BUY FLOW' : 'SELL FLOW'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label, active, dir, onClick }) {
  return (
    <th className={`sortable ${active ? 'active' : ''}`} onClick={onClick}>
      {label} {active && (dir === 'asc' ? '▲' : '▼')}
    </th>
  );
}

function sortValue(row, key) {
  switch (key) {
    case 'symbol':
      return row.stock.symbol;
    case 'price':
      return row.price;
    case 'change':
      return row.sig?.changePct ?? null;
    case 'score':
      return row.sig?.score ?? null;
    case 'confidence':
      return row.sig?.confidence ?? null;
    default:
      return null;
  }
}

function changeClass(pct) {
  if (pct == null) return '';
  return pct > 0 ? 'bull' : pct < 0 ? 'bear' : '';
}
