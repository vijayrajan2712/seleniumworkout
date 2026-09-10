const MAX_CANDLES_5M = 3 * 75; // keep ~3 trading days of 5m candles (75 candles/day, NSE cash session ~6.25h)

// In-memory 5-minute OHLCV store per symbol, built live from tick data (WS feed in
// real mode, simulator in mock mode). Daily/monthly history for PDH/PDL/PMH/PML/CPR
// comes from a separate DailyHistoryStore fed by the historical REST API - we don't
// aggregate weeks of 5m candles for 500 symbols just to get yesterday's high/low.
export class CandleStore {
  constructor() {
    this.bySymbol = new Map();
  }

  init(symbolId, candles) {
    this.bySymbol.set(symbolId, candles.slice(-MAX_CANDLES_5M));
  }

  /** Upsert a candle: merges into the last candle if it shares the same 5m bucket time. */
  push(symbolId, candle) {
    const arr = this.bySymbol.get(symbolId) || [];
    const last = arr[arr.length - 1];
    if (last && last.time === candle.time) {
      last.high = Math.max(last.high, candle.high);
      last.low = Math.min(last.low, candle.low);
      last.close = candle.close;
      last.volume += candle.volume;
      if (candle.buyQuantity != null) last.buyQuantity = candle.buyQuantity;
      if (candle.sellQuantity != null) last.sellQuantity = candle.sellQuantity;
      return last;
    }
    arr.push(candle);
    if (arr.length > MAX_CANDLES_5M) arr.shift();
    this.bySymbol.set(symbolId, arr);
    return candle;
  }

  get5m(symbolId, limit = 100) {
    const arr = this.bySymbol.get(symbolId) || [];
    return arr.slice(-limit);
  }

  latest(symbolId) {
    const arr = this.bySymbol.get(symbolId) || [];
    return arr[arr.length - 1];
  }

  hasSymbol(symbolId) {
    return this.bySymbol.has(symbolId) && this.bySymbol.get(symbolId).length > 0;
  }

  allSymbolIds() {
    return Array.from(this.bySymbol.keys());
  }
}
