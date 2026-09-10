import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';

import { SYMBOLS, SYMBOL_IDS } from './symbols.js';
import { createSimulators, CANDLE_MS } from './marketData/simulator.js';
import { CandleStore } from './marketData/candleStore.js';
import { evaluateSymbol } from './analysis/signalEngine.js';
import { NewsSimulator } from './news/newsSimulator.js';

const PORT = process.env.PORT || 4000;
const TICK_MS = 1000; // 1 real second == one new 15m candle (accelerated simulated market)
const BACKFILL_CANDLES = 34 * 24 * 4; // ~34 days of 15m history so PMH/PML has a full prior month

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const store = new CandleStore();
const news = new NewsSimulator();
const latestSignals = new Map();

// --- Backfill history so levels (PDH/PDL/PWH/PWL/PMH/PML/CPR/POC) are populated on boot ---
const now = Date.now();
const backfillStart = now - BACKFILL_CANDLES * CANDLE_MS;
const simulators = createSimulators(backfillStart);

for (const symbol of SYMBOLS) {
  const sim = simulators.get(symbol.id);
  const candles = [];
  for (let i = 0; i < BACKFILL_CANDLES; i++) {
    candles.push(sim.nextCandle());
  }
  store.init(symbol.id, candles);
}

// Seed a handful of news headlines so the feed isn't empty on load.
for (let i = 0; i < 6; i++) {
  news.generate(now - (6 - i) * 45000);
}

function computeSignal(symbolId) {
  const candles15m = store.get15m(symbolId, 400);
  const dailyCandles = store.getDaily(symbolId);
  const weeklyCandles = store.getWeekly(symbolId);
  const monthlyCandles = store.getMonthly(symbolId);
  const newsSentiment = news.getSentiment(symbolId);

  const signal = evaluateSymbol({
    symbolId,
    candles15m,
    dailyCandles,
    weeklyCandles,
    monthlyCandles,
    newsSentiment,
  });
  if (signal) latestSignals.set(symbolId, signal);
  return signal;
}

// Compute an initial signal for every symbol immediately after backfill.
for (const symbol of SYMBOLS) computeSignal(symbol.id);

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(data);
  }
}

// --- Live simulation loop ---
let tickCount = 0;
setInterval(() => {
  tickCount++;
  for (const symbol of SYMBOLS) {
    const sim = simulators.get(symbol.id);
    const candle = sim.nextCandle();
    store.push(symbol.id, candle);
    broadcast({ type: 'candle', symbolId: symbol.id, candle });

    const signal = computeSignal(symbol.id);
    if (signal) broadcast({ type: 'signal', signal });
  }

  // Emit a fresh news headline roughly every ~6 seconds.
  if (tickCount % 6 === 0) {
    const item = news.generate(Date.now());
    broadcast({ type: 'news', item });
    // Sentiment shift can flip a signal even without a new candle - recompute affected symbols.
    for (const symbolId of item.symbols) {
      const signal = computeSignal(symbolId);
      if (signal) broadcast({ type: 'signal', signal });
    }
  }
}, TICK_MS);

// --- REST API ---
app.get('/api/symbols', (req, res) => {
  res.json(SYMBOLS);
});

app.get('/api/state/:symbolId', (req, res) => {
  const { symbolId } = req.params;
  if (!SYMBOL_IDS.includes(symbolId)) return res.status(404).json({ error: 'unknown symbol' });

  res.json({
    symbol: SYMBOLS.find((s) => s.id === symbolId),
    candles15m: store.get15m(symbolId, 200),
    daily: store.getDaily(symbolId).slice(-40),
    weekly: store.getWeekly(symbolId).slice(-12),
    monthly: store.getMonthly(symbolId).slice(-6),
    signal: latestSignals.get(symbolId) || null,
    news: news.recent(symbolId, 20),
  });
});

app.get('/api/news', (req, res) => {
  res.json(news.recent(undefined, 50));
});

app.get('/api/signals', (req, res) => {
  res.json(Array.from(latestSignals.values()));
});

wss.on('connection', (ws) => {
  ws.send(
    JSON.stringify({
      type: 'init',
      signals: Array.from(latestSignals.values()),
      news: news.recent(undefined, 20),
    })
  );
});

server.listen(PORT, () => {
  console.log(`[trading-signal-server] listening on :${PORT}`);
  console.log(`Symbols: ${SYMBOL_IDS.join(', ')}`);
});
