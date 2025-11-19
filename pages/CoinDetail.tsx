
import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchCoinDetails, fetchCoinHistory } from '../services/cryptoService';
import { CoinData, AssetCategory, ChartPoint, Timeframe } from '../types';
import { ChartComponent } from '../components/ChartComponent';
import { AIInsight } from '../components/AIInsight';
import { TradeModal } from '../components/TradeModal';
import { TechAnalysisModal } from '../components/TechAnalysisModal';
import { ArrowLeft, Globe, TrendingUp, DollarSign, Activity, AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

export const CoinDetail: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const category = (searchParams.get('cat') as AssetCategory) || 'crypto';
  
  const [coin, setCoin] = useState<CoinData | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Trade State
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'LONG' | 'SHORT'>('LONG');
  const [showSuccess, setShowSuccess] = useState(false);

  // Tech Analysis State
  const [techModalOpen, setTechModalOpen] = useState(false);

  const loadData = async (silent = false) => {
    if (id) {
      if (!silent) setLoading(true);
      
      // 1. Fetch basic details
      const { data, error: apiError } = await fetchCoinDetails(id, category);
      setCoin(data);
      
      if (apiError) setError(apiError);
      
      // 2. Fetch history based on timeframe (only on initial or explicit timeframe change)
      if (data && (!silent || chartData.length === 0)) {
        const history = await fetchCoinHistory(id, timeframe, data.current_price);
        setChartData(history);
      }

      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadData();
  }, [id, category, timeframe]);

  // Live Polling (Simulated WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true); // Silent update
    }, 5000);
    return () => clearInterval(interval);
  }, [id, category, timeframe]);

  const openTrade = (type: 'LONG' | 'SHORT') => {
    setTradeType(type);
    setTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    setShowSuccess(true);
    window.dispatchEvent(new Event('balanceChanged'));
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Helper for external links
  const getOfficialSite = () => {
    if (!coin) return '#';
    if (category === 'forex') return 'https://www.investing.com/currencies';
    if (category === 'futures') return 'https://www.investing.com/indices';
    
    // Mock mapping for top crypto
    const sites: Record<string, string> = {
      'bitcoin': 'https://bitcoin.org',
      'ethereum': 'https://ethereum.org',
      'solana': 'https://solana.com',
      'cardano': 'https://cardano.org',
      'ripple': 'https://ripple.com'
    };
    return sites[coin.id] || `https://www.coingecko.com/en/coins/${coin.id}`;
  };

  if (loading && !coin) return <div className="flex justify-center items-center h-64 text-brand-500">Загрузка данных актива...</div>;
  
  if (!coin) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-xl font-bold text-gray-300 mb-2">Актив не найден</div>
      <p className="text-gray-500 mb-6">Актив, который вы ищете, сейчас недоступен.</p>
      <Link to="/" className="text-brand-500 hover:text-brand-400 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Вернуться на дашборд
      </Link>
    </div>
  );

  const isPositive = coin.price_change_percentage_24h >= 0;
  const isForex = category === 'forex';
  const catLabel = category === 'crypto' ? 'Крипто' : category === 'forex' ? 'Форекс' : 'Фьючерсы';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Modals */}
      <TradeModal 
        coin={coin} 
        type={tradeType} 
        isOpen={tradeModalOpen} 
        onClose={() => setTradeModalOpen(false)} 
        onSuccess={handleTradeSuccess}
      />
      
      <TechAnalysisModal 
        coin={coin}
        isOpen={techModalOpen}
        onClose={() => setTechModalOpen(false)}
      />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl shadow-green-900/50 flex items-center gap-3 animate-slide-in-right">
           <CheckCircle className="w-6 h-6" />
           <div>
             <div className="font-bold">Ордер Исполнен</div>
             <div className="text-sm opacity-90">Позиция успешно открыта</div>
           </div>
        </div>
      )}

      <Link to={category === 'crypto' ? '/' : `/${category}`} className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Назад к {catLabel}
      </Link>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={coin.name} className={`w-16 h-16 ${isForex ? 'rounded-md object-cover' : 'rounded-full'} bg-white p-1`} />
          <div>
             <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
             <div className="flex items-center gap-2 mt-1">
               <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded uppercase font-bold">{coin.symbol}</span>
               {coin.market_cap_rank > 0 && <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded">Ранг #{coin.market_cap_rank}</span>}
               <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded animate-pulse">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live
               </div>
             </div>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
           <div className="text-4xl font-bold text-white tracking-tight transition-all duration-300">
              {isForex ? '' : '$'}{coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
           </div>
           <div className={`flex items-center gap-2 mt-1 text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24ч)
           </div>

           {/* Buy/Sell Actions */}
           <div className="flex gap-3 mt-6 w-full md:w-auto">
             <button 
               onClick={() => openTrade('LONG')}
               className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
             >
               Купить {coin.symbol}
             </button>
             <button 
               onClick={() => openTrade('SHORT')}
               className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 md:py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-95"
             >
               Продать {coin.symbol}
             </button>
           </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart & AI */}
        <div className="lg:col-span-2 space-y-6">
           {/* Chart Card */}
           <div className="bg-dark-card border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                   <Activity className="w-5 h-5 text-brand-500" /> Динамика Цены
                </h2>
                <div className="flex bg-gray-900 rounded-lg p-1">
                   {(['1H', '1D', '1W', '1M', '1Y'] as Timeframe[]).map(t => (
                      <button 
                        key={t} 
                        onClick={() => setTimeframe(t)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-all ${timeframe === t ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {t === '1H' ? '1Ч' : t === '1D' ? '1Д' : t === '1W' ? '1Н' : t === '1M' ? '1М' : '1Г'}
                      </button>
                   ))}
                </div>
              </div>
              <ChartComponent data={chartData} height={400} isPositive={isPositive} />
           </div>

           {/* Gemini AI Analysis */}
           <AIInsight coin={coin} />
        </div>

        {/* Right Column: Stats & Info */}
        <div className="space-y-6">
           {/* Market Stats */}
           <div className="bg-dark-card border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-200">Статистика рынка</h3>
              <div className="space-y-4">
                 {coin.market_cap > 0 && (
                   <div className="flex justify-between py-3 border-b border-gray-800">
                      <span className="text-gray-400 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Капитализация</span>
                      <span className="font-medium">${coin.market_cap.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Объём (24ч)</span>
                    <span className="font-medium">${coin.total_volume.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Диапазон 24ч</span>
                    <span className="font-medium">{coin.low_24h.toLocaleString()} - {coin.high_24h.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">Максимум (ATH)</span>
                    <div className="text-right">
                       <div className="font-medium">${coin.ath.toLocaleString()}</div>
                       <div className="text-xs text-red-400">{coin.ath_change_percentage.toFixed(2)}%</div>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Resources */}
           <div className="bg-dark-card border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-200">Ресурсы</h3>
              <div className="space-y-3">
                 <a 
                   href={getOfficialSite()} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="block bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors flex items-center justify-between group"
                 >
                    <span className="flex items-center gap-3 text-gray-300"><Globe className="w-4 h-4" /> Официальный сайт</span>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                 </a>
                 
                 <button 
                   onClick={() => setTechModalOpen(true)}
                   className="w-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors flex items-center justify-between group"
                 >
                    <span className="flex items-center gap-3 text-gray-300"><Activity className="w-4 h-4" /> Технический анализ</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-gray-600 group-hover:text-white transition-colors" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
