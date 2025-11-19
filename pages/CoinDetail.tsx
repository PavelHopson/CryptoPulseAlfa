import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchCoinDetails, fetchCoinHistory } from '../services/cryptoService';
import { CoinData, AssetCategory, CandleData, Timeframe } from '../types';
import { TradingViewChart } from '../components/TradingViewChart';
import { AIInsight } from '../components/AIInsight';
import { TradeModal } from '../components/TradeModal';
import { TechAnalysisModal } from '../components/TechAnalysisModal';
import { ArrowLeft, Globe, TrendingUp, DollarSign, Activity, AlertTriangle, CheckCircle, RefreshCw, ExternalLink, Terminal } from 'lucide-react';

export const CoinDetail: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const category = (searchParams.get('cat') as AssetCategory) || 'crypto';
  
  const [coin, setCoin] = useState<CoinData | null>(null);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [loading, setLoading] = useState(true);
  
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'LONG' | 'SHORT'>('LONG');
  const [showSuccess, setShowSuccess] = useState(false);
  const [techModalOpen, setTechModalOpen] = useState(false);

  const loadData = async (silent = false) => {
    if (id) {
      if (!silent) setLoading(true);
      const { data } = await fetchCoinDetails(id, category);
      setCoin(data);
      if (data && (!silent || chartData.length === 0)) {
        const history = await fetchCoinHistory(id, timeframe, data.current_price);
        setChartData(history);
      } else if (data && silent && chartData.length > 0) {
        const lastCandle = chartData[chartData.length - 1];
        const updatedCandle = {
            ...lastCandle,
            close: data.current_price,
            high: Math.max(lastCandle.high, data.current_price),
            low: Math.min(lastCandle.low, data.current_price)
        };
        setChartData([...chartData.slice(0, -1), updatedCandle]);
      }
      setLoading(false);
    }
  };

  useEffect(() => { setChartData([]); loadData(); }, [id, category, timeframe]);
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 2000);
    return () => clearInterval(interval);
  }, [id, category, timeframe, chartData]);

  const openTrade = (type: 'LONG' | 'SHORT') => {
    setTradeType(type);
    setTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    setShowSuccess(true);
    window.dispatchEvent(new Event('balanceChanged'));
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading && !coin) return <div className="flex justify-center items-center h-64 text-cyber-cyan font-mono animate-pulse">ЗАГРУЗКА ДАННЫХ...</div>;
  
  if (!coin) return <div className="flex justify-center py-20 text-red-500 font-mono">АКТИВ НЕ НАЙДЕН</div>;

  const isPositive = coin.price_change_percentage_24h >= 0;
  const neonColor = isPositive ? 'text-cyber-green' : 'text-cyber-pink';
  const glowClass = isPositive ? 'shadow-neon-green' : 'shadow-neon-pink';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <TradeModal coin={coin} type={tradeType} isOpen={tradeModalOpen} onClose={() => setTradeModalOpen(false)} onSuccess={handleTradeSuccess} />
      <TechAnalysisModal coin={coin} isOpen={techModalOpen} onClose={() => setTechModalOpen(false)} />

      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-cyber-black border border-cyber-green text-cyber-green px-6 py-3 flex items-center gap-3 shadow-neon-green font-mono">
           <CheckCircle className="w-6 h-6" /> <span>ОРДЕР УСПЕШНО ИСПОЛНЕН</span>
        </div>
      )}

      <Link to={category === 'crypto' ? '/' : `/${category}`} className="inline-flex items-center text-cyber-cyan/60 hover:text-cyber-cyan transition-colors mb-4 font-mono text-xs tracking-widest">
        <ArrowLeft className="w-3 h-3 mr-2" /> НАЗАД К СПИСКУ
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 cyber-card p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center bg-black border border-gray-800">
              <img src={coin.image} alt={coin.name} className="w-12 h-12" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-cyan"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-cyan"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-cyan"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-cyan"></div>
          </div>
          <div>
             <h1 className="text-4xl font-display font-black text-white tracking-wide">{coin.name.toUpperCase()}</h1>
             <div className="flex items-center gap-3 mt-2">
               <span className="bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 text-xs px-2 py-0.5 font-mono">{coin.symbol.toUpperCase()}</span>
               <span className="bg-gray-900 text-gray-400 text-xs px-2 py-0.5 font-mono border border-gray-800">РАНГ #{coin.market_cap_rank}</span>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end">
           <div className={`text-5xl font-mono font-bold tracking-tighter text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]`}>
              ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
           <div className={`flex items-center gap-2 mt-2 text-xl font-bold font-mono ${neonColor}`}>
              {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingUp className="w-6 h-6 rotate-180" />}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
           </div>

           <div className="flex gap-4 mt-6 w-full md:w-auto">
             <button onClick={() => openTrade('LONG')} className="cyber-button bg-cyber-green/10 border-cyber-green text-cyber-green px-8 py-3 hover:shadow-neon-green w-full md:w-auto">
               LONG (КУПИТЬ)
             </button>
             <button onClick={() => openTrade('SHORT')} className="cyber-button bg-cyber-pink/10 border-cyber-pink text-cyber-pink px-8 py-3 hover:shadow-neon-pink w-full md:w-auto">
               SHORT (ПРОДАТЬ)
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart & AI */}
        <div className="lg:col-span-2 space-y-6">
           <div className="cyber-card p-1">
              <div className="flex items-center justify-between px-5 py-3 bg-black/60 border-b border-gray-800">
                <h2 className="text-sm font-mono text-cyber-cyan flex items-center gap-2">
                   <Activity className="w-4 h-4" /> ВИЗУАЛИЗАЦИЯ ГРАФИКА
                </h2>
                <div className="flex gap-1">
                   {(['1H', '1D', '1W', '1M', '1Y'] as Timeframe[]).map(t => (
                      <button key={t} onClick={() => setTimeframe(t)} className={`px-3 py-1 text-[10px] font-mono transition-all ${timeframe === t ? 'bg-cyber-cyan text-black font-bold' : 'text-gray-500 hover:text-white'}`}>
                        {t}
                      </button>
                   ))}
                </div>
              </div>
              <div className="p-4 bg-black/40 min-h-[400px]">
                  <TradingViewChart data={chartData} height={400} isPositive={isPositive} />
              </div>
           </div>

           <AIInsight coin={coin} />
        </div>

        {/* Stats Side Panel */}
        <div className="space-y-6">
           <div className="cyber-card p-6">
              <h3 className="text-lg font-display font-bold mb-6 text-white border-b border-gray-800 pb-2">МЕТРИКИ РЫНКА</h3>
              <div className="space-y-4 font-mono text-sm">
                 <div className="flex justify-between">
                    <span className="text-gray-500">РЫН. КАП</span>
                    <span className="text-white">${(coin.market_cap / 1e9).toFixed(2)}B</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">ОБЪЕМ 24Ч</span>
                    <span className="text-white">${(coin.total_volume / 1e9).toFixed(2)}B</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">ДИАПАЗОН</span>
                    <span className="text-white text-xs">{coin.low_24h} - {coin.high_24h}</span>
                 </div>
                 <div className="flex justify-between pt-2 border-t border-gray-800">
                    <span className="text-gray-500">ИСТ. МАКС (ATH)</span>
                    <span className="text-white">${coin.ath.toLocaleString()} <span className="text-red-500 text-xs">({coin.ath_change_percentage.toFixed(1)}%)</span></span>
                 </div>
              </div>
           </div>
           
           <div className="cyber-card p-6">
              <h3 className="text-lg font-display font-bold mb-4 text-white">ССЫЛКИ</h3>
              <div className="space-y-3">
                 <a href="#" target="_blank" className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 hover:border-cyber-cyan hover:text-cyber-cyan transition-all group">
                    <span className="font-mono text-xs flex items-center gap-2"><Globe className="w-3 h-3" /> ОФИЦИАЛЬНЫЙ САЙТ</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                 </a>
                 <button onClick={() => setTechModalOpen(true)} className="w-full p-3 bg-cyber-purple/10 border border-cyber-purple text-cyber-purple font-mono text-xs font-bold hover:bg-cyber-purple/20 transition-all flex items-center justify-center gap-2">
                    <Terminal className="w-3 h-3" /> ЗАПУСТИТЬ ТЕХ. АНАЛИЗ
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};