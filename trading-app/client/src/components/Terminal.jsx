import { useEffect, useRef } from 'react';

function verdictClass(verdict) {
  if (verdict.includes('BUY')) return 'bull';
  if (verdict.includes('SELL')) return 'bear';
  return 'neutral';
}

function fmtTime(ms) {
  return new Date(ms).toISOString().slice(11, 19) + 'Z';
}

export default function Terminal({ log, activeSymbolId }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const visible = activeSymbolId ? log.filter((l) => l.symbolId === activeSymbolId) : log;

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">signal-feed{activeSymbolId ? ` — ${activeSymbolId}` : ' — all symbols'}</span>
      </div>
      <div className="terminal-body" ref={scrollRef}>
        {visible.length === 0 && <div className="terminal-line dim">waiting for signals…</div>}
        {visible.map((line) => (
          <div key={line.id} className={`terminal-line ${verdictClass(line.verdict)}`}>
            <span className="ts">[{fmtTime(line.time)}]</span>
            <span className="sym">{line.symbolId}</span>
            {line.isVerdict ? (
              <span className="badge">{line.verdict}</span>
            ) : (
              <span className="tag">{line.verdict}</span>
            )}
            <span className="msg">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
