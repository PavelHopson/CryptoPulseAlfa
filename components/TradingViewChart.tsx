import React, { useEffect, useRef } from 'react';
import { CandleData } from '../types';

interface Props {
  data: CandleData[];
  height?: number;
  isPositive?: boolean;
}

export const TradingViewChart: React.FC<Props> = ({ data, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Access global variable from CDN
    const { createChart } = (window as any).LightweightCharts;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#334155', style: 1, visible: true },
        horzLines: { color: '#334155', style: 1, visible: true },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981', // Green
      downColor: '#ef4444', // Red
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // Run once on mount

  // Update Data
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Sort data just in case
      const sortedData = [...data].sort((a, b) => a.originalTime - b.originalTime);
      seriesRef.current.setData(sortedData);
      
      // Optionally fit content only on initial load or timeframe change (if huge jump)
      // But for live updates, we usually want to keep user zoom/scroll position
    }
  }, [data]);

  // Update Height
  useEffect(() => {
    if (chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({ height });
    }
  }, [height]);

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">Loading Chart...</div>;

  return <div ref={chartContainerRef} className="w-full" style={{ height }} />;
};