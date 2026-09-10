import { useEffect, useRef, useState } from 'react';

const MAX_LOG = 400;

/** Owns the single WebSocket connection to the scanner server and fans out state to the UI. */
export function useScannerFeed() {
  const [universe, setUniverse] = useState([]);
  const [signals, setSignals] = useState({}); // symbolId -> latest signal
  const [tickPrices, setTickPrices] = useState({}); // symbolId -> latest LTP (between signal recomputes)
  const [news, setNews] = useState([]);
  const [log, setLog] = useState([]);
  const [bootstrap, setBootstrap] = useState({ ready: false, message: 'Connecting...' });
  const [mode, setMode] = useState(null);
  const [connected, setConnected] = useState(false);
  const prevVerdict = useRef({});

  useEffect(() => {
    let ws;
    let retryTimer;

    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${window.location.host}/ws`);

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        retryTimer = setTimeout(connect, 1500);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'init') {
          setMode(msg.mode);
          setUniverse(msg.universe);
          setBootstrap(msg.bootstrap);
          const map = {};
          for (const s of msg.signals) map[s.symbolId] = s;
          setSignals(map);
          setNews(msg.news);
        } else if (msg.type === 'bootstrap') {
          setBootstrap({ ready: msg.ready, message: msg.message });
        } else if (msg.type === 'ticks') {
          setTickPrices((prev) => ({ ...prev, ...msg.ticks }));
        } else if (msg.type === 'signal') {
          const sig = msg.signal;
          setSignals((prev) => ({ ...prev, [sig.symbolId]: sig }));

          const prevV = prevVerdict.current[sig.symbolId];
          const verdictChanged = prevV && prevV !== sig.verdict;
          prevVerdict.current[sig.symbolId] = sig.verdict;

          if (sig.events.length > 0 || verdictChanged) appendLog(sig, verdictChanged);
        } else if (msg.type === 'news') {
          setNews((prev) => [msg.item, ...prev].slice(0, 80));
        }
      };
    }

    function appendLog(sig, verdictChanged) {
      setLog((prev) => {
        const lines = sig.events.map((text) => ({
          id: `${sig.symbolId}-${sig.time}-${text}`,
          time: sig.time,
          symbolId: sig.symbolId,
          verdict: sig.verdict,
          text,
        }));
        if (verdictChanged) {
          lines.push({
            id: `${sig.symbolId}-${sig.time}-verdict`,
            time: sig.time,
            symbolId: sig.symbolId,
            verdict: sig.verdict,
            text: `Signal flipped to ${sig.verdict} (confidence ${sig.confidence}%)`,
            isVerdict: true,
          });
        }
        return [...prev, ...lines].slice(-MAX_LOG);
      });
    }

    connect();
    return () => {
      clearTimeout(retryTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  return { universe, signals, tickPrices, news, log, bootstrap, mode, connected };
}
