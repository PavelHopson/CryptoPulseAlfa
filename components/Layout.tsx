import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, Search, Bell, User, Star, TrendingUp, DollarSign, Shield, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { UserProfile } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);

  const updateProfile = () => {
    const profile = getUserProfile();
    setUser(profile);
  };

  useEffect(() => {
    updateProfile();
    window.addEventListener('balanceChanged', updateProfile);
    return () => window.removeEventListener('balanceChanged', updateProfile);
  }, []);

  useEffect(() => {
    updateProfile();
  }, [location]);

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
                <Link to="/favorites" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/favorites')}`}>Избранное</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Поиск активов..." 
                  className="bg-dark-card border border-gray-700 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-64 transition-all"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-6 w-px bg-gray-800 mx-1"></div>
              
              {user && user.id !== 'demo-user' ? (
                <Link to="/profile" className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full transition-all ${isActive('/profile')}`}>
                  <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
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
         {user && user.id !== 'demo-user' ? (
            <Link to="/profile" className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {user.name.charAt(0)}
            </Link>
         ) : (
            <Link to="/login" className="text-brand-500">
              <LogIn className="w-6 h-6" />
            </Link>
         )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {children}
      </main>
      
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
          <Link to="/forex" className={`flex flex-col items-center gap-1 w-16 transition-all ${location.pathname === '/forex' ? 'text-brand-500' : 'text-gray-400'}`}>
             <DollarSign className="w-5 h-5" />
             <span className="text-[10px] font-medium">Форекс</span>
          </Link>
          
           <Link to={user && user.id !== 'demo-user' ? "/profile" : "/login"} className="relative -top-5 group cursor-pointer">
             <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 border-4 border-dark-bg">
               <User className="w-5 h-5 text-white" />
             </div>
           </Link>

           <Link to="/futures" className={`flex flex-col items-center gap-1 w-16 transition-all ${location.pathname === '/futures' ? 'text-brand-500' : 'text-gray-400'}`}>
             <TrendingUp className="w-5 h-5" />
             <span className="text-[10px] font-medium">Фьючерсы</span>
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