import { useEffect, useMemo, useState } from 'react';
import { fetchState } from './lib/api';
import { useScannerFeed } from './hooks/useScannerFeed';
import ScannerTable from './components/ScannerTable';
import Terminal from './components/Terminal';
import PriceChart from './components/PriceChart';
import LevelsPanel from './components/LevelsPanel';
import NewsFeed from './components/NewsFeed';
import './App.css';

export default function App() {
  const { universe, signals, tickPrices, news, log, bootstrap, mode, connected } = useScannerFeed();
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showLevels, setShowLevels] = useState({ hilo: true, cpr: true, poc: true });

  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;
    function load() {
      fetchState(activeId).then((state) => {
        if (!cancelled) setDetail(state);
      });
    }
    load();
    const timer = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeId]);

  const activeStock = useMemo(() => universe.find((s) => s.symbol === activeId), [universe, activeId]);
  const activeSignal = activeId ? signals[activeId] : null;
  const activeNews = activeId ? news.filter((n) => n.symbols.includes(activeId)) : news;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Nifty 500 Scanner</h1>
        {mode && <span className={`mode-badge ${mode}`}>{mode === 'live' ? 'LIVE (Dhan)' : 'MOCK DATA'}</span>}
        <div className={`conn-status ${connected ? 'up' : 'down'}`}>
          <span className="dot" /> {connected ? 'live' : 'reconnecting…'}
        </div>
      </header>

      {!bootstrap.ready && (
        <div className="bootstrap-banner">
          <span className="spinner" /> {bootstrap.message}
        </div>
      )}

      <div className="app-body">
        <div className="left-col">
          <ScannerTable universe={universe} signals={signals} tickPrices={tickPrices} activeId={activeId} onSelect={setActiveId} />
          <Terminal log={log} activeSymbolId={activeId} />
        </div>

        <aside className="right-col">
          {activeId ? (
            <>
              <div className="chart-toolbar">
                <label><input type="checkbox" checked={showLevels.hilo} onChange={(e) => setShowLevels((s) => ({ ...s, hilo: e.target.checked }))} /> PDH/PDL/PMH/PML</label>
                <label><input type="checkbox" checked={showLevels.cpr} onChange={(e) => setShowLevels((s) => ({ ...s, cpr: e.target.checked }))} /> CPR + R1-R4/S1-S4</label>
                <label><input type="checkbox" checked={showLevels.poc} onChange={(e) => setShowLevels((s) => ({ ...s, poc: e.target.checked }))} /> POC</label>
              </div>
              <PriceChart symbolId={activeId} initialCandles={detail?.candles5m} signal={activeSignal} showLevels={showLevels} />
              <LevelsPanel symbol={activeStock} signal={activeSignal} />
              <NewsFeed news={activeNews} />
            </>
          ) : (
            <div className="panel select-hint">Select a stock from the scanner to see its chart, levels and news.</div>
          )}
        </aside>
      </div>

      <footer className="app-footer">
        Scanner only — no orders are ever placed automatically. Place trades manually in Dhan based on these signals.
        {mode === 'mock' && ' Currently running on simulated data (no Dhan credentials configured).'}
      </footer>
    </div>
  );
}
