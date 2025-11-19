
import React, { useEffect, useState } from 'react';
import { X, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { CoinData } from '../types';

interface Props {
  coin: CoinData;
  isOpen: boolean;
  onClose: () => void;
}

type Signal = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

interface Indicator {
  name: string;
  value: number;
  action: 'BUY' | 'SELL' | 'NEUTRAL';
}

export const TechAnalysisModal: React.FC<Props> = ({ coin, isOpen, onClose }) => {
  const [summary, setSummary] = useState<Signal>('NEUTRAL');
  const [oscillators, setOscillators] = useState<Indicator[]>([]);
  const [movingAverages, setMovingAverages] = useState<Indicator[]>([]);

  useEffect(() => {
    if (isOpen) {
      generateAnalysis();
    }
  }, [isOpen, coin]);

  const generateAnalysis = () => {
    // Simulate calculation based on price change
    const trend = coin.price_change_percentage_24h;
    const isBullish = trend > 0;
    
    // Generate mock indicators
    const rsiVal = isBullish ? 55 + Math.random() * 20 : 45 - Math.random() * 20;
    const macdVal = trend * 10 + (Math.random() * 5);
    
    const newOscillators: Indicator[] = [
      { name: 'RSI (14)', value: rsiVal, action: rsiVal > 70 ? 'SELL' : rsiVal < 30 ? 'BUY' : 'NEUTRAL' },
      { name: 'Stoch %K', value: isBullish ? 60 : 40, action: 'NEUTRAL' },
      { name: 'CCI (20)', value: isBullish ? 105 : -90, action: isBullish ? 'BUY' : 'SELL' },
      { name: 'MACD Level', value: macdVal, action: macdVal > 0 ? 'BUY' : 'SELL' },
    ];

    const newMAs: Indicator[] = [
      { name: 'EMA (10)', value: coin.current_price * (isBullish ? 0.99 : 1.01), action: isBullish ? 'BUY' : 'SELL' },
      { name: 'SMA (10)', value: coin.current_price * (isBullish ? 0.98 : 1.02), action: isBullish ? 'BUY' : 'SELL' },
      { name: 'EMA (50)', value: coin.current_price * (isBullish ? 0.95 : 1.05), action: isBullish ? 'BUY' : 'SELL' },
      { name: 'SMA (200)', value: coin.current_price * 0.90, action: 'BUY' }, // Long term usually buy for top assets
    ];

    setOscillators(newOscillators);
    setMovingAverages(newMAs);

    // Calculate Summary
    const buyCount = [...newOscillators, ...newMAs].filter(i => i.action === 'BUY').length;
    const sellCount = [...newOscillators, ...newMAs].filter(i => i.action === 'SELL').length;

    if (buyCount > sellCount + 3) setSummary('STRONG_BUY');
    else if (buyCount > sellCount) setSummary('BUY');
    else if (sellCount > buyCount + 3) setSummary('STRONG_SELL');
    else if (sellCount > buyCount) setSummary('SELL');
    else setSummary('NEUTRAL');
  };

  if (!isOpen) return null;

  const getSignalColor = (signal: string) => {
    if (signal.includes('BUY')) return 'text-green-400';
    if (signal.includes('SELL')) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSignalBg = (signal: string) => {
    if (signal.includes('BUY')) return 'bg-green-500/10 border-green-500/50';
    if (signal.includes('SELL')) return 'bg-red-500/10 border-red-500/50';
    return 'bg-gray-800 border-gray-700';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
           <h2 className="text-xl font-bold flex items-center gap-2 text-white">
             <Activity className="w-5 h-5 text-brand-500" /> Технический Анализ: {coin.name}
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
           
           {/* Summary Gauge (Simplified UI) */}
           <div className="mb-8 text-center">
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Резюме (1Д)</div>
              <div className={`inline-block px-6 py-2 rounded-full border-2 font-bold text-xl ${getSignalBg(summary)} ${getSignalColor(summary)}`}>
                 {summary.replace('_', ' ')}
              </div>
              <div className="mt-4 flex justify-center gap-1">
                 {['STRONG_SELL', 'SELL', 'NEUTRAL', 'BUY', 'STRONG_BUY'].map((s) => (
                    <div key={s} className={`h-2 w-12 rounded-full ${s === summary ? (s.includes('BUY') ? 'bg-green-500' : s.includes('SELL') ? 'bg-red-500' : 'bg-gray-500') : 'bg-gray-800'}`}></div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Oscillators */}
              <div>
                 <h3 className="font-bold text-white mb-4 border-b border-gray-800 pb-2">Осцилляторы</h3>
                 <div className="space-y-3">
                    {oscillators.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">{item.name}</span>
                          <div className="flex items-center gap-3">
                             <span className="font-mono text-white">{item.value.toFixed(2)}</span>
                             <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSignalBg(item.action)} ${getSignalColor(item.action)}`}>
                                {item.action === 'NEUTRAL' ? 'N' : item.action}
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Moving Averages */}
              <div>
                 <h3 className="font-bold text-white mb-4 border-b border-gray-800 pb-2">Скользящие Средние</h3>
                 <div className="space-y-3">
                    {movingAverages.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">{item.name}</span>
                          <div className="flex items-center gap-3">
                             <span className="font-mono text-white">{item.value.toFixed(4)}</span>
                             <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSignalBg(item.action)} ${getSignalColor(item.action)}`}>
                                {item.action}
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="mt-8 text-xs text-gray-500 text-center bg-gray-900/30 p-3 rounded-lg">
              Отказ от ответственности: Технический анализ генерируется алгоритмически и не является финансовым советом. Торгуйте на свой страх и риск.
           </div>

        </div>
      </div>
    </div>
  );
};
