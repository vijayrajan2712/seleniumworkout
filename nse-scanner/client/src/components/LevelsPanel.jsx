function verdictClass(verdict = 'NEUTRAL') {
  if (verdict.includes('BUY')) return 'bull';
  if (verdict.includes('SELL')) return 'bear';
  return 'neutral';
}
function fmt(v) {
  return v == null ? '—' : Number(v).toFixed(2);
}

export default function LevelsPanel({ symbol, signal }) {
  if (!signal) return <div className="panel levels-panel">Loading analysis…</div>;
  const { levels, cpr, volumeProfile, cprPosition, pocPosition, unusualVolume, institutional, context } = signal;

  return (
    <div className="panel levels-panel">
      <div className="panel-header">
        <span>Analysis — {symbol?.symbol}</span>
        <span className={`verdict-chip large ${verdictClass(signal.verdict)}`}>
          {signal.verdict} · {signal.confidence}%
        </span>
      </div>

      <section>
        <h4>Day / Month Highs &amp; Lows</h4>
        <div className="level-grid">
          <div><label>PDH</label><span>{fmt(levels.pdh)}</span></div>
          <div><label>PDL</label><span>{fmt(levels.pdl)}</span></div>
          <div><label>PMH</label><span>{fmt(levels.pmh)}</span></div>
          <div><label>PML</label><span>{fmt(levels.pml)}</span></div>
        </div>
      </section>

      <section>
        <h4>CPR &amp; Pivots</h4>
        {cpr ? (
          <>
            <div className="level-grid">
              <div><label>R4</label><span>{fmt(cpr.r4)}</span></div>
              <div><label>R3</label><span>{fmt(cpr.r3)}</span></div>
              <div><label>R2</label><span>{fmt(cpr.r2)}</span></div>
              <div><label>R1</label><span>{fmt(cpr.r1)}</span></div>
              <div><label>TC</label><span>{fmt(cpr.tc)}</span></div>
              <div><label>Pivot</label><span>{fmt(cpr.pivot)}</span></div>
              <div><label>BC</label><span>{fmt(cpr.bc)}</span></div>
              <div><label>S1</label><span>{fmt(cpr.s1)}</span></div>
              <div><label>S2</label><span>{fmt(cpr.s2)}</span></div>
              <div><label>S3</label><span>{fmt(cpr.s3)}</span></div>
              <div><label>S4</label><span>{fmt(cpr.s4)}</span></div>
            </div>
            <div className="kv"><label>Zone</label><span>{cprPosition?.zone.replace(/_/g, ' ')}{cpr.narrow ? ' · narrow CPR' : ''}</span></div>
          </>
        ) : (
          <div className="kv dim">no previous-day data yet</div>
        )}
      </section>

      <section>
        <h4>Volume Profile</h4>
        {volumeProfile ? (
          <>
            <div className="level-grid">
              <div><label>POC</label><span>{fmt(volumeProfile.poc)}</span></div>
              <div><label>VA High</label><span>{fmt(volumeProfile.valueAreaHigh)}</span></div>
              <div><label>VA Low</label><span>{fmt(volumeProfile.valueAreaLow)}</span></div>
            </div>
            <div className="kv"><label>Zone</label><span>{pocPosition?.zone.replace(/_/g, ' ')}</span></div>
          </>
        ) : (
          <div className="kv dim">not enough intraday volume yet</div>
        )}
      </section>

      <section>
        <h4>Volume &amp; Order-Flow Delta</h4>
        <div className="kv"><label>Day volume</label><span>{signal.dayVolume != null ? signal.dayVolume.toLocaleString('en-IN') : '—'}</span></div>
        <div className="kv"><label>Latest candle Δ</label><span className={signal.deltaCr > 0 ? 'bull' : signal.deltaCr < 0 ? 'bear' : ''}>₹{signal.deltaCr?.toFixed(2)} cr</span></div>
        <div className="kv"><label>Cumulative positive Δ</label><span className="bull">+₹{signal.positiveDeltaCr?.toFixed(2)} cr</span></div>
        <div className="kv"><label>Cumulative negative Δ</label><span className="bear">₹{signal.negativeDeltaCr?.toFixed(2)} cr</span></div>
      </section>

      <section>
        <h4>Unusual Volume</h4>
        {unusualVolume ? (
          <div className="kv">
            <label>vs trailing avg</label>
            <span className={unusualVolume.unusual ? 'bull' : ''}>{unusualVolume.volumeRatio}x volume, {unusualVolume.notionalRatio}x notional</span>
          </div>
        ) : (
          <div className="kv dim">building baseline…</div>
        )}
      </section>

      <section>
        <h4>Institutional / Big-Money Heuristic</h4>
        <p className="caveat">
          Live proxy only — real FII/DII flow is EOD data. Based on buy/sell quantity imbalance + notional value.
        </p>
        {institutional?.available ? (
          <>
            <div className="kv"><label>Imbalance</label><span>{institutional.imbalance}</span></div>
            <div className="kv"><label>Notional (5m)</label><span>₹{(institutional.notional / 100000).toFixed(1)}L</span></div>
            <div className="kv">
              <label>Flag</label>
              <span className={institutional.flagged ? (institutional.direction === 'buy_side' ? 'bull' : 'bear') : ''}>
                {institutional.flagged ? institutional.direction.replace('_', ' ') : 'none'}
              </span>
            </div>
          </>
        ) : (
          <div className="kv dim">not available in this mode</div>
        )}
      </section>

      <section>
        <h4>News / Sector Sentiment</h4>
        <div className="kv">
          <label>Rolling score</label>
          <span className={signal.newsSentiment > 0.1 ? 'bull' : signal.newsSentiment < -0.1 ? 'bear' : ''}>{signal.newsSentiment.toFixed(2)}</span>
        </div>
      </section>

      {context.length > 0 && (
        <section>
          <h4>Context</h4>
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
