
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMarketData } from '../services/cryptoService';
import { fetchMarketNews, getProjectNews } from '../services/newsService';
import { CoinData, AssetCategory, NewsArticle } from '../types';
import { ArrowUpRight, ArrowDownRight, Star, TrendingUp, Activity, Globe, Zap, FileText, ExternalLink, Bell } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MiniChart = ({ data, isPositive }: { data: number[], isPositive: boolean }) => (
  <div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.map((p, i) => ({ v: p, i }))}>
        <defs>
           <linearGradient id={`grad${isPositive ? 'Pos' : 'Neg'}`} x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
             <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
           </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="v" 
          stroke={isPositive ? '#10b981' : '#ef4444'} 
          strokeWidth={2} 
          fill={`url(#grad${isPositive ? 'Pos' : 'Neg'})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

interface MarketPageProps {
  category: AssetCategory;
  title: string;
  subtitle: string;
}

export const MarketPage: React.FC<MarketPageProps> = ({ category, title, subtitle }) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // News State
  const [marketNews, setMarketNews] = useState<NewsArticle[]>([]);
  const [projectNews, setProjectNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      // 1. Market Data
      const { data, error: apiError } = await fetchMarketData(category);
      setCoins(data);
      if (apiError) setError(apiError);
      
      // 2. News Data
      const mNews = await fetchMarketNews();
      const pNews = getProjectNews();
      setMarketNews(mNews.slice(0, 5));
      setProjectNews(pNews);

      setLoading(false);
    };
    load();
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, [category]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Section: News Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Platform Updates (Project News) */}
        <div className="bg-gradient-to-br from-brand-900/50 to-purple-900/50 border border-brand-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-white text-lg">Новости CryptoPulse</h2>
          </div>
          <div className="space-y-4 relative z-10">
             {projectNews.map(news => (
               <div key={news.id} className="flex gap-3 group">
                 <div className="w-12 h-12 rounded-lg bg-gray-900/50 overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={news.imageUrl} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white leading-tight group-hover:text-brand-400 transition-colors cursor-pointer">{news.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{news.description}</p>
                    <span className="text-[10px] text-brand-300 mt-1 block">{news.publishedAt}</span>
                 </div>
               </div>
             ))}
          </div>
          {/* Decorative Blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
        </div>

        {/* Live Market Feed (Investing.com) */}
        <div className="lg:col-span-2 bg-dark-card border border-gray-800 rounded-2xl p-6">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <Globe className="w-5 h-5 text-orange-500" />
                 <h2 className="font-bold text-white text-lg">Лента Рынка (Investing.com)</h2>
              </div>
              <span className="text-xs flex items-center gap-1 text-green-400 animate-pulse">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Live
              </span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketNews.map(news => (
                 <a href={news.url} target="_blank" rel="noopener noreferrer" key={news.id} className="block bg-gray-900/30 hover:bg-gray-800 border border-gray-800 rounded-xl p-3 transition-all group">
                    <div className="flex justify-between items-start gap-2">
                       <h3 className="text-sm font-medium text-gray-200 group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">{news.title}</h3>
                       <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-white flex-shrink-0" />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                       <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{news.source}</span>
                       <span className="text-[10px] text-gray-500">{news.publishedAt}</span>
                    </div>
                 </a>
              ))}
           </div>
        </div>

      </div>

      {/* Market Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
           <p className="text-gray-400">{subtitle}</p>
        </div>
        
        <div className="flex gap-4 text-sm">
           <div className="flex items-center gap-2 bg-dark-card border border-gray-800 px-3 py-1.5 rounded-lg">
              <Activity className="w-4 h-4 text-brand-500" />
              <span className="text-gray-300">Волатильность: <span className="text-white font-bold">Умеренная</span></span>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <Zap className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div>
            <h3 className="text-gray-400 font-medium mb-1">Общий объём (24ч)</h3>
            <p className="text-3xl font-bold text-white">$84.2B</p>
          </div>
          <div className="flex items-center gap-2 text-green-400 mt-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Высокая активность</span>
          </div>
        </div>
         <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div>
            <h3 className="text-gray-400 font-medium mb-1">Настроение рынка</h3>
            <p className="text-3xl font-bold text-white">Бычье</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400 mt-4">
            <Activity className="w-4 h-4" />
            <span className="text-sm">78% Покупают</span>
          </div>
        </div>
         <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative shadow-lg shadow-brand-500/20">
            <h3 className="text-white font-bold text-xl mb-2">Торговать сейчас</h3>
            <p className="text-white/80 text-sm mb-4">Нулевая комиссия на пары {category}.</p>
            <button className="bg-white text-brand-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">
              Начать торговлю
            </button>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-dark-card border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Топовые активы</h2>
          <div className="text-sm text-gray-500">Котировки в реальном времени</div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Актив</th>
                  <th className="px-6 py-4 text-right">Цена</th>
                  <th className="px-6 py-4 text-right">Изменение</th>
                  <th className="px-6 py-4 text-right hidden md:table-cell">Мин/Макс (24ч)</th>
                  <th className="px-6 py-4 text-right hidden lg:table-cell">Тренд (7д)</th>
                  <th className="px-6 py-4 text-center">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {coins.map((coin) => (
                  <tr key={coin.id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                       <Link to={`/coin/${coin.id}?cat=${category}`} className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className={`w-8 h-8 ${category === 'crypto' ? 'rounded-full' : 'rounded-md object-cover'}`} />
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{coin.name}</div>
                          <div className="text-xs text-gray-500 uppercase">{coin.symbol}</div>
                        </div>
                       </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {category === 'forex' ? '' : '$'}{coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 hidden md:table-cell text-sm">
                      <span className="text-gray-500">{coin.low_24h.toLocaleString()}</span>
                      <span className="mx-1">/</span>
                      <span className="text-gray-300">{coin.high_24h.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex justify-end">
                         {coin.sparkline_in_7d && (
                           <MiniChart data={coin.sparkline_in_7d.price} isPositive={coin.price_change_percentage_24h >= 0} />
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => toggleFavorite(e, coin.id)}
                        className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${favorites.includes(coin.id) ? 'text-yellow-400' : 'text-gray-600'}`}
                      >
                        <Star className={`w-5 h-5 ${favorites.includes(coin.id) ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
