// Market structure on the 15m timeframe: fractal swing points, HH/HL vs LH/LL
// sequencing, and break-of-structure (BOS) detection.

const FRACTAL_ARM = 2; // candles required on each side to confirm a swing point

function findSwings(candles) {
  const swings = [];
  for (let i = FRACTAL_ARM; i < candles.length - FRACTAL_ARM; i++) {
    const c = candles[i];
    let isHigh = true;
    let isLow = true;
    for (let k = 1; k <= FRACTAL_ARM; k++) {
      if (candles[i - k].high >= c.high || candles[i + k].high >= c.high) isHigh = false;
      if (candles[i - k].low <= c.low || candles[i + k].low <= c.low) isLow = false;
    }
    if (isHigh) swings.push({ type: 'high', index: i, price: c.high, time: c.time });
    if (isLow) swings.push({ type: 'low', index: i, price: c.low, time: c.time });
  }
  return swings;
}

export function analyzeStructure(candles) {
  if (candles.length < FRACTAL_ARM * 2 + 3) {
    return { trend: 'insufficient_data', swings: [], bos: null };
  }

  const swings = findSwings(candles);
  const highs = swings.filter((s) => s.type === 'high').slice(-3);
  const lows = swings.filter((s) => s.type === 'low').slice(-3);

  let trend = 'ranging';
  if (highs.length >= 2 && lows.length >= 2) {
    const risingHighs = highs[highs.length - 1].price > highs[highs.length - 2].price;
    const risingLows = lows[lows.length - 1].price > lows[lows.length - 2].price;
    const fallingHighs = highs[highs.length - 1].price < highs[highs.length - 2].price;
    const fallingLows = lows[lows.length - 1].price < lows[lows.length - 2].price;

    if (risingHighs && risingLows) trend = 'uptrend'; // HH + HL
    else if (fallingHighs && fallingLows) trend = 'downtrend'; // LH + LL
    else trend = 'ranging';
  }

  // Break of structure: current close breaks the most recent opposing swing point.
  const lastClose = candles[candles.length - 1].close;
  const lastSwingHigh = highs[highs.length - 1];
  const lastSwingLow = lows[lows.length - 1];

  let bos = null;
  if (trend === 'downtrend' && lastSwingHigh && lastClose > lastSwingHigh.price) {
    bos = { direction: 'bullish', brokenLevel: lastSwingHigh.price, label: 'HH/LL structure' };
  } else if (trend === 'uptrend' && lastSwingLow && lastClose < lastSwingLow.price) {
    bos = { direction: 'bearish', brokenLevel: lastSwingLow.price, label: 'HH/LL structure' };
  }

  return {
    trend, // 'uptrend' (HH/HL) | 'downtrend' (LH/LL) | 'ranging'
    lastSwingHigh: lastSwingHigh || null,
    lastSwingLow: lastSwingLow || null,
    bos,
  };
}
