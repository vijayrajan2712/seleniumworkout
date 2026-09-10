import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';

import { PORT, HAS_DHAN_CREDENTIALS, DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN, UNIVERSE_LIMIT } from './config.js';
import { loadNifty500 } from './universe/nifty500.js';
import { CandleStore } from './marketData/candleStore.js';
import { DailyHistoryStore } from './marketData/dailyHistoryStore.js';
import { NewsSimulator } from './news/newsSimulator.js';
import { MockDhanClient } from './dhan/mockDhanClient.js';
import { RealDhanClient } from './dhan/realDhanClient.js';
import { ScanEngine } from './scanner/scanEngine.js';

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  console.log(`[nse-scanner] mode: ${HAS_DHAN_CREDENTIALS ? 'LIVE (Dhan API)' : 'MOCK (simulated data)'}`);

  let universe = await loadNifty500();
  if (UNIVERSE_LIMIT > 0) universe = universe.slice(0, UNIVERSE_LIMIT);
  console.log(`[nse-scanner] scanning ${universe.length} symbols`);

  const dhanClient = HAS_DHAN_CREDENTIALS ? new RealDhanClient(DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN) : new MockDhanClient();
  const candleStore = new CandleStore();
  const dailyHistoryStore = new DailyHistoryStore();
  const newsSimulator = new NewsSimulator(universe);

  const scanEngine = new ScanEngine({ universe, dhanClient, candleStore, dailyHistoryStore, newsSimulator });

  function broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(data);
    }
  }

  let bootstrapStatus = { ready: false, message: 'Starting up...' };
  broadcastBootstrap();
  function broadcastBootstrap() {
    broadcast({ type: 'bootstrap', ...bootstrapStatus });
  }

  await scanEngine.bootstrap({
    onProgress: (message) => {
      bootstrapStatus = { ready: false, message };
      console.log(`[nse-scanner] ${message}`);
      broadcastBootstrap();
    },
  });
  bootstrapStatus = { ready: true, message: 'Live' };
  broadcastBootstrap();

  scanEngine.start({
    onSignal: (signal) => broadcast({ type: 'signal', signal }),
    onTicksBatch: (ticks) => broadcast({ type: 'ticks', ticks }),
  });

  setInterval(() => {
    const item = newsSimulator.generate(Date.now());
    broadcast({ type: 'news', item });
  }, 8000);

  // --- REST API ---
  app.get('/api/universe', (req, res) => res.json(universe));

  app.get('/api/scanner', (req, res) => res.json(scanEngine.getSnapshot()));

  app.get('/api/state/:symbolId', (req, res) => {
    const { symbolId } = req.params;
    const stock = universe.find((s) => s.symbol === symbolId);
    if (!stock) return res.status(404).json({ error: 'unknown symbol' });
    res.json({
      symbol: stock,
      candles5m: candleStore.get5m(symbolId, 200),
      dailyHistory: dailyHistoryStore.get(symbolId).slice(-45),
      signal: scanEngine.getSignal(symbolId),
      news: newsSimulator.recent(symbolId, 20),
    });
  });

  app.get('/api/news', (req, res) => res.json(newsSimulator.recent(undefined, 50)));

  app.get('/api/status', (req, res) =>
    res.json({ mode: HAS_DHAN_CREDENTIALS ? 'live' : 'mock', universeSize: universe.length, ...bootstrapStatus })
  );

  wss.on('connection', (ws) => {
    ws.send(
      JSON.stringify({
        type: 'init',
        mode: HAS_DHAN_CREDENTIALS ? 'live' : 'mock',
        universe,
        signals: scanEngine.getSnapshot(),
        news: newsSimulator.recent(undefined, 20),
        bootstrap: bootstrapStatus,
      })
    );
  });

  server.listen(PORT, () => {
    console.log(`[nse-scanner] listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error('[nse-scanner] fatal startup error:', err);
  process.exit(1);
});
