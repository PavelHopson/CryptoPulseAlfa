import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, Search, Bell, User, Star, TrendingUp, DollarSign, Shield, LogIn, Check, X, Info, CheckCircle, AlertTriangle, Trophy, CreditCard, Megaphone, ArrowLeftRight, Wallet, LogOut, Cpu, Globe, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { UserProfile, WalletState } from '../types';
import { MockAd } from './MockAd';
import { getSystemConfig } from '../services/adminService';
import { WalletModal } from './WalletModal';
import { getWalletState, disconnectWallet } from '../services/web3Service';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletState>(getWalletState());
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'BTC ПРОБИЛ $65,000', time: '02:14', read: false, type: 'alert' },
    { id: 2, title: 'ДЕПОЗИТ ПОДТВЕРЖДЕН', time: '11:05', read: false, type: 'success' },
  ]);

  const updateProfile = () => {
    const profile = getUserProfile();
    setUser(profile);
    const config = getSystemConfig();
    setGlobalAlert(config.globalAlert);
    setWallet(getWalletState());
  };

  useEffect(() => {
    updateProfile();
    const interval = setInterval(updateProfile, 5000);
    window.addEventListener('balanceChanged', updateProfile);
    window.addEventListener('userUpdated', updateProfile);
    window.addEventListener('walletUpdated', updateProfile);
    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceChanged', updateProfile);
      window.removeEventListener('userUpdated', updateProfile);
      window.removeEventListener('walletUpdated', updateProfile);
    };
  }, []);

  useEffect(() => setIsNotifOpen(false), [location]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Cyberpunk Active State
  const isActive = (path: string) => location.pathname === path 
    ? 'text-cyber-cyan border-b-2 border-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.4)] bg-cyber-cyan/10' 
    : 'text-gray-500 hover:text-cyber-cyan hover:bg-cyber-cyan/5';

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}::${addr.substring(addr.length - 4)}`;

  return (
    <div className="min-h-screen bg-cyber-black text-gray-200 pb-24 md:pb-0 flex flex-col font-sans overflow-hidden relative">
      
      {/* Background Grid Effect */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-10 pointer-events-none z-0"></div>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

      {/* GLOBAL ALERT */}
      {globalAlert && (
        <div className="bg-cyber-pink/20 border-b border-cyber-pink text-cyber-pink px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 relative z-[60] tracking-widest uppercase font-mono animate-pulse">
            <Megaphone className="w-3 h-3" />
            СИСТЕМНОЕ ОПОВЕЩЕНИЕ: {globalAlert}
        </div>
      )}

      {/* TOP NAV - CYBER HUD */}
      <nav className="sticky top-0 z-50 border-b border-cyber-cyan/20 bg-cyber-black/80 backdrop-blur-md hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* LOGO */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyber-cyan blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-black border border-cyber-cyan p-2 rounded-none relative z-10">
                    <Cpu className="w-6 h-6 text-cyber-cyan" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-black italic tracking-tighter text-white group-hover:text-cyber-cyan transition-colors">
                    CRYPTO<span className="text-cyber-cyan">PULSE</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyber-cyan/60 tracking-[0.2em] leading-none">NEURAL FINANCE</span>
                </div>
              </Link>
              
              {/* DESKTOP MENU */}
              <div className="hidden md:flex items-center space-x-1 font-display tracking-wider text-sm">
                {[
                  { path: '/', label: 'КРИПТО' },
                  { path: '/forex', label: 'ФОРЕКС' },
                  { path: '/futures', label: 'ФЬЮЧЕРСЫ' },
                  { path: '/community', label: 'ТОП ТРЕЙДЕРЫ' },
                  { path: '/compare', label: 'СРАВНЕНИЕ' },
                  { path: '/favorites', label: 'ИЗБРАННОЕ' }
                ].map(link => (
                  <Link key={link.path} to={link.path} className={`px-4 py-2 transition-all duration-300 ${isActive(link.path)}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="hidden lg:flex items-center gap-2 px-3 py-1 border border-cyber-yellow/30 text-cyber-yellow text-xs font-mono hover:bg-cyber-yellow/10 transition-all">
                  <Zap className="w-3 h-3" /> UPGRADE
              </Link>

              <div className="relative hidden lg:block group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/50" />
                <input 
                  type="text" 
                  placeholder="ПОИСК АКТИВА..." 
                  className="bg-black border border-gray-800 text-sm w-48 pl-9 pr-4 py-1.5 text-cyber-cyan focus:border-cyber-cyan focus:outline-none font-mono placeholder-gray-700 transition-all focus:w-64 focus:shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                />
              </div>

              {/* WALLET */}
              {wallet.isConnected && wallet.address ? (
                 <button onClick={disconnectWallet} className="flex items-center gap-2 bg-black border border-cyber-green/50 hover:border-cyber-green text-cyber-green px-3 py-1.5 text-xs font-mono transition-all group relative overflow-hidden">
                    <div className="w-1.5 h-1.5 bg-cyber-green animate-pulse"></div>
                    {formatAddress(wallet.address)}
                    <div className="absolute inset-0 bg-cyber-green/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                 </button>
              ) : (
                 <button onClick={() => setIsWalletModalOpen(true)} className="cyber-button px-4 py-1.5 text-xs font-bold flex items-center gap-2">
                    <Wallet className="w-3 h-3" /> ПОДКЛЮЧИТЬ
                 </button>
              )}
              
              {/* NOTIFICATIONS */}
              <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`p-2 transition-colors relative ${isNotifOpen ? 'text-cyber-cyan' : 'text-gray-500 hover:text-cyber-cyan'}`}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyber-pink animate-ping"></span>}
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyber-pink"></span>}
                </button>

                {isNotifOpen && (
                   <div className="absolute top-full right-0 mt-4 w-80 bg-cyber-black border border-cyber-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.1)] z-50 origin-top-right animate-scale-in">
                      {/* Notif Content - styled appropriately */}
                      <div className="p-3 border-b border-cyber-cyan/20 flex justify-between items-center bg-cyber-cyan/5">
                          <h3 className="font-display text-cyber-cyan text-xs tracking-widest">СИСТЕМНЫЙ ЛОГ</h3>
                          <button onClick={markAllRead} className="text-[10px] text-gray-400 hover:text-white">ПРОЧИТАТЬ ВСЕ</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                          {notifications.map(n => (
                              <div key={n.id} className={`p-3 border-b border-gray-800 hover:bg-cyber-cyan/5 transition-colors group ${!n.read ? 'border-l-2 border-l-cyber-pink pl-2.5' : ''}`}>
                                  <div className="flex justify-between items-start">
                                      <span className={`font-mono text-xs ${n.type === 'alert' ? 'text-cyber-yellow' : 'text-cyber-green'}`}>{n.title}</span>
                                      <X onClick={(e) => deleteNotification(e, n.id)} className="w-3 h-3 text-gray-600 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100" />
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-mono mt-1">{n.time}</div>
                              </div>
                          ))}
                      </div>
                   </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-800 mx-1 skew-x-12"></div>
              
              {/* PROFILE */}
              {user && user.id !== 'demo-user' ? (
                <Link to="/profile" className="flex items-center gap-3 pl-2 pr-4 py-1 group">
                  <div className="relative">
                     {user.avatar ? (
                       <img src={user.avatar} className="w-9 h-9 object-cover border border-gray-600 group-hover:border-cyber-cyan transition-colors" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }} />
                     ) : (
                       <div className="w-9 h-9 bg-cyber-cyan/20 flex items-center justify-center text-cyber-cyan font-display border border-cyber-cyan" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>{user.name.charAt(0)}</div>
                     )}
                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-black border border-gray-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-cyber-green"></div>
                     </div>
                  </div>
                  <div className="text-right hidden xl:block">
                     <div className="font-display text-sm text-white group-hover:text-cyber-cyan transition-colors">{user.name}</div>
                     <div className="font-mono text-xs text-cyber-green tracking-wide">${user.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-2 text-white hover:text-cyber-cyan transition-colors text-sm font-display tracking-wide">
                  <LogIn className="w-4 h-4" /> ВОЙТИ
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-50 bg-cyber-black/90 backdrop-blur-lg border-b border-gray-800 px-4 h-16 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyber-cyan" />
            <span className="font-display font-bold text-lg tracking-wider text-white">CRYPTO<span className="text-cyber-cyan">PULSE</span></span>
         </div>
         <div className="flex items-center gap-4">
             <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="text-gray-400"><Bell className="w-5 h-5" /></button>
             <Link to="/profile" className="w-8 h-8 bg-cyber-cyan/20 border border-cyber-cyan flex items-center justify-center text-cyber-cyan font-bold">{user ? user.name.charAt(0) : '?'}</Link>
         </div>
         {/* Mobile notification sheet */}
         {isNotifOpen && (
             <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in">
                 <div className="p-4 border-b border-gray-800 flex justify-between">
                     <span className="font-mono text-cyber-cyan">УВЕДОМЛЕНИЯ</span>
                     <X onClick={() => setIsNotifOpen(false)} className="text-white" />
                 </div>
                 <div className="p-4 space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className="bg-gray-900 border border-gray-800 p-3">
                            <div className="font-bold text-white">{n.title}</div>
                        </div>
                    ))}
                 </div>
             </div>
         )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full relative z-10">
        {children}
      </main>

      {user && !user.is_pro && <MockAd />}
      
      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cyber-black/95 backdrop-blur-md border-t border-cyber-cyan/20 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 font-display text-[10px]">
          <Link to="/" className={`flex flex-col items-center gap-1 w-16 ${isActive('/') ? 'text-cyber-cyan' : 'text-gray-500'}`}>
             <BarChart2 className="w-5 h-5" /> КРИПТО
          </Link>
          <Link to="/community" className={`flex flex-col items-center gap-1 w-16 ${isActive('/community') ? 'text-cyber-cyan' : 'text-gray-500'}`}>
             <Trophy className="w-5 h-5" /> ТОП
          </Link>
          
           <Link to={user && user.id !== 'demo-user' ? "/profile" : "/login"} className="relative -top-6">
             <div className="w-14 h-14 bg-black border-2 border-cyber-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
               <User className="w-6 h-6 text-white" />
             </div>
           </Link>

           <Link to="/futures" className={`flex flex-col items-center gap-1 w-16 ${isActive('/futures') ? 'text-cyber-cyan' : 'text-gray-500'}`}>
             <TrendingUp className="w-5 h-5" /> ФЬЮЧ.
          </Link>
           <Link to="/favorites" className={`flex flex-col items-center gap-1 w-16 ${isActive('/favorites') ? 'text-cyber-cyan' : 'text-gray-500'}`}>
             <Star className="w-5 h-5" /> ИЗБР.
          </Link>
        </div>
      </div>
    </div>
  );
};