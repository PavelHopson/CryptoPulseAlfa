import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMarketData } from '../services/cryptoService';
import { fetchMarketNews, getProjectNews } from '../services/newsService';
import { CoinData, AssetCategory, NewsArticle } from '../types';
import { ArrowUpRight, ArrowDownRight, Star, TrendingUp, Activity, Globe, Zap, Bell, ExternalLink } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MiniChart = ({ data, isPositive }: { data: number[], isPositive: boolean }) => (
  <div className="h-12 w-24 filter drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.map((p, i) => ({ v: p, i }))}>
        <defs>
           <linearGradient id={`grad${isPositive ? 'Pos' : 'Neg'}`} x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor={isPositive ? '#00ff9d' : '#ff00aa'} stopOpacity={0.4} />
             <stop offset="100%" stopColor={isPositive ? '#00ff9d' : '#ff00aa'} stopOpacity={0} />
           </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="v" 
          stroke={isPositive ? '#00ff9d' : '#ff00aa'} 
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [marketNews, setMarketNews] = useState<NewsArticle[]>([]);
  const [projectNews, setProjectNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      const { data } = await fetchMarketData(category);
      setCoins(data);
      const mNews = await fetchMarketNews();
      const pNews = getProjectNews();
      setMarketNews(mNews.slice(0, 4));
      setProjectNews(pNews);
      setLoading(false);
    };
    load();
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, [category]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
           <h1 className="text-4xl font-display font-black text-white mb-1 tracking-wide uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
             {title}
           </h1>
           <div className="flex items-center gap-2 text-cyber-cyan font-mono text-sm">
             <Activity className="w-4 h-4" />
             <span className="tracking-widest">СИСТЕМА ОНЛАЙН :: {subtitle}</span>
           </div>
        </div>
        <div className="font-mono text-xs text-gray-500 border border-gray-800 px-3 py-1 bg-black/50">
           ВОЛАТИЛЬНОСТЬ: <span className="text-cyber-yellow">СРЕДНЯЯ</span>
        </div>
      </div>

      {/* Top Section: News Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project News (Neon Card) */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-4 text-cyber-pink border-b border-gray-800 pb-2">
            <Bell className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg tracking-wider">ОБНОВЛЕНИЯ</h2>
          </div>
          <div className="space-y-4">
             {projectNews.map(news => (
               <div key={news.id} className="flex gap-3 group cursor-pointer">
                 <div className="w-12 h-12 bg-gray-900 border border-gray-700 flex-shrink-0 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    <img src={news.imageUrl} className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-cyber-pink transition-colors leading-tight font-sans">{news.title}</h3>
                    <span className="text-[10px] text-gray-500 font-mono block mt-1">{news.publishedAt}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Market Feed */}
        <div className="lg:col-span-2 cyber-card p-6">
           <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2 text-cyber-cyan">
                 <Globe className="w-5 h-5" />
                 <h2 className="font-display font-bold text-lg tracking-wider">ГЛОБАЛЬНАЯ ЛЕНТА</h2>
              </div>
              <span className="text-xs font-mono text-cyber-green animate-pulse">● ПРЯМОЙ ЭФИР</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketNews.map(news => (
                 <a href={news.url} target="_blank" rel="noopener noreferrer" key={news.id} className="block bg-black/40 border border-gray-800 hover:border-cyber-cyan/50 p-3 transition-all group">
                    <div className="flex justify-between items-start gap-2">
                       <h3 className="text-sm font-medium text-gray-300 group-hover:text-cyber-cyan transition-colors line-clamp-2">{news.title}</h3>
                       <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-white flex-shrink-0" />
                    </div>
                    <div className="flex justify-between items-end mt-3">
                       <span className="text-[10px] text-cyber-purple font-mono uppercase">{news.source}</span>
                       <span className="text-[10px] text-gray-600 font-mono">{news.publishedAt}</span>
                    </div>
                 </a>
              ))}
           </div>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-card p-5 flex items-center justify-between">
           <div>
              <h3 className="text-gray-500 font-mono text-xs uppercase mb-1">Объем 24Ч</h3>
              <p className="text-2xl font-display font-bold text-white tracking-wider">$84.2B</p>
           </div>
           <TrendingUp className="w-8 h-8 text-cyber-green opacity-50" />
        </div>
         <div className="cyber-card p-5 flex items-center justify-between">
           <div>
              <h3 className="text-gray-500 font-mono text-xs uppercase mb-1">Настроение</h3>
              <p className="text-2xl font-display font-bold text-cyber-cyan tracking-wider">БЫЧЬЕ</p>
           </div>
           <Activity className="w-8 h-8 text-cyber-cyan opacity-50" />
        </div>
         <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-cyber-gradient blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-black border border-cyber-cyan p-5 flex flex-col items-center justify-center text-center h-full">
                <h3 className="text-white font-display font-bold text-lg mb-1">ОТКРЫТЬ СДЕЛКУ</h3>
                <p className="text-cyber-cyan/60 text-xs font-mono">0% КОМИССИИ // МОМЕНТАЛЬНО</p>
            </div>
        </div>
      </div>

      {/* Main Asset Table */}
      <div className="cyber-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
          <h2 className="font-display font-bold text-lg text-white tracking-wider">РЫНОЧНЫЕ ДАННЫЕ</h2>
          <div className="text-[10px] font-mono text-gray-500">ЗАДЕРЖКА: 24мс</div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Zap className="w-8 h-8 text-cyber-cyan animate-bounce" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead className="bg-gray-900/50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Актив</th>
                  <th className="px-6 py-3 text-right">Цена</th>
                  <th className="px-6 py-3 text-right">24ч %</th>
                  <th className="px-6 py-3 text-right hidden md:table-cell">Диапазон</th>
                  <th className="px-6 py-3 text-right hidden lg:table-cell">Тренд</th>
                  <th className="px-6 py-3 text-center">Избр</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {coins.map((coin) => (
                  <tr key={coin.id} className="hover:bg-cyber-cyan/5 transition-colors group">
                    <td className="px-6 py-4">
                       <Link to={`/coin/${coin.id}?cat=${category}`} className="flex items-center gap-3">
                        <img src={coin.image} className="w-8 h-8 grayscale group-hover:grayscale-0 transition-all" />
                        <div>
                          <div className="font-bold text-gray-200 group-hover:text-cyber-cyan font-display tracking-wide">{coin.symbol.toUpperCase()}</div>
                          <div className="text-xs text-gray-600">{coin.name}</div>
                        </div>
                       </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white tracking-wide">
                      {category === 'forex' ? '' : '$'}{coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                        {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 hidden md:table-cell text-xs">
                      {coin.low_24h.toLocaleString()} / {coin.high_24h.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                         {coin.sparkline_in_7d && (
                           <MiniChart data={coin.sparkline_in_7d.price} isPositive={coin.price_change_percentage_24h >= 0} />
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={(e) => toggleFavorite(e, coin.id)} className={`hover:scale-110 transition-transform ${favorites.includes(coin.id) ? 'text-cyber-yellow' : 'text-gray-700'}`}>
                        <Star className="w-4 h-4 fill-current" />
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