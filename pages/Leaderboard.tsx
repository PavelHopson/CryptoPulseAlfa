
import React, { useEffect, useState } from 'react';
import { Trophy, Users, TrendingUp, Copy, CheckCircle, Flame } from 'lucide-react';
import { TraderProfile } from '../types';
import { getTopTraders } from '../services/communityService';
import { executeTrade, getUserProfile } from '../services/userService';
import { fetchCoinDetails } from '../services/cryptoService';

export const Leaderboard: React.FC = () => {
  const [traders, setTraders] = useState<TraderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getTopTraders();
      setTraders(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleCopyTrade = async (trader: TraderProfile) => {
    // Simulation: Copy their "Top Asset" trade
    const profile = getUserProfile();
    if (profile.balance < 1000) {
      alert("Недостаточно средств для копирования (Мин $1000)");
      return;
    }

    // Fetch asset details to open trade
    let assetId = 'bitcoin';
    if (trader.topAsset === 'ETH') assetId = 'ethereum';
    if (trader.topAsset === 'EUR') assetId = 'eur-usd';
    if (trader.topAsset === 'XAU') assetId = 'gold';
    
    // In a real app, we'd fetch the exact asset ID based on symbol map
    const { data: coin } = await fetchCoinDetails(assetId, trader.topAsset === 'EUR' ? 'forex' : 'crypto');
    
    if (coin) {
      const amount = (1000 / coin.current_price); // Invest $1000
      const result = executeTrade(coin, 'LONG', amount, 5); // 5x leverage copy
      
      if (result.success) {
        setCopySuccess(trader.id);
        setTimeout(() => setCopySuccess(null), 3000);
        window.dispatchEvent(new Event('balanceChanged'));
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
             <Trophy className="w-8 h-8 text-yellow-400" /> Зал Славы
           </h1>
           <p className="text-gray-400">Топ трейдеров CryptoPulse по доходности за месяц. Копируйте лучших.</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && traders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Rank 2 */}
          <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 flex flex-col items-center order-2 md:order-1 mt-0 md:mt-8 relative overflow-hidden">
             <div className="absolute top-0 w-full h-1 bg-gray-400"></div>
             <div className="text-4xl mb-2 filter drop-shadow-lg">{traders[1].avatar}</div>
             <div className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded mb-2">#2 SILVER</div>
             <h3 className="font-bold text-lg text-white">{traders[1].name}</h3>
             <div className="text-green-400 font-bold text-xl mt-2">+{traders[1].profitPercent}%</div>
             <div className="text-xs text-gray-500 mt-4 flex items-center gap-1"><Users className="w-3 h-3" /> {traders[1].followers} копируют</div>
             <button 
                onClick={() => handleCopyTrade(traders[1])}
                className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-white transition-colors"
             >
               {copySuccess === traders[1].id ? 'Скопировано!' : 'Копировать'}
             </button>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-b from-brand-900/50 to-dark-card border border-brand-500/50 rounded-2xl p-6 flex flex-col items-center order-1 md:order-2 shadow-2xl shadow-brand-500/20 relative overflow-hidden transform md:-translate-y-4">
             <div className="absolute top-0 w-full h-1 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]"></div>
             <div className="absolute top-4 right-4 animate-pulse"><Flame className="w-6 h-6 text-orange-500" /></div>
             <div className="text-6xl mb-2 filter drop-shadow-lg">{traders[0].avatar}</div>
             <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-lg">#1 CHAMPION</div>
             <h3 className="font-bold text-xl text-white">{traders[0].name}</h3>
             <div className="text-green-400 font-bold text-3xl mt-2">+{traders[0].profitPercent}%</div>
             <div className="text-sm text-gray-400 mt-1">Win Rate: {traders[0].winRate}%</div>
             <button 
                onClick={() => handleCopyTrade(traders[0])}
                className="mt-6 w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
             >
               {copySuccess === traders[0].id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               {copySuccess === traders[0].id ? 'Успешно' : 'Копировать ($1000)'}
             </button>
          </div>

          {/* Rank 3 */}
          <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 flex flex-col items-center order-3 mt-0 md:mt-12 relative overflow-hidden">
             <div className="absolute top-0 w-full h-1 bg-orange-700"></div>
             <div className="text-4xl mb-2 filter drop-shadow-lg">{traders[2].avatar}</div>
             <div className="bg-orange-900 text-orange-200 text-xs font-bold px-2 py-0.5 rounded mb-2">#3 BRONZE</div>
             <h3 className="font-bold text-lg text-white">{traders[2].name}</h3>
             <div className="text-green-400 font-bold text-xl mt-2">+{traders[2].profitPercent}%</div>
             <div className="text-xs text-gray-500 mt-4 flex items-center gap-1"><Users className="w-3 h-3" /> {traders[2].followers} копируют</div>
             <button 
                onClick={() => handleCopyTrade(traders[2])}
                className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-white transition-colors"
             >
                {copySuccess === traders[2].id ? 'Скопировано!' : 'Копировать'}
             </button>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="bg-dark-card border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
           <h2 className="font-bold text-white">Общий Рейтинг</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
             <thead className="bg-gray-900/50">
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Ранг</th>
                  <th className="px-6 py-4">Трейдер</th>
                  <th className="px-6 py-4 text-right">Прибыль (30д)</th>
                  <th className="px-6 py-4 text-right hidden md:table-cell">Win Rate</th>
                  <th className="px-6 py-4 text-right hidden lg:table-cell">Любимый актив</th>
                  <th className="px-6 py-4 text-center">Действие</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
                {traders.slice(3).map(trader => (
                   <tr key={trader.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-medium">#{trader.rank}</td>
                      <td className="px-6 py-4 flex items-center gap-3">
                         <span className="text-xl">{trader.avatar}</span>
                         <div>
                            <div className="font-bold text-white">{trader.name}</div>
                            <div className="text-xs text-gray-500">{trader.followers.toLocaleString()} подписчиков</div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className={`font-bold ${trader.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {trader.profitPercent > 0 ? '+' : ''}{trader.profitPercent}%
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right hidden md:table-cell text-gray-300">
                         {trader.winRate}%
                      </td>
                       <td className="px-6 py-4 text-right hidden lg:table-cell">
                         <span className="bg-gray-800 text-xs px-2 py-1 rounded font-mono">{trader.topAsset}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <button 
                           onClick={() => handleCopyTrade(trader)}
                           className="text-brand-400 hover:text-white text-sm font-medium transition-colors"
                         >
                            Копировать
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
