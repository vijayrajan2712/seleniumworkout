import { computeHighLowLevels, levelEvents } from './levels.js';
import { computeCPR, cprPosition, cprCrossEvents } from './cpr.js';
import { computeVolumeProfile, pocPosition } from './volumeProfile.js';
import { detectUnusualVolume } from './unusualVolume.js';
import { detectInstitutionalFootprint } from './institutionalHeuristic.js';

const WEIGHTS = {
  confirmedBreakout: 2.5, // PDH/PDL/PMH/PML or CPR/pivot breakout, confirmed by next-candle open
  cprZone: 1, // price above/below CPR band (context, not itself a breakout)
  poc: 1,
  unusualVolume: 1.5,
  institutional: 1.5,
  news: 1.5,
};

function classify(score) {
  if (score >= 5) return 'STRONG BUY';
  if (score >= 2) return 'BUY';
  if (score <= -5) return 'STRONG SELL';
  if (score <= -2) return 'SELL';
  return 'NEUTRAL';
}

/**
 * Full multi-confluence scan for one stock on its latest 5m candle close.
 * `breakoutTracker` is the shared, stateful BreakoutTracker instance (one per scan engine)
 * that turns raw close-based breakouts into next-candle-open-confirmed signals.
 */
export function evaluateSymbol({ symbolId, candles5m, previousDayCandle, previousMonthCandle, newsSentiment, breakoutTracker }) {
  if (candles5m.length < 3) return null;

  const current = candles5m[candles5m.length - 1];
  const prev = candles5m[candles5m.length - 2];

  const levels = computeHighLowLevels(previousDayCandle, previousMonthCandle);
  const rawLevelEvents = levelEvents(levels, prev?.close, current.close);

  const cpr = computeCPR(previousDayCandle);
  const cprPos = cprPosition(cpr, current.close);
  const rawCprEvents = cpr ? cprCrossEvents(cpr, prev?.close, current.close) : [];

  const { confirmed, invalidated } = breakoutTracker.onCandleClose(symbolId, current, [
    ...rawLevelEvents,
    ...rawCprEvents,
  ]);

  const volumeProfile = computeVolumeProfile(candles5m);
  const pocPos = pocPosition(volumeProfile, current.close);
  const unusualVolume = detectUnusualVolume(candles5m);
  const institutional = detectInstitutionalFootprint(candles5m);

  const events = [];
  const context = [];
  let score = 0;

  for (const b of confirmed) {
    const dir = b.direction === 'bullish' ? 1 : -1;
    score += dir * WEIGHTS.confirmedBreakout;
    events.push(
      `${b.label} CONFIRMED ${b.direction === 'bullish' ? 'BREAKOUT' : 'BREAKDOWN'} @ ${fmt(b.level)} - candle closed ${fmt(
        b.breakoutClose
      )}, next candle opened ${fmt(b.confirmOpen)} → ${b.direction}`
    );
  }
  for (const b of invalidated) {
    context.push(
      `${b.label} breakout at ${fmt(b.level)} FAILED confirmation (close ${fmt(b.breakoutClose)}, next open ${fmt(
        b.invalidatedOpen
      )}) - fakeout`
    );
  }

  if (cprPos && cprPos.zone !== 'inside_cpr') {
    const dir = cprPos.bias === 'bullish' ? 1 : -1;
    score += dir * WEIGHTS.cprZone;
    context.push(
      `Price ${cprPos.zone === 'above_cpr' ? 'above' : 'below'} CPR${cprPos.rung ? `, beyond ${cprPos.rung}` : ''} → ${cprPos.bias}`
    );
  } else if (cprPos) {
    context.push('Price inside CPR band → range-bound');
  }
  if (cpr?.narrow) context.push('Narrow CPR → elevated odds of a trend day');

  if (pocPos && pocPos.zone !== 'at_poc') {
    const dir = pocPos.bias.includes('bullish') ? 1 : -1;
    const weight = pocPos.zone.includes('value_area') ? WEIGHTS.poc : WEIGHTS.poc * 0.5;
    score += dir * weight;
    context.push(`Price ${pocPos.zone.replace(/_/g, ' ')} (POC ${fmt(volumeProfile.poc)}, ${pocPos.diffPct.toFixed(2)}% away)`);
  }

  if (unusualVolume?.unusual) {
    const dir = current.close >= current.open ? 1 : -1;
    score += dir * WEIGHTS.unusualVolume;
    events.push(
      `Unusual volume: ${unusualVolume.volumeRatio}x avg (₹${(unusualVolume.currentNotional / 100000).toFixed(1)}L notional)`
    );
  }

  if (institutional?.available && institutional.flagged) {
    const dir = institutional.direction === 'buy_side' ? 1 : institutional.direction === 'sell_side' ? -1 : 0;
    score += dir * WEIGHTS.institutional;
    events.push(
      `Large ${institutional.direction.replace('_', ' ')} footprint (heuristic): imbalance ${institutional.imbalance}, ₹${(
        institutional.notional / 100000
      ).toFixed(1)}L notional`
    );
  }

  if (Math.abs(newsSentiment) > 0.15) {
    const dir = newsSentiment > 0 ? 1 : -1;
    score += dir * WEIGHTS.news * Math.min(Math.abs(newsSentiment), 1);
    context.push(`News/sector sentiment ${newsSentiment > 0 ? 'positive' : 'negative'} (${newsSentiment.toFixed(2)})`);
  }

  const verdict = classify(score);
  const confidence = Math.min(99, Math.round((Math.abs(score) / 9) * 100));

  return {
    symbolId,
    time: current.time,
    price: current.close,
    changePct: previousDayCandle ? round2(((current.close - previousDayCandle.close) / previousDayCandle.close) * 100) : null,
    verdict,
    score: round2(score),
    confidence,
    events,
    context,
    reasons: [...events, ...context],
    levels,
    cpr,
    cprPosition: cprPos,
    volumeProfile,
    pocPosition: pocPos,
    unusualVolume,
    institutional,
    newsSentiment,
  };
}

function fmt(v) {
  return v == null ? 'n/a' : Number(v).toFixed(2);
}
function round2(v) {
  return Math.round(v * 100) / 100;
}
