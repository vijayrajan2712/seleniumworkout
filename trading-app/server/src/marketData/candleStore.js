const MAX_CANDLES_15M = 35 * 24 * 4; // ~35 days of 15m candles

// In-memory OHLCV store per symbol at the 15m base timeframe, with on-demand
// aggregation to daily/weekly/monthly candles for higher-timeframe levels.
export class CandleStore {
  constructor() {
    this.bySymbol = new Map();
  }

  init(symbolId, candles) {
    this.bySymbol.set(symbolId, candles.slice(-MAX_CANDLES_15M));
  }

  push(symbolId, candle) {
    const arr = this.bySymbol.get(symbolId) || [];
    arr.push(candle);
    if (arr.length > MAX_CANDLES_15M) arr.shift();
    this.bySymbol.set(symbolId, arr);
  }

  get15m(symbolId, limit = 200) {
    const arr = this.bySymbol.get(symbolId) || [];
    return arr.slice(-limit);
  }

  latest(symbolId) {
    const arr = this.bySymbol.get(symbolId) || [];
    return arr[arr.length - 1];
  }

  /** Aggregate 15m candles into higher timeframe buckets keyed by a bucket-id function. */
  aggregate(symbolId, bucketKeyFn) {
    const arr = this.bySymbol.get(symbolId) || [];
    const buckets = [];
    let current = null;
    let currentKey = null;
    for (const c of arr) {
      const key = bucketKeyFn(c.time);
      if (key !== currentKey) {
        if (current) buckets.push(current);
        current = { time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume };
        currentKey = key;
      } else {
        current.high = Math.max(current.high, c.high);
        current.low = Math.min(current.low, c.low);
        current.close = c.close;
        current.volume += c.volume;
      }
    }
    if (current) buckets.push(current);
    return buckets;
  }

  getDaily(symbolId) {
    return this.aggregate(symbolId, (t) => new Date(t).toISOString().slice(0, 10));
  }

  getWeekly(symbolId) {
    return this.aggregate(symbolId, (t) => isoWeekKey(new Date(t)));
  }

  getMonthly(symbolId) {
    return this.aggregate(symbolId, (t) => new Date(t).toISOString().slice(0, 7));
  }
}

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}
