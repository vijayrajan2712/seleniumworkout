import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

const LEVEL_STYLE = {
  pdh: { color: '#4f8cff', title: 'PDH' },
  pdl: { color: '#4f8cff', title: 'PDL' },
  pwh: { color: '#b06fff', title: 'PWH' },
  pwl: { color: '#b06fff', title: 'PWL' },
  pmh: { color: '#ff8a4f', title: 'PMH' },
  pml: { color: '#ff8a4f', title: 'PML' },
};

const CPR_STYLE = {
  pivot: { color: '#e8e8e8', title: 'Pivot' },
  tc: { color: '#7fdc7f', title: 'TC' },
  bc: { color: '#7fdc7f', title: 'BC' },
  r1: { color: '#4caf50', title: 'R1' },
  r2: { color: '#4caf50', title: 'R2' },
  r3: { color: '#4caf50', title: 'R3' },
  r4: { color: '#4caf50', title: 'R4' },
  s1: { color: '#e05656', title: 'S1' },
  s2: { color: '#e05656', title: 'S2' },
  s3: { color: '#e05656', title: 'S3' },
  s4: { color: '#e05656', title: 'S4' },
};

function toChartTime(msEpoch) {
  return Math.floor(msEpoch / 1000);
}

export default function PriceChart({ symbol, initialCandles, signal, subscribeCandles, showLevels }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const priceLinesRef = useRef(new Map());

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0b0f14' }, textColor: '#c7ccd1' },
      grid: { vertLines: { color: '#161c24' }, horzLines: { color: '#161c24' } },
      rightPriceScale: { borderColor: '#232b36' },
      timeScale: { borderColor: '#232b36', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
      autoSize: true,
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      priceLinesRef.current = new Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load full candle history whenever the selected symbol changes.
  useEffect(() => {
    if (!seriesRef.current || !initialCandles) return;
    const data = initialCandles.map((c) => ({
      time: toChartTime(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
    priceLinesRef.current.forEach((line) => seriesRef.current.removePriceLine(line));
    priceLinesRef.current = new Map();
  }, [symbol?.id, initialCandles]);

  // Live candle updates over the WebSocket.
  useEffect(() => {
    if (!symbol || !subscribeCandles) return undefined;
    return subscribeCandles(symbol.id, (candle) => {
      seriesRef.current?.update({
        time: toChartTime(candle.time),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
    });
  }, [symbol, subscribeCandles]);

  // Draw / update level overlays (PDH-PML, CPR + R1-R4/S1-S4, POC) from the latest signal.
  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !signal) return;

    const desired = new Map();
    if (showLevels.hilo) {
      for (const [key, style] of Object.entries(LEVEL_STYLE)) {
        const value = signal.levels?.[key];
        if (value != null) desired.set(`hilo:${key}`, { value, ...style, lineStyle: 2 });
      }
    }
    if (showLevels.cpr && signal.cpr) {
      for (const [key, style] of Object.entries(CPR_STYLE)) {
        const value = signal.cpr[key];
        if (value != null) desired.set(`cpr:${key}`, { value, ...style, lineStyle: key === 'pivot' ? 0 : 3 });
      }
    }
    if (showLevels.poc && signal.volumeProfile?.poc != null) {
      desired.set('poc', { value: signal.volumeProfile.poc, color: '#f5c518', title: 'POC', lineStyle: 0 });
    }

    const current = priceLinesRef.current;
    for (const key of current.keys()) {
      if (!desired.has(key)) {
        series.removePriceLine(current.get(key));
        current.delete(key);
      }
    }
    for (const [key, opts] of desired.entries()) {
      const lineOptions = {
        price: opts.value,
        color: opts.color,
        lineWidth: 1,
        lineStyle: opts.lineStyle,
        axisLabelVisible: true,
        title: opts.title,
      };
      if (current.has(key)) {
        current.get(key).applyOptions(lineOptions);
      } else {
        current.set(key, series.createPriceLine(lineOptions));
      }
    }
  }, [signal, showLevels]);

  return <div ref={containerRef} className="price-chart" />;
}
