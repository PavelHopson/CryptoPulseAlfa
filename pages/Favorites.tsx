import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFavoriteCoins } from '../services/cryptoService';
import { CoinData } from '../types';
import { ArrowUpRight, ArrowDownRight, Star, ArrowLeft, AlertTriangle } from 'lucide-react';
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

export const Favorites: React.FC = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const saved = localStorage.getItem('favorites');
      const favIds = saved ? JSON.parse(saved) : [];
      setFavorites(favIds);

      if (favIds.length > 0) {
        const { data, error: apiError } = await fetchFavoriteCoins(favIds);
        setCoins(data);
        if (apiError) setError(apiError);
      } else {
        setCoins([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const removeFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const newFavs = favorites.filter(f => f !== id);
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setCoins(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading your favorites...</div>;

  if (coins.length === 0 && !error && favorites.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-dark-card p-4 rounded-full border border-gray-800">
                <Star className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">No Favorites Yet</h2>
            <p className="text-gray-400 max-w-md">
                Star some coins on the dashboard to track them here. You'll get quick access to their price action and AI insights.
            </p>
            <Link to="/" className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> Your Watchlist
         </h1>
       </div>

       {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

       <div className="bg-dark-card border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">24h Change</th>
                  <th className="px-6 py-4 text-right hidden md:table-cell">Market Cap</th>
                  <th className="px-6 py-4 text-right hidden lg:table-cell">Last 7 Days</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {coins.map((coin) => (
                  <tr key={coin.id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                       <Link to={`/coin/${coin.id}`} className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{coin.name}</div>
                          <div className="text-xs text-gray-500 uppercase">{coin.symbol}</div>
                        </div>
                       </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${coin.current_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 hidden md:table-cell">
                      ${(coin.market_cap / 1e9).toFixed(2)}B
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
                        onClick={(e) => removeFavorite(e, coin.id)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors text-yellow-400"
                        title="Remove from favorites"
                      >
                        <Star className="w-5 h-5 fill-yellow-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
};