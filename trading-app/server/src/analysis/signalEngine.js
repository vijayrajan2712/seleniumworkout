import { computeHighLowLevels, levelEvents } from './levels.js';
import { analyzeStructure } from './structure.js';
import { computeCPR, cprPosition, cprCrossEvents } from './cpr.js';
import { computeVolumeProfile, pocPosition } from './volumeProfile.js';

// Confluence weights. Positive score => bullish, negative => bearish.
const WEIGHTS = {
  levelBreakout: 2, // PDH/PDL/PWH/PWL/PMH/PML breakout/breakdown
  structureBos: 2, // break of structure
  structureTrend: 1, // HH/HL or LH/LL trend alignment
  cprZone: 1.5, // price above/below CPR band
  cprLadder: 1, // each pivot rung broken (R1-R4 / S1-S4)
  poc: 1, // price vs volume POC / value area
  news: 1.5, // rolling news sentiment
};

function classify(score) {
  if (score >= 5) return 'STRONG BUY';
  if (score >= 2) return 'BUY';
  if (score <= -5) return 'STRONG SELL';
  if (score <= -2) return 'SELL';
  return 'NEUTRAL';
}

/**
 * Runs the full multi-confluence analysis for one symbol given its candle history
 * and current news sentiment. Returns the level/structure/CPR/volume snapshot plus
 * a scored signal with a human-readable reasoning trail for the terminal feed.
 */
export function evaluateSymbol({ symbolId, candles15m, dailyCandles, weeklyCandles, monthlyCandles, newsSentiment }) {
  if (candles15m.length < 10) return null;

  const current = candles15m[candles15m.length - 1];
  const prev = candles15m[candles15m.length - 2];

  const levels = computeHighLowLevels(dailyCandles, weeklyCandles, monthlyCandles);
  const lvlEvents = levelEvents(levels, prev?.close, current.close);

  const structure = analyzeStructure(candles15m.slice(-60));

  const prevDayCandle = dailyCandles[dailyCandles.length - 2] || null;
  const cpr = computeCPR(prevDayCandle);
  const cprPos = cprPosition(cpr, current.close);
  const cprEvents = cpr ? cprCrossEvents(cpr, prev?.close, current.close) : [];

  const volumeProfile = computeVolumeProfile(candles15m);
  const pocPos = pocPosition(volumeProfile, current.close);

  // `events` = things that happened on THIS candle (breakouts/crosses) - fire once, terminal-worthy.
  // `context` = persistent state description (trend, zone) - true every tick, used for the levels panel.
  const events = [];
  const context = [];
  let score = 0;

  for (const ev of lvlEvents) {
    const dir = ev.direction === 'bullish' ? 1 : -1;
    score += dir * WEIGHTS.levelBreakout;
    events.push(`${ev.label} ${ev.kind.toUpperCase()} @ ${fmt(ev.level)} (${ev.timeframe} level) → ${ev.direction}`);
  }

  if (structure.bos) {
    const dir = structure.bos.direction === 'bullish' ? 1 : -1;
    score += dir * WEIGHTS.structureBos;
    events.push(
      `15m Break of Structure (${structure.bos.label}) through ${fmt(structure.bos.brokenLevel)} → ${structure.bos.direction}`
    );
  }
  if (structure.trend === 'uptrend' || structure.trend === 'downtrend') {
    const dir = structure.trend === 'uptrend' ? 1 : -1;
    score += dir * WEIGHTS.structureTrend;
    context.push(`15m structure printing ${structure.trend === 'uptrend' ? 'HH/HL' : 'LH/LL'} (${structure.trend})`);
  }

  if (cprPos && cprPos.zone !== 'inside_cpr') {
    const dir = cprPos.bias === 'bullish' ? 1 : -1;
    score += dir * WEIGHTS.cprZone;
    context.push(
      `Price ${cprPos.zone === 'above_cpr' ? 'above' : 'below'} CPR (TC/BC band)${
        cprPos.rung ? `, beyond ${cprPos.rung}` : ''
      } → ${cprPos.bias}`
    );
  } else if (cprPos) {
    context.push('Price inside CPR band → range-bound / awaiting breakout');
  }
  if (cpr?.narrow) {
    context.push('Narrow CPR detected → elevated odds of a trend day');
  }

  for (const ev of cprEvents) {
    const dir = ev.direction === 'bullish' ? 1 : -1;
    score += dir * WEIGHTS.cprLadder;
    events.push(`Pivot ladder cross: ${ev.label} @ ${fmt(ev.level)} → ${ev.direction}`);
  }

  if (pocPos && pocPos.zone !== 'at_poc') {
    const dir = pocPos.bias.includes('bullish') ? 1 : -1;
    const weight = pocPos.zone.includes('value_area') ? WEIGHTS.poc : WEIGHTS.poc * 0.5;
    score += dir * weight;
    context.push(
      `Price ${pocPos.zone.replace(/_/g, ' ')} (POC ${fmt(volumeProfile.poc)}, ${pocPos.diffPct.toFixed(2)}% away)`
    );
  }

  if (Math.abs(newsSentiment) > 0.15) {
    const dir = newsSentiment > 0 ? 1 : -1;
    score += dir * WEIGHTS.news * Math.min(Math.abs(newsSentiment), 1);
    context.push(
      `News sentiment ${newsSentiment > 0 ? 'positive' : 'negative'} (${newsSentiment.toFixed(2)}) across recent headlines`
    );
  }

  const verdict = classify(score);
  const confidence = Math.min(99, Math.round((Math.abs(score) / 9) * 100));

  return {
    symbolId,
    time: current.time,
    price: current.close,
    verdict,
    score: round2(score),
    confidence,
    events,
    context,
    reasons: [...events, ...context],
    levels,
    structure: { trend: structure.trend, bos: structure.bos },
    cpr,
    cprPosition: cprPos,
    volumeProfile,
    pocPosition: pocPos,
    newsSentiment,
  };
}

function fmt(v) {
  return v == null ? 'n/a' : Number(v).toFixed(v < 10 ? 5 : v < 1000 ? 3 : 2);
}

function round2(v) {
  return Math.round(v * 100) / 100;
}
