
import React, { useEffect, useState } from 'react';
import { X, Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { CoinData } from '../types';

interface Props {
  coin: CoinData;
  isOpen: boolean;
  onClose: () => void;
}

type Signal = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
type AnalysisTimeframe = '1M' | '5M' | '15M' | '1H' | '4H' | '1D';

interface Indicator {
  name: string;
  value: number;
  action: 'BUY' | 'SELL' | 'NEUTRAL';
}

export const TechAnalysisModal: React.FC<Props> = ({ coin, isOpen, onClose }) => {
  const [timeframe, setTimeframe] = useState<AnalysisTimeframe>('1D');
  const [summary, setSummary] = useState<Signal>('NEUTRAL');
  const [score, setScore] = useState(50); // 0 to 100
  const [oscillators, setOscillators] = useState<Indicator[]>([]);
  const [movingAverages, setMovingAverages] = useState<Indicator[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DETAILS'>('OVERVIEW');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateAnalysis();
    }
  }, [isOpen, coin, timeframe]);

  const generateAnalysis = async () => {
    setLoading(true);
    // Simulate calculation delay for realism
    await new Promise(r => setTimeout(r, 400));

    // Base calculations
    let trend = coin.price_change_percentage_24h;
    
    // Modify trend based on timeframe simulation
    if (timeframe === '1M') trend += (Math.random() - 0.5) * 0.5;
    if (timeframe === '1H') trend += (Math.random() - 0.5) * 1.0;
    
    const isBullish = trend > 0;
    
    // Generate mock indicators
    const rsiVal = isBullish ? 55 + Math.random() * 20 : 45 - Math.random() * 20;
    const macdVal = trend * 10 + (Math.random() * 5);
    
    const newOscillators: Indicator[] = [
      { name: 'RSI (14)', value: rsiVal, action: rsiVal > 70 ? 'SELL' : rsiVal < 30 ? 'BUY' : 'NEUTRAL' },
      { name: 'Stoch %K', value: isBullish ? 60 + Math.random() * 20 : 40 - Math.random() * 20, action: 'NEUTRAL' },
      { name: 'CCI (20)', value: isBullish ? 105 : -90, action: isBullish ? 'BUY' : 'SELL' },
      { name: 'MACD Level', value: macdVal, action: macdVal > 0 ? 'BUY' : 'SELL' },
      { name: 'Momentum', value: trend * 5, action: trend > 0 ? 'BUY' : 'SELL' }
    ];

    const newMAs: Indicator[] = [
      { name: 'EMA (10)', value: coin.current_price * (isBullish ? 0.99 : 1.01), action: isBullish ? 'BUY' : 'SELL' },
      { name: 'SMA (10)', value: coin.current_price * (isBullish ? 0.98 : 1.02), action: isBullish ? 'BUY' : 'SELL' },
      { name: 'EMA (50)', value: coin.current_price * (isBullish ? 0.95 : 1.05), action: isBullish ? 'BUY' : 'SELL' },
      { name: 'SMA (200)', value: coin.current_price * 0.90, action: 'BUY' }, 
      { name: 'Ichimoku Base', value: coin.current_price, action: 'NEUTRAL' }
    ];

    setOscillators(newOscillators);
    setMovingAverages(newMAs);

    // Calculate Score 0-100
    const allIndicators = [...newOscillators, ...newMAs];
    const buyCount = allIndicators.filter(i => i.action === 'BUY').length;
    const sellCount = allIndicators.filter(i => i.action === 'SELL').length;
    const neutralCount = allIndicators.filter(i => i.action === 'NEUTRAL').length;

    const total = allIndicators.length;
    // Algorithm: Buy = 1, Sell = 0, Neutral = 0.5
    const rawScore = ((buyCount * 1) + (neutralCount * 0.5)) / total; 
    const finalScore = Math.round(rawScore * 100);
    
    setScore(finalScore);

    if (finalScore >= 80) setSummary('STRONG_BUY');
    else if (finalScore >= 60) setSummary('BUY');
    else if (finalScore <= 20) setSummary('STRONG_SELL');
    else if (finalScore <= 40) setSummary('SELL');
    else setSummary('NEUTRAL');

    setLoading(false);
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

  // Gauge Rotation: 0 = -90deg, 100 = 90deg
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
           <h2 className="text-xl font-bold flex items-center gap-2 text-white">
             <Activity className="w-5 h-5 text-brand-500" /> Технический Анализ
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Timeframe Selector */}
        <div className="px-6 py-3 border-b border-gray-800 bg-black/20 flex gap-2 overflow-x-auto">
            {(['1M', '5M', '15M', '1H', '4H', '1D'] as AnalysisTimeframe[]).map((tf) => (
                <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        timeframe === tf 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    {tf}
                </button>
            ))}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
           
           {/* Gauge Section */}
           <div className="mb-8 relative flex flex-col items-center justify-center py-6 bg-gradient-to-b from-gray-800/30 to-transparent rounded-2xl border border-gray-800/50">
              {loading ? (
                  <div className="h-32 flex items-center text-brand-500"><Zap className="w-8 h-8 animate-spin" /></div>
              ) : (
                <>
                    <div className="relative w-64 h-32 overflow-hidden mb-4">
                        {/* Gauge Background Arcs */}
                        <div className="absolute bottom-0 left-0 w-full h-full rounded-t-full border-[20px] border-gray-800 border-b-0"></div>
                        
                        {/* Colored Segments (CSS Conic Gradients are tricky for arcs, using simple absolute divs for segments simulation or SVG) */}
                        {/* Let's use SVG for cleaner gauge */}
                        <svg viewBox="0 0 200 100" className="absolute bottom-0 left-0 w-full h-full">
                            <path d="M 20 100 A 80 80 0 0 1 60 30" fill="none" stroke="#ef4444" strokeWidth="16" /> {/* Sell */}
                            <path d="M 60 30 A 80 80 0 0 1 140 30" fill="none" stroke="#eab308" strokeWidth="16" /> {/* Neutral */}
                            <path d="M 140 30 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="16" /> {/* Buy */}
                        </svg>

                        {/* Needle */}
                        <div 
                            className="absolute bottom-0 left-1/2 w-1 h-[90%] bg-white origin-bottom transition-transform duration-1000 ease-out z-10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                        ></div>
                        
                        {/* Pivot */}
                        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-200 rounded-full -translate-x-1/2 translate-y-1/2 z-20"></div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1 animate-fade-in">{score}</div>
                        <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getSignalBg(summary)} ${getSignalColor(summary)}`}>
                            {summary.replace('_', ' ')}
                        </div>
                    </div>
                </>
              )}
           </div>

            {/* Tabs */}
           <div className="flex border-b border-gray-800 mb-6">
                <button 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'OVERVIEW' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Обзор
                    {activeTab === 'OVERVIEW' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('DETAILS')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'DETAILS' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Детали
                    {activeTab === 'DETAILS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500"></div>}
                </button>
           </div>

           {/* Content based on Tab */}
           <div className="animate-fade-in">
                {activeTab === 'OVERVIEW' ? (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                            <div className="text-gray-400 text-xs uppercase mb-2">Oscillators</div>
                            <div className="flex items-end gap-2">
                                <span className="text-xl font-bold text-white">{oscillators.filter(i => i.action.includes('BUY')).length}</span>
                                <span className="text-xs text-green-400 mb-1">BUY</span>
                            </div>
                        </div>
                        <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                             <div className="text-gray-400 text-xs uppercase mb-2">Moving Averages</div>
                             <div className="flex items-end gap-2">
                                <span className="text-xl font-bold text-white">{movingAverages.filter(i => i.action.includes('BUY')).length}</span>
                                <span className="text-xs text-green-400 mb-1">BUY</span>
                            </div>
                        </div>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Oscillators List */}
                        <div>
                            <h3 className="font-bold text-white mb-4 text-xs uppercase text-gray-500">Осцилляторы</h3>
                            <div className="space-y-2">
                                {oscillators.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-800/30">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSignalBg(item.action)} ${getSignalColor(item.action)}`}>
                                        {item.action === 'NEUTRAL' ? 'N' : item.action}
                                    </span>
                                </div>
                                ))}
                            </div>
                        </div>

                        {/* MAs List */}
                        <div>
                            <h3 className="font-bold text-white mb-4 text-xs uppercase text-gray-500">Скользящие Средние</h3>
                            <div className="space-y-2">
                                {movingAverages.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-800/30">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSignalBg(item.action)} ${getSignalColor(item.action)}`}>
                                        {item.action}
                                    </span>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
           </div>

           <div className="mt-8 text-[10px] text-gray-600 text-center">
              Данные симулируются на основе волатильности и тренда за {timeframe}. Не является инвестиционной рекомендацией.
           </div>

        </div>
      </div>
    </div>
  );
};
    