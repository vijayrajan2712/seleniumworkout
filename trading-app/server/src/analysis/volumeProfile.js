// Volume profile / Point of Control (POC): buckets traded volume by price over a
// lookback window and finds the price level with the highest traded volume.

const DEFAULT_LOOKBACK = 4 * 24 * 4; // last ~4 days of 15m candles
const BUCKETS = 40;

export function computeVolumeProfile(candles, lookback = DEFAULT_LOOKBACK) {
  const window = candles.slice(-lookback);
  if (window.length === 0) return null;

  let hi = -Infinity;
  let lo = Infinity;
  for (const c of window) {
    if (c.high > hi) hi = c.high;
    if (c.low < lo) lo = c.low;
  }
  if (!isFinite(hi) || !isFinite(lo) || hi === lo) return null;

  const bucketSize = (hi - lo) / BUCKETS;
  const volumes = new Array(BUCKETS).fill(0);

  for (const c of window) {
    // Distribute each candle's volume evenly across the price buckets it spans.
    const startBucket = Math.max(0, Math.floor((c.low - lo) / bucketSize));
    const endBucket = Math.min(BUCKETS - 1, Math.floor((c.high - lo) / bucketSize));
    const span = endBucket - startBucket + 1;
    const perBucket = c.volume / span;
    for (let b = startBucket; b <= endBucket; b++) volumes[b] += perBucket;
  }

  let pocIndex = 0;
  for (let b = 1; b < BUCKETS; b++) {
    if (volumes[b] > volumes[pocIndex]) pocIndex = b;
  }
  const poc = lo + bucketSize * (pocIndex + 0.5);

  const totalVolume = volumes.reduce((a, b) => a + b, 0);
  // Value area = tightest band of buckets around POC containing ~70% of volume.
  let vaVolume = volumes[pocIndex];
  let vaLowIdx = pocIndex;
  let vaHighIdx = pocIndex;
  while (vaVolume < totalVolume * 0.7 && (vaLowIdx > 0 || vaHighIdx < BUCKETS - 1)) {
    const below = vaLowIdx > 0 ? volumes[vaLowIdx - 1] : -1;
    const above = vaHighIdx < BUCKETS - 1 ? volumes[vaHighIdx + 1] : -1;
    if (above >= below) {
      vaHighIdx++;
      vaVolume += volumes[vaHighIdx];
    } else {
      vaLowIdx--;
      vaVolume += volumes[vaLowIdx];
    }
  }

  return {
    poc,
    valueAreaHigh: lo + bucketSize * (vaHighIdx + 1),
    valueAreaLow: lo + bucketSize * vaLowIdx,
    rangeHigh: hi,
    rangeLow: lo,
  };
}

export function pocPosition(profile, price) {
  if (!profile || price == null) return null;
  const diffPct = ((price - profile.poc) / profile.poc) * 100;
  if (price > profile.valueAreaHigh) return { zone: 'above_value_area', bias: 'bullish', diffPct };
  if (price < profile.valueAreaLow) return { zone: 'below_value_area', bias: 'bearish', diffPct };
  if (price > profile.poc) return { zone: 'above_poc', bias: 'mildly_bullish', diffPct };
  if (price < profile.poc) return { zone: 'below_poc', bias: 'mildly_bearish', diffPct };
  return { zone: 'at_poc', bias: 'neutral', diffPct };
}
