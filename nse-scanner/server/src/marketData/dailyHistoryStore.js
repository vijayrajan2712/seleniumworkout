// Daily OHLCV history per symbol, fetched once at bootstrap (and refreshable once/day)
// from the historical REST API. This is what PDH/PDL, PMH/PML and CPR are computed from -
// deliberately separate from the live 5m CandleStore so we never need to pull weeks of
// intraday candles for 500 symbols just to know yesterday's high/low.
export class DailyHistoryStore {
  constructor() {
    this.bySymbol = new Map();
  }

  set(symbolId, dailyCandlesAscending) {
    this.bySymbol.set(symbolId, dailyCandlesAscending);
  }

  get(symbolId) {
    return this.bySymbol.get(symbolId) || [];
  }

  has(symbolId) {
    return (this.bySymbol.get(symbolId) || []).length >= 2;
  }

  /** Previous completed trading day's daily candle. */
  previousDay(symbolId) {
    const arr = this.get(symbolId);
    return arr.length >= 2 ? arr[arr.length - 2] : null;
  }

  /** Aggregate the stored daily candles into monthly buckets. */
  monthly(symbolId) {
    const arr = this.get(symbolId);
    const buckets = [];
    let current = null;
    let currentKey = null;
    for (const c of arr) {
      const key = new Date(c.time).toISOString().slice(0, 7);
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

  previousMonth(symbolId) {
    const months = this.monthly(symbolId);
    return months.length >= 2 ? months[months.length - 2] : null;
  }
}
