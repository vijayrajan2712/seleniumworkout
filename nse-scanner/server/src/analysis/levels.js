// PDH/PDL (previous day) and PMH/PML (previous month) breakout/breakdown detection.

export function computeHighLowLevels(previousDayCandle, previousMonthCandle) {
  return {
    pdh: previousDayCandle ? previousDayCandle.high : null,
    pdl: previousDayCandle ? previousDayCandle.low : null,
    pmh: previousMonthCandle ? previousMonthCandle.high : null,
    pml: previousMonthCandle ? previousMonthCandle.low : null,
  };
}

/** Classify a level crossing as a breakout/breakdown *candle event* (close-based, unconfirmed). */
export function detectCross(prevClose, close, level) {
  if (level == null || prevClose == null) return null;
  if (prevClose <= level && close > level) return 'breakout_up';
  if (prevClose >= level && close < level) return 'breakout_down';
  return null;
}

export function levelEvents(levels, prevClose, close) {
  const events = [];
  const pairs = [
    ['PDH', levels.pdh, 'day'],
    ['PDL', levels.pdl, 'day'],
    ['PMH', levels.pmh, 'month'],
    ['PML', levels.pml, 'month'],
  ];
  for (const [label, level, tf] of pairs) {
    const cross = detectCross(prevClose, close, level);
    if (cross) {
      const isHigh = label.endsWith('H');
      events.push({
        label,
        timeframe: tf,
        level,
        direction: cross === 'breakout_up' ? 'bullish' : 'bearish',
        kind: isHigh
          ? cross === 'breakout_up'
            ? 'breakout'
            : 'rejection'
          : cross === 'breakout_down'
          ? 'breakdown'
          : 'reclaim',
      });
    }
  }
  return events;
}
