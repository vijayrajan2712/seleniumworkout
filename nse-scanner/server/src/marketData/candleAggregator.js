const CANDLE_MS = 5 * 60 * 1000;

/**
 * Converts a stream of raw ticks (LTP + cumulative day volume/buy-qty/sell-qty, as both the
 * real Dhan feed and the mock simulator emit) into 5-minute OHLCV candle fragments pushed
 * into a CandleStore. Shared by both the real WebSocket feed handler and the mock simulator
 * so the rest of the pipeline never needs to know which one is running.
 *
 * Also detects candle-close boundaries: when a tick's 5m bucket differs from the previous
 * tick's bucket for that symbol, the candle that was forming until now is "closed" - that's
 * the signal that the scan engine uses to re-run the signal/breakout-confirmation engine,
 * rather than re-evaluating on every single tick of a still-forming candle.
 */
export function makeTickAggregator(candleStore) {
  const lastCumulative = new Map(); // symbolId -> last cumulative day volume seen
  const lastBucketTime = new Map(); // symbolId -> 5m bucket time of the most recent tick

  return function ingestTick(symbolId, tick) {
    const bucketTime = Math.floor(tick.ltt / CANDLE_MS) * CANDLE_MS;
    const prevBucket = lastBucketTime.get(symbolId);
    const isNewBucket = prevBucket != null && bucketTime !== prevBucket;
    const closedCandle = isNewBucket ? candleStore.latest(symbolId) : null;
    lastBucketTime.set(symbolId, bucketTime);

    const prevVolume = lastCumulative.get(symbolId);
    const deltaVolume = prevVolume != null ? Math.max(0, tick.volume - prevVolume) : 0;
    lastCumulative.set(symbolId, tick.volume);

    candleStore.push(symbolId, {
      time: bucketTime,
      open: tick.ltp,
      high: tick.ltp,
      low: tick.ltp,
      close: tick.ltp,
      volume: deltaVolume,
      buyQuantity: tick.buyQuantity,
      sellQuantity: tick.sellQuantity,
    });

    return { isNewBucket, closedCandle };
  };
}

export { CANDLE_MS };
