
import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, Search, Bell, User, Star, TrendingUp, DollarSign, Shield, LogIn, Check, X, Info, CheckCircle, AlertTriangle, Trophy, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { MockAd } from './MockAd';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Notification State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bitcoin пробил $65,000', time: '2 мин назад', read: false, type: 'alert' },
    { id: 2, title: 'Успешный депозит $10,000', time: '1 час назад', read: false, type: 'success' },
    { id: 3, title: 'Новая функция: AI Analyst', time: '3 часа назад', read: true, type: 'info' },
    { id: 4, title: 'Добро пожаловать в CryptoPulse', time: '1 день назад', read: true, type: 'info' },
  ]);

  const updateProfile = () => {
    const profile = getUserProfile();
    setUser(profile);
  };

  useEffect(() => {
    updateProfile();
    window.addEventListener('balanceChanged', updateProfile);
    window.addEventListener('userUpdated', updateProfile);
    return () => {
      window.removeEventListener('balanceChanged', updateProfile);
      window.removeEventListener('userUpdated', updateProfile);
    };
  }, []);

  useEffect(() => {
    updateProfile();
    setIsNotifOpen(false); // Close notifs on route change
  }, [location]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const isActive = (path: string) => location.pathname === path ? 'text-brand-500 bg-brand-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50';

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-brand-500 selection:text-white pb-24 md:pb-0 flex flex-col">
      {/* Top Navigation (Desktop) */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-dark-bg/80 backdrop-blur-xl hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-brand-500 to-purple-600 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  CryptoPulse
                </span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/')}`}>Крипто</Link>
                <Link to="/forex" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/forex')}`}>Форекс</Link>
                <Link to="/futures" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/futures')}`}>Фьючерсы</Link>
                <Link to="/community" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/community')}`}>Сообщество</Link>
                <Link to="/favorites" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/favorites')}`}>Избранное</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
                  <CreditCard className="w-4 h-4" /> Тарифы
              </Link>
              <div className="relative hidden lg:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Поиск активов..." 
                  className="bg-dark-card border border-gray-700 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-64 transition-all"
                />
              </div>
              
              {/* Notification Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-full transition-colors relative ${isNotifOpen ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {isNotifOpen && (
                   <>
                     <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                     <div className="absolute top-full right-0 mt-2 w-80 bg-dark-card border border-gray-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in origin-top-right ring-1 ring-black ring-opacity-5">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                            <h3 className="font-bold text-white text-sm">Уведомления</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Все
                                </button>
                            )}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">Нет новых уведомлений</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors relative group ${!n.read ? 'bg-brand-500/5' : ''}`}>
                                        <button 
                                            onClick={(e) => deleteNotification(e, n.id)}
                                            className="absolute right-2 top-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-transparent'}`}></div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {n.type === 'alert' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                                                    {n.type === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                    {n.type === 'info' && <Info className="w-3 h-3 text-blue-500" />}
                                                    <span className={`font-medium text-sm ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{n.time}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-2 bg-gray-900/50 border-t border-gray-800 text-center">
                            <button className="text-xs text-gray-500 hover:text-gray-300">История уведомлений</button>
                        </div>
                     </div>
                   </>
                )}
              </div>

              <div className="h-6 w-px bg-gray-800 mx-1"></div>
              
              {user && user.id !== 'demo-user' ? (
                <Link to="/profile" className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full transition-all ${isActive('/profile')}`}>
                  {user.avatar ? (
                     <img 
                       src={user.avatar} 
                       alt={user.name} 
                       className="w-8 h-8 rounded-full object-cover ring-2 ring-dark-bg bg-gray-800"
                       onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           const fallback = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                           if (target.src !== fallback) {
                               target.src = fallback;
                           }
                       }}
                     />
                  ) : (
                     <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-dark-bg">
                        {user.name.charAt(0)}
                     </div>
                  )}
                  <div className="text-xs text-left hidden xl:block">
                     <div className="font-bold text-white">{user.name}</div>
                     <div className="text-emerald-400">${user.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <LogIn className="w-4 h-4" /> Войти
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-dark-bg/90 backdrop-blur-lg border-b border-gray-800 px-4 h-16 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500" />
            <span className="font-bold text-lg">CryptoPulse</span>
         </div>
         <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className="relative text-gray-400"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-dark-bg"></span>
                )}
            </button>
            {user && user.id !== 'demo-user' ? (
                <Link to="/profile" className="block">
                  {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                     <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {user.name.charAt(0)}
                     </div>
                  )}
                </Link>
            ) : (
                <Link to="/login" className="text-brand-500">
                <LogIn className="w-6 h-6" />
                </Link>
            )}
         </div>

         {/* Mobile Notification Sheet */}
         {isNotifOpen && (
             <div className="fixed inset-0 z-50 bg-dark-bg flex flex-col animate-fade-in">
                 <div className="flex justify-between items-center p-4 border-b border-gray-800">
                     <h2 className="text-lg font-bold">Уведомления</h2>
                     <button onClick={() => setIsNotifOpen(false)}><X className="w-6 h-6" /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {notifications.map(n => (
                         <div key={n.id} className="bg-dark-card p-4 rounded-lg border border-gray-800 flex gap-4">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-gray-600'}`}></div>
                            <div>
                                <div className="font-bold text-sm mb-1">{n.title}</div>
                                <div className="text-xs text-gray-500">{n.time}</div>
                            </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full relative">
        {children}
      </main>

      {/* Ad Overlay for Non-Pro Users */}
      {user && !user.is_pro && <MockAd />}
      
      <footer className="hidden md:block border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-gray-600">
           <div>© 2025 CryptoPulse Inc. Все права защищены.</div>
           <Link to="/admin" className="hover:text-gray-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Admin Access</Link>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-xl border-t border-gray-800 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={`flex flex-col items-center gap-1 w-16 transition-all ${location.pathname === '/' ? 'text-brand-500' : 'text-gray-400'}`}>
             <BarChart2 className="w-5 h-5" />
             <span className="text-[10px] font-medium">Крипто</span>
          </Link>
          <Link to="/community" className={`flex flex-col items-center gap-1 w-16 transition-all ${location.pathname === '/community' ? 'text-brand-500' : 'text-gray-400'}`}>
             <Trophy className="w-5 h-5" />
             <span className="text-[10px] font-medium">Топ</span>
          </Link>
          
           <Link to={user && user.id !== 'demo-user' ? "/profile" : "/login"} className="relative -top-5 group cursor-pointer">
             <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 border-4 border-dark-bg overflow-hidden">
               {user && user.avatar ? (
                   <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
               ) : (
                   <User className="w-5 h-5 text-white" />
               )}
             </div>
           </Link>

           <Link to="/futures" className={`flex flex-col items-center gap-1 w-16 transition-all ${location.pathname === '/futures' ? 'text-brand-500' : 'text-gray-400'}`}>
             <TrendingUp className="w-5 h-5" />
             <span className="text-[10px] font-medium">Торги</span>
          </Link>
           <Link to="/favorites" className={`flex flex-col items-center gap-1 w-16 transition-all ${location.pathname === '/favorites' ? 'text-brand-500' : 'text-gray-400'}`}>
             <Star className="w-5 h-5" />
             <span className="text-[10px] font-medium">Избр.</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
