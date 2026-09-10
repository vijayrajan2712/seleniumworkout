function verdictClass(verdict = 'NEUTRAL') {
  if (verdict.includes('BUY')) return 'bull';
  if (verdict.includes('SELL')) return 'bear';
  return 'neutral';
}

function decimalsFor(symbol) {
  return symbol.decimals ?? 2;
}

export default function SymbolSelector({ symbols, signals, activeId, onSelect }) {
  return (
    <div className="symbol-list">
      {symbols.map((s) => {
        const sig = signals[s.id];
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            className={`symbol-row ${active ? 'active' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="symbol-row-top">
              <span className="symbol-id">{s.id}</span>
              <span className="symbol-price">{sig ? sig.price.toFixed(decimalsFor(s)) : '—'}</span>
            </div>
            <div className="symbol-row-bottom">
              <span className="symbol-name">{s.name}</span>
              <span className={`verdict-chip ${verdictClass(sig?.verdict)}`}>{sig?.verdict ?? '…'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
