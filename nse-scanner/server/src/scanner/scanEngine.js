import { makeTickAggregator } from '../marketData/candleAggregator.js';
import { evaluateSymbol } from '../analysis/signalEngine.js';
import { BreakoutTracker } from '../analysis/breakoutConfirmation.js';
import { DeltaTracker } from '../analysis/deltaTracker.js';

const MIN_CANDLES_TO_EVALUATE = 3;

/**
 * Orchestrates the full pipeline for the whole Nifty 500 universe: bootstraps daily
 * history + security-id mapping from the market data source (mock or real Dhan),
 * starts the live tick feed, aggregates 5m candles, and runs the signal engine
 * (incl. next-candle breakout confirmation) every time a symbol's candle closes.
 * Scanner-only - never places orders; callers just get a stream of signals.
 */
export class ScanEngine {
  constructor({ universe, dhanClient, candleStore, dailyHistoryStore, newsSimulator }) {
    this.universe = universe;
    this.dhanClient = dhanClient;
    this.candleStore = candleStore;
    this.dailyHistoryStore = dailyHistoryStore;
    this.newsSimulator = newsSimulator;
    this.breakoutTracker = new BreakoutTracker();
    this.deltaTracker = new DeltaTracker();
    this.latestSignals = new Map();
    this._stopFeed = null;
  }

  async bootstrap({ onProgress } = {}) {
    await this.dhanClient.init(this.universe);
    this.dhanClient.mapSecurityIds(this.universe);
    onProgress?.('Fetching daily history for PDH/PDL, PMH/PML and CPR...');
    const dailyMap = await this.dhanClient.bootstrapDailyHistory(this.universe);
    for (const [symbol, candles] of dailyMap) this.dailyHistoryStore.set(symbol, candles);
    onProgress?.(`Daily history ready for ${dailyMap.size}/${this.universe.length} symbols`);
  }

  start({ onSignal, onTicksBatch }) {
    const ingestTick = makeTickAggregator(this.candleStore);
    const pendingTicks = new Map(); // symbolId -> latest LTP, flushed periodically

    this._stopFeed = this.dhanClient.startLiveFeed(this.universe, (symbolId, tick) => {
      pendingTicks.set(symbolId, tick.ltp);
      const { isNewBucket, closedCandle } = ingestTick(symbolId, tick);
      if (isNewBucket && closedCandle) {
        const signal = this._evaluate(symbolId, closedCandle);
        if (signal) onSignal(signal);
      }
    });

    this._tickFlushTimer = setInterval(() => {
      if (pendingTicks.size === 0) return;
      onTicksBatch(Object.fromEntries(pendingTicks));
      pendingTicks.clear();
    }, 1000);

    return () => {
      this._stopFeed?.();
      clearInterval(this._tickFlushTimer);
    };
  }

  _evaluate(symbolId, closedCandle) {
    // The candle store already has the *next* (forming) candle appended by the time we get
    // here; drop it so the signal engine only ever sees fully-closed candles.
    const series = this.candleStore.get5m(symbolId, 40);
    const closedSeries = series.slice(0, -1);
    if (closedSeries.length < MIN_CANDLES_TO_EVALUATE) return null;

    const previousDayCandle = this.dailyHistoryStore.previousDay(symbolId);
    const previousMonthCandle = this.dailyHistoryStore.previousMonth(symbolId);
    const newsSentiment = this.newsSimulator.getSentiment(symbolId);

    const signal = evaluateSymbol({
      symbolId,
      candles5m: closedSeries,
      previousDayCandle,
      previousMonthCandle,
      newsSentiment,
      breakoutTracker: this.breakoutTracker,
      deltaTracker: this.deltaTracker,
    });
    if (signal) this.latestSignals.set(symbolId, signal);
    return signal;
  }

  getSnapshot() {
    return Array.from(this.latestSignals.values());
  }

  getSignal(symbolId) {
    return this.latestSignals.get(symbolId) || null;
  }
}
