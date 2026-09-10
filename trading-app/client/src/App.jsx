import { useEffect, useMemo, useState } from 'react';
import { fetchSymbols, fetchState } from './lib/api';
import { useTradingFeed } from './hooks/useTradingFeed';
import SymbolSelector from './components/SymbolSelector';
import Terminal from './components/Terminal';
import PriceChart from './components/PriceChart';
import LevelsPanel from './components/LevelsPanel';
import NewsFeed from './components/NewsFeed';
import './App.css';

export default function App() {
  const [symbols, setSymbols] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [initialCandles, setInitialCandles] = useState(null);
  const [showLevels, setShowLevels] = useState({ hilo: true, cpr: true, poc: true });
  const { signals, news, log, connected, subscribeCandles } = useTradingFeed();

  useEffect(() => {
    fetchSymbols().then((list) => {
      setSymbols(list);
      setActiveId((cur) => cur ?? list[0]?.id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    fetchState(activeId).then((state) => {
      if (!cancelled) setInitialCandles(state.candles15m);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const activeSymbol = useMemo(() => symbols.find((s) => s.id === activeId), [symbols, activeId]);
  const activeSignal = activeId ? signals[activeId] : null;
  const activeNews = activeId ? news.filter((n) => n.symbols.includes(activeId)) : news;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gold · Oil · Forex Signal Terminal</h1>
        <div className={`conn-status ${connected ? 'up' : 'down'}`}>
          <span className="dot" /> {connected ? 'live' : 'reconnecting…'}
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <SymbolSelector symbols={symbols} signals={signals} activeId={activeId} onSelect={setActiveId} />
        </aside>

        <main className="main-col">
          <div className="chart-toolbar">
            <label><input type="checkbox" checked={showLevels.hilo} onChange={(e) => setShowLevels((s) => ({ ...s, hilo: e.target.checked }))} /> PDH/PDL/PWH/PWL/PMH/PML</label>
            <label><input type="checkbox" checked={showLevels.cpr} onChange={(e) => setShowLevels((s) => ({ ...s, cpr: e.target.checked }))} /> CPR + R1-R4/S1-S4</label>
            <label><input type="checkbox" checked={showLevels.poc} onChange={(e) => setShowLevels((s) => ({ ...s, poc: e.target.checked }))} /> Volume POC</label>
          </div>
          <PriceChart
            symbol={activeSymbol}
            initialCandles={initialCandles}
            signal={activeSignal}
            subscribeCandles={subscribeCandles}
            showLevels={showLevels}
          />
          <Terminal log={log} activeSymbolId={activeId} />
        </main>

        <aside className="right-col">
          <LevelsPanel symbol={activeSymbol} signal={activeSignal} />
          <NewsFeed news={activeNews} />
        </aside>
      </div>

      <footer className="app-footer">
        Simulated market data &amp; signals for demonstration only — not financial advice. No real trades are placed.
      </footer>
    </div>
  );
}
