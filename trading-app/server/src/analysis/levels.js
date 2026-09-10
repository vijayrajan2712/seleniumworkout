// Previous Day/Week/Month High-Low levels and breakout/breakdown detection.

function prevCompleted(candles) {
  // Last element is the currently-forming bucket; the one before it is the last *completed* period.
  if (candles.length < 2) return null;
  return candles[candles.length - 2];
}

export function computeHighLowLevels(dailyCandles, weeklyCandles, monthlyCandles) {
  const pd = prevCompleted(dailyCandles);
  const pw = prevCompleted(weeklyCandles);
  const pm = prevCompleted(monthlyCandles);

  return {
    pdh: pd ? pd.high : null,
    pdl: pd ? pd.low : null,
    pwh: pw ? pw.high : null,
    pwl: pw ? pw.low : null,
    pmh: pm ? pm.high : null,
    pml: pm ? pm.low : null,
  };
}

/**
 * Classify current price against a level as a breakout/breakdown event.
 * `prevPrice` lets us detect the *crossing* (edge) rather than just "is above/below",
 * so we only fire a signal at the moment of breakout, not on every tick while extended.
 */
export function detectCross(prevPrice, price, level) {
  if (level == null || prevPrice == null) return null;
  if (prevPrice <= level && price > level) return 'breakout_up';
  if (prevPrice >= level && price < level) return 'breakout_down';
  return null;
}

export function levelEvents(levels, prevClose, close) {
  const events = [];
  const pairs = [
    ['PDH', levels.pdh, 'day'],
    ['PDL', levels.pdl, 'day'],
    ['PWH', levels.pwh, 'week'],
    ['PWL', levels.pwl, 'week'],
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
