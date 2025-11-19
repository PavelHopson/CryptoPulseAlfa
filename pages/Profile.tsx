import React, { useEffect, useState } from 'react';
import { User, Settings, CreditCard, History, TrendingUp, ArrowUpRight, Shield, LogOut, Award, XCircle, Star, Download, Wallet, Copy, Fingerprint, Scan, Activity } from 'lucide-react';
import { getUserProfile, closePosition, calculateEquity, getAssetAllocation, getPerformanceHistory, logoutUser } from '../services/userService';
import { UserProfile, AssetAllocation, PerformancePoint, WalletState } from '../types';
import { fetchTopCoins } from '../services/cryptoService';
import { DepositModal } from '../components/DepositModal';
import { SettingsModal } from '../components/SettingsModal';
import { PortfolioAnalytics } from '../components/PortfolioAnalytics';
import { getLevelProgress } from '../services/gamificationService';
import { Link } from 'react-router-dom';
import { downloadTransactionReport } from '../services/reportService';
import { getWalletState } from '../services/web3Service';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [equity, setEquity] = useState(0);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [history, setHistory] = useState<PerformancePoint[]>([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadProfile = async () => {
    const profile = getUserProfile();
    setUser(profile);
    setWallet(getWalletState());
    const { data } = await fetchTopCoins(); 
    const priceMap: Record<string, number> = {};
    data.forEach(c => priceMap[c.id] = c.current_price);
    profile.positions.forEach(p => { if (!priceMap[p.assetId]) priceMap[p.assetId] = p.entryPrice; });
    setCurrentPrices(priceMap);
    const eq = calculateEquity(profile, priceMap);
    setEquity(eq);
    if (profile) {
      setAllocation(getAssetAllocation(profile, priceMap));
      setHistory(getPerformanceHistory(profile));
    }
  };

  useEffect(() => {
    loadProfile();
    const interval = setInterval(loadProfile, 5000);
    window.addEventListener('walletUpdated', loadProfile);
    return () => { clearInterval(interval); window.removeEventListener('walletUpdated', loadProfile); };
  }, []);

  const handleClosePosition = (id: string) => {
    const pos = user?.positions.find(p => p.id === id);
    const price = pos ? (currentPrices[pos.assetId] || pos.entryPrice) : 0;
    closePosition(id, price);
    loadProfile();
    window.dispatchEvent(new Event('balanceChanged'));
  };

  if (!user) return <div className="text-center py-20 font-mono text-cyber-cyan animate-pulse">ЗАГРУЗКА ЛИЧНОСТИ...</div>;

  const marginUsed = user.positions.reduce((sum, p) => sum + ((p.entryPrice * p.amount) / p.leverage), 0);
  const levelProgress = getLevelProgress(user);
  const formatAddress = (addr: string) => `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onSuccess={() => { loadProfile(); window.dispatchEvent(new Event('balanceChanged')); }} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onUpdate={loadProfile} />

      {/* IDENTITY CARD HEADER */}
      <div className="cyber-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
           {/* Avatar with Hexagon clip */}
           <div className="relative group">
              <div className="w-24 h-24 bg-black border-2 border-cyber-cyan p-1 relative z-10" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center text-cyber-cyan font-bold text-2xl">{user.name.charAt(0)}</div>}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-cyber-black border border-cyber-green px-2 py-0.5 text-[10px] font-mono text-cyber-green">ОНЛАЙН</div>
           </div>
           
           <div className="flex-grow">
             <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-display font-bold text-white uppercase tracking-widest">{user.name}</h1>
                <div className="px-2 py-1 border border-cyber-yellow text-cyber-yellow text-[10px] font-mono">LVL.{user.level}</div>
                {user.is_pro && <div className="px-2 py-1 bg-cyber-purple/20 border border-cyber-purple text-cyber-purple text-[10px] font-mono flex items-center gap-1"><Star className="w-3 h-3" /> PRO ЛИЦЕНЗИЯ</div>}
             </div>
             <div className="text-gray-500 font-mono text-xs flex items-center gap-4">
                <span>ID: {user.id?.substring(0,8).toUpperCase()}</span>
                <span>РЕГ: {new Date(user.member_since).getFullYear()}</span>
             </div>
             
             <div className="mt-4 w-full max-w-md">
                <div className="flex justify-between text-[10px] text-cyber-cyan font-mono mb-1">
                   <span>ПРОГРЕСС XP</span>
                   <span>{Math.round(levelProgress)}%</span>
                </div>
                <div className="w-full bg-gray-900 h-1 border border-gray-700">
                   <div className="bg-cyber-cyan h-full shadow-[0_0_10px_#00f3ff]" style={{ width: `${levelProgress}%` }}></div>
                </div>
             </div>
           </div>

           <div className="flex gap-3 w-full md:w-auto">
             <button onClick={() => setIsSettingsOpen(true)} className="cyber-button px-4 py-2 text-xs flex items-center gap-2">
               <Settings className="w-3 h-3" /> НАСТРОЙКИ
             </button>
             <button onClick={() => setIsDepositOpen(true)} className="cyber-button px-4 py-2 text-xs flex items-center gap-2 text-cyber-green border-cyber-green hover:shadow-neon-green">
               <CreditCard className="w-3 h-3" /> ДЕПОЗИТ
             </button>
           </div>
        </div>
      </div>

      {/* FINANCIAL HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { label: 'СВОБОДНАЯ МАРЖА', value: user.balance, color: 'text-white' },
                { label: 'ОЦЕНКА СРЕДСТВ', value: equity, color: 'text-cyber-cyan' },
                { label: 'ИСПОЛЬЗ. МАРЖА', value: marginUsed, color: 'text-gray-400', sub: `${Math.min((marginUsed/equity)*100, 100).toFixed(1)}%` },
                { label: 'ОТКРЫТЫЕ ПОЗИЦИИ', value: user.positions.length, color: 'text-white', isCount: true }
            ].map((stat, i) => (
                <div key={i} className="bg-black/40 border border-gray-800 p-4 flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600 group-hover:border-cyber-cyan transition-colors"></div>
                    <h3 className="text-gray-600 text-[10px] font-mono uppercase mb-1">{stat.label}</h3>
                    <div className={`text-2xl font-mono ${stat.color}`}>
                        {stat.isCount ? stat.value : `$${stat.value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                    </div>
                    {stat.sub && <div className="text-xs text-cyber-pink font-mono mt-1">{stat.sub} ЗАГРУЗКА</div>}
                </div>
            ))}
          </div>

          {/* WEB3 MODULE */}
          <div className="cyber-card p-5 flex flex-col justify-between relative">
              <div className="absolute top-2 right-2"><Fingerprint className={`w-8 h-8 ${wallet.isConnected ? 'text-cyber-green' : 'text-gray-700'}`} /></div>
              {wallet.isConnected && wallet.address ? (
                  <>
                    <div className="text-xs text-cyber-green font-mono mb-2">[ ЗАЩИЩЕННОЕ СОЕДИНЕНИЕ ]</div>
                    <div className="mb-4">
                        <div className="text-gray-500 text-[10px] font-mono uppercase">ID Кошелька</div>
                        <div className="font-mono text-white bg-black border border-gray-800 p-2 text-xs flex justify-between items-center mt-1">
                            {formatAddress(wallet.address)}
                            <Copy className="w-3 h-3 cursor-pointer hover:text-cyber-cyan" />
                        </div>
                    </div>
                    <div>
                         <div className="text-gray-500 text-[10px] font-mono uppercase">АКТИВЫ ETH</div>
                         <div className="text-2xl font-mono text-white">{wallet.balanceEth.toFixed(4)} <span className="text-xs text-gray-600">ETH</span></div>
                    </div>
                  </>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-4 opacity-50">
                       <Wallet className="w-8 h-8 text-gray-500 mb-2" />
                       <div className="text-xs font-mono">НЕТ СВЯЗИ</div>
                  </div>
              )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* POSITIONS TABLE */}
        <div className="lg:col-span-2 cyber-card min-h-[400px]">
           <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
             <h2 className="font-display font-bold text-white tracking-wider">АКТИВНЫЕ ОРДЕРА</h2>
             <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
           </div>
           <div className="p-4 space-y-2">
             {user.positions.length === 0 ? (
                 <div className="text-center py-12 border border-gray-800 border-dashed text-gray-600 font-mono text-xs">
                     [ НЕТ АКТИВНЫХ СИГНАЛОВ ]
                 </div>
             ) : (
                 user.positions.map(pos => {
                    const currentPrice = currentPrices[pos.assetId] || pos.entryPrice;
                    let pnl = pos.type === 'LONG' ? (currentPrice - pos.entryPrice) * pos.amount : (pos.entryPrice - currentPrice) * pos.amount;
                    let pnlPercent = (pnl / ((pos.entryPrice * pos.amount)/pos.leverage)) * 100;

                    return (
                        <div key={pos.id} className="flex items-center justify-between p-3 bg-black/40 border border-gray-800 hover:border-cyber-cyan/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-1 h-10 ${pos.type === 'LONG' ? 'bg-cyber-green' : 'bg-cyber-pink'}`}></div>
                                <div>
                                    <div className="font-bold text-white font-display">{pos.symbol} <span className="text-xs text-gray-500 font-mono">x{pos.leverage}</span></div>
                                    <div className="text-[10px] font-mono text-gray-500">ВХОД: {pos.entryPrice.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="text-right font-mono">
                                <div className={`font-bold ${pnl >= 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </div>
                                <div className={`text-[10px] ${pnl >= 0 ? 'text-cyber-green/70' : 'text-cyber-pink/70'}`}>
                                    {pnlPercent.toFixed(2)}%
                                </div>
                            </div>
                             <button onClick={() => handleClosePosition(pos.id)} className="text-gray-600 hover:text-white hover:rotate-90 transition-all"><XCircle className="w-5 h-5" /></button>
                        </div>
                    );
                 })
             )}
           </div>
        </div>

        {/* SIDEBAR ACTIONS */}
        <div className="space-y-6">
           <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-white font-display text-sm">ИСТОРИЯ ТРАНЗАКЦИЙ</h3>
                 <button onClick={() => user && downloadTransactionReport(user)} className="text-cyber-cyan hover:text-white"><Download className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 font-mono text-xs">
                 {user.transactions?.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center border-b border-gray-900 pb-2 last:border-0">
                       <span className={tx.type === 'DEPOSIT' ? 'text-cyber-green' : 'text-cyber-pink'}>{tx.type === 'DEPOSIT' ? 'ДЕПОЗИТ' : 'ВЫВОД'}</span>
                       <span className="text-gray-400">${tx.amount}</span>
                    </div>
                 ))}
              </div>
           </div>

           <button onClick={logoutUser} className="w-full cyber-button danger py-3 flex items-center justify-center gap-2 font-bold">
              <LogOut className="w-4 h-4" /> ЗАВЕРШИТЬ СЕССИЮ
           </button>
        </div>
      </div>
    </div>
  );
};