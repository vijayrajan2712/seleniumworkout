// "Institutional activity" heuristic - IMPORTANT CAVEAT: real FII/DII/institutional flow
// is published by NSE only end-of-day (bulk/block deal reports), not live, and Dhan's
// retail market-data API does not expose confirmed institutional order tagging in real time.
//
// This module instead approximates a "big money footprint" from what IS available live:
// the cumulative day buy/sell quantity fields Dhan's Quote packet provides, converted to a
// per-candle delta, plus notional value (price x volume) size. A large, one-sided quantity
// delta paired with an outsized notional value is a reasonable live proxy for large
// participants moving size - but it is a heuristic, not confirmed institutional data.

const IMBALANCE_THRESHOLD = 0.35; // |buy-sell| / (buy+sell) delta ratio
const LARGE_NOTIONAL_INR = 5_000_000; // ₹50 lakh in a single 5m candle is a reasonable "large" bar for a mid/large-cap

export function detectInstitutionalFootprint(candles) {
  if (candles.length < 2) return null;
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  if (current.buyQuantity == null || current.sellQuantity == null) {
    return { available: false };
  }

  const buyDelta = Math.max(0, current.buyQuantity - (prev.buyQuantity ?? current.buyQuantity));
  const sellDelta = Math.max(0, current.sellQuantity - (prev.sellQuantity ?? current.sellQuantity));
  const totalDelta = buyDelta + sellDelta;
  const imbalance = totalDelta > 0 ? (buyDelta - sellDelta) / totalDelta : 0;

  const notional = current.volume * current.close;
  const isLarge = notional >= LARGE_NOTIONAL_INR;
  const isSkewed = Math.abs(imbalance) >= IMBALANCE_THRESHOLD;

  return {
    available: true,
    buyDelta,
    sellDelta,
    imbalance: round2(imbalance),
    notional: Math.round(notional),
    flagged: isLarge && isSkewed,
    direction: imbalance > 0 ? 'buy_side' : imbalance < 0 ? 'sell_side' : 'neutral',
  };
}

function round2(v) {
  return Math.round(v * 100) / 100;
}
