// Breakout confirmation rule (as specified): a level breakout on candle close is only a
// real signal once the NEXT candle's open is itself beyond that breakout candle's close
// (above it for a bullish breakout, below it for a bearish one). This filters out candles
// that poke through a level and close there, but immediately get rejected on the next open -
// classic fakeout/wick-trap. Unconfirmed breakouts are tracked and resolved one candle later.
export class BreakoutTracker {
  constructor() {
    this.pending = new Map(); // symbolId -> [{ label, level, direction, breakoutClose, breakoutTime }]
  }

  /**
   * Call once per symbol on every new candle close, in order.
   * `rawEvents` are this candle's freshly-detected (unconfirmed) breakout events.
   * Returns { confirmed, invalidated } resolved from *previous* candle's pending breakouts
   * using this candle's open.
   */
  onCandleClose(symbolId, candle, rawEvents) {
    const pendingForSymbol = this.pending.get(symbolId) || [];
    const confirmed = [];
    const invalidated = [];

    for (const p of pendingForSymbol) {
      const isConfirmed =
        p.direction === 'bullish' ? candle.open > p.breakoutClose : candle.open < p.breakoutClose;
      if (isConfirmed) {
        confirmed.push({ ...p, confirmedAt: candle.time, confirmOpen: candle.open });
      } else {
        invalidated.push({ ...p, invalidatedAt: candle.time, invalidatedOpen: candle.open });
      }
    }

    // Register this candle's new breakout events to be resolved on the *next* candle's open.
    const nextPending = rawEvents.map((ev) => ({
      label: ev.label,
      level: ev.level,
      direction: ev.direction,
      breakoutClose: candle.close,
      breakoutTime: candle.time,
    }));
    this.pending.set(symbolId, nextPending);

    return { confirmed, invalidated };
  }
}
