import { useEffect, useRef, useState } from 'react';

const MAX_LOG = 300;

/**
 * Owns the single WebSocket connection to the signal server and fans out
 * candles/signals/news to whichever components need them.
 */
export function useTradingFeed() {
  const [signals, setSignals] = useState({}); // symbolId -> latest signal
  const [news, setNews] = useState([]);
  const [log, setLog] = useState([]); // terminal event log
  const [connected, setConnected] = useState(false);
  const candleListeners = useRef(new Map()); // symbolId -> Set(callback)
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
          const map = {};
          for (const s of msg.signals) map[s.symbolId] = s;
          setSignals(map);
          setNews(msg.news);
        } else if (msg.type === 'candle') {
          const listeners = candleListeners.current.get(msg.symbolId);
          if (listeners) listeners.forEach((cb) => cb(msg.candle));
        } else if (msg.type === 'signal') {
          const sig = msg.signal;
          setSignals((prev) => ({ ...prev, [sig.symbolId]: sig }));

          const prevV = prevVerdict.current[sig.symbolId];
          const verdictChanged = prevV && prevV !== sig.verdict;
          prevVerdict.current[sig.symbolId] = sig.verdict;

          if (sig.events.length > 0 || verdictChanged) {
            appendLog(sig, verdictChanged);
          }
        } else if (msg.type === 'news') {
          setNews((prev) => [msg.item, ...prev].slice(0, 50));
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

  function subscribeCandles(symbolId, cb) {
    if (!candleListeners.current.has(symbolId)) candleListeners.current.set(symbolId, new Set());
    candleListeners.current.get(symbolId).add(cb);
    return () => candleListeners.current.get(symbolId)?.delete(cb);
  }

  return { signals, news, log, connected, subscribeCandles };
}
