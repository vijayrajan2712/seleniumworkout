// Central Pivot Range (Pivot / BC / TC) plus standard extended floor pivots R1-R4 & S1-S4,
// computed from the previous trading day's completed OHLC.

export function computeCPR(prevDayCandle) {
  if (!prevDayCandle) return null;
  const { high, low, close } = prevDayCandle;

  const pivot = (high + low + close) / 3;
  const bc = (high + low) / 2;
  const tc = pivot - bc + pivot;
  const [top, bottom] = tc >= bc ? [tc, bc] : [bc, tc];
  const width = top - bottom;
  const range = high - low;

  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + range;
  const s2 = pivot - range;
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);
  const r4 = r3 + (r2 - r1);
  const s4 = s3 - (s1 - s2);

  return {
    pivot,
    tc: top,
    bc: bottom,
    width,
    narrow: width < range * 0.15,
    r1,
    r2,
    r3,
    r4,
    s1,
    s2,
    s3,
    s4,
  };
}

export function cprPosition(cpr, price) {
  if (!cpr || price == null) return null;
  if (price > cpr.tc) return { zone: 'above_cpr', bias: 'bullish', rung: ladderRung(cpr, price, 'resistance') };
  if (price < cpr.bc) return { zone: 'below_cpr', bias: 'bearish', rung: ladderRung(cpr, price, 'support') };
  return { zone: 'inside_cpr', bias: 'neutral', rung: null };
}

function ladderRung(cpr, price, side) {
  const levels =
    side === 'resistance'
      ? [
          ['R1', cpr.r1],
          ['R2', cpr.r2],
          ['R3', cpr.r3],
          ['R4', cpr.r4],
        ]
      : [
          ['S1', cpr.s1],
          ['S2', cpr.s2],
          ['S3', cpr.s3],
          ['S4', cpr.s4],
        ];
  let rung = null;
  for (const [label, level] of levels) {
    if (side === 'resistance' ? price > level : price < level) rung = label;
  }
  return rung;
}

/** Candle-close crossing of a pivot ladder rung (unconfirmed breakout of R1..R4 / S1..S4 or TC/BC). */
export function cprCrossEvents(cpr, prevClose, close) {
  if (!cpr || prevClose == null) return [];
  const events = [];
  const rungs = [
    ['R1', cpr.r1, 'bullish'],
    ['R2', cpr.r2, 'bullish'],
    ['R3', cpr.r3, 'bullish'],
    ['R4', cpr.r4, 'bullish'],
    ['S1', cpr.s1, 'bearish'],
    ['S2', cpr.s2, 'bearish'],
    ['S3', cpr.s3, 'bearish'],
    ['S4', cpr.s4, 'bearish'],
  ];
  for (const [label, level, dir] of rungs) {
    const crossedUp = prevClose <= level && close > level;
    const crossedDown = prevClose >= level && close < level;
    if (dir === 'bullish' && crossedUp) events.push({ label, level, direction: 'bullish' });
    if (dir === 'bearish' && crossedDown) events.push({ label, level, direction: 'bearish' });
  }
  if (prevClose <= cpr.tc && close > cpr.tc) events.push({ label: 'CPR-TC', level: cpr.tc, direction: 'bullish' });
  if (prevClose >= cpr.bc && close < cpr.bc) events.push({ label: 'CPR-BC', level: cpr.bc, direction: 'bearish' });
  return events;
}
