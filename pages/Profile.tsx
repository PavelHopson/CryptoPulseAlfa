
import React, { useEffect, useState } from 'react';
import { User, Settings, CreditCard, History, TrendingUp, ArrowUpRight, Shield, LogOut, Award, XCircle, Star } from 'lucide-react';
import { getUserProfile, closePosition, calculateEquity, getAssetAllocation, getPerformanceHistory, logoutUser } from '../services/userService';
import { UserProfile, AssetAllocation, PerformancePoint } from '../types';
import { fetchTopCoins } from '../services/cryptoService';
import { DepositModal } from '../components/DepositModal';
import { SettingsModal } from '../components/SettingsModal';
import { PortfolioAnalytics } from '../components/PortfolioAnalytics';
import { getLevelProgress } from '../services/gamificationService';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [equity, setEquity] = useState(0);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  
  // Analytics State
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [history, setHistory] = useState<PerformancePoint[]>([]);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadProfile = async () => {
    const profile = getUserProfile();
    setUser(profile);
    
    // Fetch fresh prices to calculate PnL
    const { data } = await fetchTopCoins(); // simplified fetch for demo
    // Map data for quick lookup
    const priceMap: Record<string, number> = {};
    data.forEach(c => priceMap[c.id] = c.current_price);
    
    // Mock prices for non-crypto assets if not found (simplified)
    profile.positions.forEach(p => {
        if (!priceMap[p.assetId]) priceMap[p.assetId] = p.entryPrice * (1 + (Math.random() - 0.5) * 0.01); 
    });

    setCurrentPrices(priceMap);
    
    // Calculate Analytics
    const eq = calculateEquity(profile, priceMap);
    setEquity(eq);
    
    // Only update graphs if user exists
    if (profile) {
      setAllocation(getAssetAllocation(profile, priceMap));
      setHistory(getPerformanceHistory(profile));
    }
  };

  useEffect(() => {
    loadProfile();
    // Poll for price updates to animate PnL
    const interval = setInterval(loadProfile, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = (id: string) => {
    const pos = user?.positions.find(p => p.id === id);
    const price = pos ? (currentPrices[pos.assetId] || pos.entryPrice) : 0;
    
    closePosition(id, price);
    loadProfile();
    window.dispatchEvent(new Event('balanceChanged'));
  };

  const handleDepositSuccess = () => {
    loadProfile();
    window.dispatchEvent(new Event('balanceChanged'));
  };

  if (!user) return <div>Loading Profile...</div>;

  const marginUsed = user.positions.reduce((sum, p) => sum + ((p.entryPrice * p.amount) / p.leverage), 0);
  const levelProgress = getLevelProgress(user);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onSuccess={handleDepositSuccess} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onUpdate={loadProfile} />

      {/* Profile Header */}
      <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-600 rounded-full blur-[80px] opacity-20"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
           <div className="w-20 h-20 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl border-4 border-dark-card">
             {user.name.charAt(0)}
           </div>
           <div className="flex-grow">
             <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                   <Award className="w-3 h-3" /> Lvl {user.level || 1}
                </span>
             </div>
             <p className="text-gray-400">{user.email} • Member since {new Date(user.member_since).getFullYear()}</p>
             
             {/* XP Bar */}
             <div className="mt-3 max-w-xs">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                   <span>XP Progress</span>
                   <span>{Math.round(levelProgress)}%</span>
                </div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full">
                   <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }}></div>
                </div>
             </div>

           </div>
           <div className="flex gap-3 w-full md:w-auto">
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors text-sm font-medium"
             >
               <Settings className="w-4 h-4" /> Settings
             </button>
             <button 
               onClick={() => setIsDepositOpen(true)}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-brand-500/20"
             >
               <CreditCard className="w-4 h-4" /> Deposit
             </button>
           </div>
        </div>
      </div>

      {/* Achievements Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         {user.achievements?.map(ach => (
            <div key={ach.id} className="bg-dark-card border border-gray-800 p-3 rounded-xl flex flex-col items-center text-center group hover:border-brand-500/50 transition-colors">
               <div className="text-3xl mb-2 filter drop-shadow-md">{ach.icon}</div>
               <div className="font-bold text-xs text-white">{ach.title}</div>
               <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{ach.description}</div>
            </div>
         ))}
         {(!user.achievements || user.achievements.length === 0) && (
             <div className="col-span-2 md:col-span-4 lg:col-span-6 bg-dark-card border border-gray-800 border-dashed p-4 rounded-xl text-center text-gray-500 text-sm">
                 Нет достижений. Торгуйте, чтобы получить бейджи!
             </div>
         )}
      </div>

      {/* Account Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Free Margin (Balance)</h3>
            <p className="text-2xl font-bold text-white">${user.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <div className="text-xs text-gray-500 mt-2">Available for trade</div>
         </div>
         <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Equity</h3>
            <p className="text-2xl font-bold text-white">${equity.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
               Total Account Value
            </div>
         </div>
         <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Margin Used</h3>
            <div className="flex items-end gap-2">
               <p className="text-2xl font-bold text-white">${marginUsed.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
               <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((marginUsed/equity)*100, 100)}%` }}></div>
            </div>
         </div>
         <div className="bg-dark-card border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Active Positions</h3>
            <p className="text-2xl font-bold text-white">{user.positions.length}</p>
            <div className="text-xs text-gray-500 mt-2">Open trades</div>
         </div>
      </div>

      {/* Analytics Component */}
      <PortfolioAnalytics allocation={allocation} history={history} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Open Positions */}
        <div className="lg:col-span-2 bg-dark-card border border-gray-800 rounded-2xl overflow-hidden min-h-[400px]">
           <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-brand-500" /> Open Positions
             </h2>
             <span className="text-xs text-gray-500">Auto-refreshing</span>
           </div>
           <div className="p-6">
             {user.positions.length === 0 ? (
                 <div className="text-center text-gray-500 py-12">
                     No open positions. Start trading to populate your portfolio.
                 </div>
             ) : (
                 <div className="space-y-4">
                    {user.positions.map(pos => {
                        const currentPrice = currentPrices[pos.assetId] || pos.entryPrice;
                        let pnl = 0;
                        let pnlPercent = 0;
                        
                        if (pos.type === 'LONG') {
                            pnl = (currentPrice - pos.entryPrice) * pos.amount;
                            pnlPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * pos.leverage;
                        } else {
                            pnl = (pos.entryPrice - currentPrice) * pos.amount;
                            pnlPercent = ((pos.entryPrice - currentPrice) / pos.entryPrice) * 100 * pos.leverage;
                        }

                        return (
                            <div key={pos.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${pos.type === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {pos.symbol.substring(0,3)}
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {pos.name} 
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${pos.type === 'LONG' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                            {pos.type} {pos.leverage}x
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Entry: {pos.entryPrice.toLocaleString()} • Cur: {currentPrice.toLocaleString(undefined, {maximumFractionDigits: 4})}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                    </div>
                                    <div className={`text-xs ${pnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                        {pnlPercent.toFixed(2)}%
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClosePosition(pos.id)}
                                    className="p-2 hover:bg-gray-700 rounded-full text-gray-500 hover:text-white transition-colors"
                                    title="Close Position"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            </div>
                        );
                    })}
                 </div>
             )}
           </div>
        </div>

        {/* Quick Actions / Status */}
        <div className="space-y-6">
           
           {/* Transaction History */}
           <div className="bg-dark-card border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4" /> Transactions
                 </h3>
                 <button className="text-xs text-brand-400 hover:text-brand-300">View All</button>
              </div>
              <div className="space-y-3">
                 {(!user.transactions || user.transactions.length === 0) && (
                    <div className="text-sm text-gray-500 italic text-center py-2">No recent transactions</div>
                 )}
                 {user.transactions?.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-300 capitalize">{tx.type.toLowerCase()}</span>
                       </div>
                       <div className="font-medium">${tx.amount.toLocaleString()}</div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-purple-900/50 to-brand-900/50 border border-brand-500/30 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-2">Pro Analysis Plan</h3>
              <p className="text-sm text-gray-300 mb-4">Your plan renews on Oct 24, 2025.</p>
              <div className="w-full bg-black/30 h-2 rounded-full mb-4">
                 <div className="bg-brand-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                 Manage Subscription
              </button>
           </div>

           <button 
             onClick={logoutUser}
             className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 p-3 rounded-lg transition-colors text-sm font-medium"
           >
              <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </div>
    </div>
  );
};