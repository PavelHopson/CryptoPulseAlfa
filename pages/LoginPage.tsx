import React, { useState } from 'react';
import { Activity, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../services/userService';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate network
    await new Promise(r => setTimeout(r, 1000));

    if (isLogin) {
      const res = loginUser(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else {
      const res = registerUser(name, email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-card border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl shadow-brand-900/20 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-900/50 p-8 text-center border-b border-gray-800">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-tr from-brand-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-brand-500/30">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">CryptoPulse</h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Добро пожаловать' : 'Создайте аккаунт трейдера'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Имя</label>
                <div className="relative">
                   <User className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                   <input 
                     type="text" 
                     placeholder="Ваше имя"
                     value={name}
                     onChange={e => setName(e.target.value)}
                     className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none transition-colors"
                     required
                   />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
              <div className="relative">
                 <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                 <input 
                   type="email" 
                   placeholder="name@example.com"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none transition-colors"
                   required
                 />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Пароль</label>
              <div className="relative">
                 <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                 <input 
                   type="password" 
                   placeholder="••••••••"
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none transition-colors"
                   required
                 />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Обработка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              {isLogin ? 'Регистрация' : 'Войти'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};