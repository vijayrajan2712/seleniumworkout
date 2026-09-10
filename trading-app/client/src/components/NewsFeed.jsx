function sentimentClass(s) {
  if (s > 0.15) return 'bull';
  if (s < -0.15) return 'bear';
  return '';
}

function fmtTime(ms) {
  return new Date(ms).toISOString().slice(11, 19) + 'Z';
}

export default function NewsFeed({ news }) {
  return (
    <div className="panel news-panel">
      <div className="panel-header"><span>World / Macro News</span></div>
      <div className="news-list">
        {news.length === 0 && <div className="dim">no headlines yet…</div>}
        {news.map((item) => (
          <div key={item.id} className="news-item">
            <div className="news-meta">
              <span className="ts">[{fmtTime(item.time)}]</span>
              <span className={`sentiment ${sentimentClass(item.sentiment)}`}>
                {item.sentiment > 0 ? '+' : ''}
                {item.sentiment.toFixed(2)}
              </span>
              <span className="symbols">{item.symbols.join(', ')}</span>
            </div>
            <div className="news-text">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
