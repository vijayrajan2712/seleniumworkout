// Unusual volume / unusual activity detection: flags a candle whose volume or notional
// value (price x volume) is a statistical outlier versus that stock's own recent behaviour.
// This is a live-data-only heuristic (no dependency on time-of-day historical baselines,
// which would require pulling weeks of 5m data for 500 symbols).

const LOOKBACK = 20; // trailing candles used as the "normal" baseline (~100 min)
const VOLUME_SPIKE_RATIO = 2.5; // candle volume vs trailing average
const NOTIONAL_SPIKE_RATIO = 2.5; // candle notional value vs trailing average

export function detectUnusualVolume(candles) {
  if (candles.length < LOOKBACK + 1) return null;

  const current = candles[candles.length - 1];
  const baseline = candles.slice(-LOOKBACK - 1, -1); // the LOOKBACK candles *before* current

  const avgVolume = mean(baseline.map((c) => c.volume));
  const avgNotional = mean(baseline.map((c) => c.volume * ((c.high + c.low) / 2)));

  const currentNotional = current.volume * current.close;
  const volumeRatio = avgVolume > 0 ? current.volume / avgVolume : 0;
  const notionalRatio = avgNotional > 0 ? currentNotional / avgNotional : 0;

  const unusualVolume = volumeRatio >= VOLUME_SPIKE_RATIO;
  const unusualNotional = notionalRatio >= NOTIONAL_SPIKE_RATIO;

  return {
    volumeRatio: round2(volumeRatio),
    notionalRatio: round2(notionalRatio),
    currentVolume: current.volume,
    avgVolume: Math.round(avgVolume),
    currentNotional: Math.round(currentNotional),
    unusual: unusualVolume || unusualNotional,
    unusualVolume,
    unusualNotional,
  };
}

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function round2(v) {
  return Math.round(v * 100) / 100;
}
