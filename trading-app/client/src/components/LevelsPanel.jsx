function verdictClass(verdict = 'NEUTRAL') {
  if (verdict.includes('BUY')) return 'bull';
  if (verdict.includes('SELL')) return 'bear';
  return 'neutral';
}

function fmt(v, decimals) {
  return v == null ? '—' : Number(v).toFixed(decimals);
}

export default function LevelsPanel({ symbol, signal }) {
  if (!signal) return <div className="panel levels-panel">Loading levels…</div>;
  const d = symbol?.decimals ?? 2;
  const { levels, cpr, volumeProfile, structure, cprPosition, pocPosition, context } = signal;

  return (
    <div className="panel levels-panel">
      <div className="panel-header">
        <span>Analysis — {symbol?.id}</span>
        <span className={`verdict-chip large ${verdictClass(signal.verdict)}`}>
          {signal.verdict} · {signal.confidence}%
        </span>
      </div>

      <section>
        <h4>Day / Week / Month Highs &amp; Lows</h4>
        <div className="level-grid">
          <div><label>PDH</label><span>{fmt(levels.pdh, d)}</span></div>
          <div><label>PDL</label><span>{fmt(levels.pdl, d)}</span></div>
          <div><label>PWH</label><span>{fmt(levels.pwh, d)}</span></div>
          <div><label>PWL</label><span>{fmt(levels.pwl, d)}</span></div>
          <div><label>PMH</label><span>{fmt(levels.pmh, d)}</span></div>
          <div><label>PML</label><span>{fmt(levels.pml, d)}</span></div>
        </div>
      </section>

      <section>
        <h4>15m Structure</h4>
        <div className="kv"><label>Trend</label><span>{structure.trend}</span></div>
        {structure.bos && (
          <div className="kv"><label>Break of Structure</label><span>{structure.bos.direction} through {fmt(structure.bos.brokenLevel, d)}</span></div>
        )}
      </section>

      <section>
        <h4>CPR &amp; Pivots</h4>
        {cpr ? (
          <>
            <div className="level-grid">
              <div><label>R4</label><span>{fmt(cpr.r4, d)}</span></div>
              <div><label>R3</label><span>{fmt(cpr.r3, d)}</span></div>
              <div><label>R2</label><span>{fmt(cpr.r2, d)}</span></div>
              <div><label>R1</label><span>{fmt(cpr.r1, d)}</span></div>
              <div><label>TC</label><span>{fmt(cpr.tc, d)}</span></div>
              <div><label>Pivot</label><span>{fmt(cpr.pivot, d)}</span></div>
              <div><label>BC</label><span>{fmt(cpr.bc, d)}</span></div>
              <div><label>S1</label><span>{fmt(cpr.s1, d)}</span></div>
              <div><label>S2</label><span>{fmt(cpr.s2, d)}</span></div>
              <div><label>S3</label><span>{fmt(cpr.s3, d)}</span></div>
              <div><label>S4</label><span>{fmt(cpr.s4, d)}</span></div>
            </div>
            <div className="kv"><label>Zone</label><span>{cprPosition?.zone.replace(/_/g, ' ')}{cpr.narrow ? ' · narrow CPR' : ''}</span></div>
          </>
        ) : (
          <div className="kv dim">not enough daily history yet</div>
        )}
      </section>

      <section>
        <h4>Volume Profile</h4>
        {volumeProfile ? (
          <>
            <div className="level-grid">
              <div><label>POC</label><span>{fmt(volumeProfile.poc, d)}</span></div>
              <div><label>VA High</label><span>{fmt(volumeProfile.valueAreaHigh, d)}</span></div>
              <div><label>VA Low</label><span>{fmt(volumeProfile.valueAreaLow, d)}</span></div>
            </div>
            <div className="kv"><label>Zone</label><span>{pocPosition?.zone.replace(/_/g, ' ')}</span></div>
          </>
        ) : (
          <div className="kv dim">not enough volume history yet</div>
        )}
      </section>

      <section>
        <h4>News Sentiment</h4>
        <div className="kv">
          <label>Rolling score</label>
          <span className={signal.newsSentiment > 0.1 ? 'bull' : signal.newsSentiment < -0.1 ? 'bear' : ''}>
            {signal.newsSentiment.toFixed(2)}
          </span>
        </div>
      </section>

      {context.length > 0 && (
        <section>
          <h4>Active Confluences</h4>
          <ul className="context-list">
            {context.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
