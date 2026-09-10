// Running order-flow delta in Rupee crore, accumulated across the trading day.
// Every 5m candle close contributes one delta value (net buy-sell quantity x close
// price, converted to crore). A positive candle delta adds to the running "positive
// delta" total; a negative candle delta subtracts into a separate "negative delta"
// total - so the two columns show, independently, how much cumulative buying pressure
// vs. selling pressure has passed through the stock today.
const CRORE = 1_00_00_000; // 1 crore = 1,00,00,000

export class DeltaTracker {
  constructor() {
    this.state = new Map(); // symbolId -> { positiveDeltaCr, negativeDeltaCr }
  }

  /** candle: the closed 5m candle with buyQuantity/sellQuantity (cumulative-as-of-close). */
  update(symbolId, buyDelta, sellDelta, price) {
    const deltaCr = ((buyDelta - sellDelta) * price) / CRORE;
    const prev = this.state.get(symbolId) || { positiveDeltaCr: 0, negativeDeltaCr: 0 };
    const next = {
      positiveDeltaCr: prev.positiveDeltaCr + (deltaCr > 0 ? deltaCr : 0),
      negativeDeltaCr: prev.negativeDeltaCr + (deltaCr < 0 ? deltaCr : 0),
    };
    this.state.set(symbolId, next);
    return { deltaCr: round2(deltaCr), ...roundState(next) };
  }

  get(symbolId) {
    return roundState(this.state.get(symbolId) || { positiveDeltaCr: 0, negativeDeltaCr: 0 });
  }
}

function roundState(s) {
  return { positiveDeltaCr: round2(s.positiveDeltaCr), negativeDeltaCr: round2(s.negativeDeltaCr) };
}
function round2(v) {
  return Math.round(v * 100) / 100;
}
