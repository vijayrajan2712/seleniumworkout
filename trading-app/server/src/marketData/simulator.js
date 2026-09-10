import { SYMBOLS } from '../symbols.js';

// Deterministic-ish PRNG (mulberry32) so each symbol gets a stable but distinct random walk.
function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h || 1;
}

const CANDLE_MS = 15 * 60 * 1000;

// Simulates one 15m OHLCV candle for a symbol, continuing from the previous close.
export class SymbolSimulator {
  constructor(symbolConfig, startTime) {
    this.config = symbolConfig;
    this.rand = mulberry32(hashSeed(symbolConfig.id));
    this.lastClose = symbolConfig.basePrice;
    this.time = startTime;
    // Slow drift bias that itself wanders, so trends persist over dozens of candles
    // instead of every candle being pure noise (mimics real trending/ranging regimes).
    this.driftBias = 0;
  }

  gaussian() {
    // Box-Muller
    const u1 = Math.max(this.rand(), 1e-9);
    const u2 = this.rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  nextCandle() {
    const { volatility } = this.config;
    // Occasionally shift the drift bias to create trending/ranging regimes.
    if (this.rand() < 0.04) {
      this.driftBias = (this.rand() - 0.5) * volatility * 0.6;
    }

    const open = this.lastClose;
    const steps = 6;
    let price = open;
    let high = open;
    let low = open;
    for (let i = 0; i < steps; i++) {
      const shock = this.gaussian() * volatility * 0.35;
      price += shock + this.driftBias / steps;
      if (price > high) high = price;
      if (price < low) low = price;
    }
    const close = price;
    high = Math.max(high, open, close);
    low = Math.min(low, open, close);

    const range = high - low;
    const baseVolume = 800 + this.rand() * 400;
    const volume = Math.round(baseVolume + (range / (volatility || 1)) * 600);

    const candle = {
      time: this.time,
      open: round(open, this.config.decimals),
      high: round(high, this.config.decimals),
      low: round(low, this.config.decimals),
      close: round(close, this.config.decimals),
      volume,
    };

    this.lastClose = close;
    this.time = this.time + CANDLE_MS;
    return candle;
  }
}

function round(v, decimals) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

export function createSimulators(startTime) {
  const map = new Map();
  for (const s of SYMBOLS) {
    map.set(s.id, new SymbolSimulator(s, startTime));
  }
  return map;
}

export { CANDLE_MS };
