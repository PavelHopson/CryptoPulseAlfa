import React, { useState, useEffect } from 'react';
import { X, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { CoinData } from '../types';
import { getUserProfile, executeTrade } from '../services/userService';
import { checkAchievements } from '../services/gamificationService';

interface Props {
  coin: CoinData;
  type: 'LONG' | 'SHORT';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TradeModal: React.FC<Props> = ({ coin, type, isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<string>('1');
  const [leverage, setLeverage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBalance(getUserProfile().balance);
      setAmount(coin.category === 'crypto' ? '0.1' : '1');
      setError(null);
      setUnlockedBadge(null);
    }
  }, [isOpen, coin]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const totalValue = numAmount * coin.current_price;
  const marginRequired = totalValue / leverage;
  const canAfford = balance >= marginRequired;

  const handleExecute = async () => {
    if (!canAfford) return;
    setLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    const result = executeTrade(coin, type, numAmount, leverage);
    
    if (result.success) {
      // Check gamification
      const user = getUserProfile();
      const badges = checkAchievements(user);
      if (badges.length > 0) {
        setUnlockedBadge(badges[0].title);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        onSuccess();
        onClose();
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl shadow-black/50 animate-fade-in">
        {/* Badge Celebration Overlay */}
        {unlockedBadge && (
            <div className="absolute inset-0 z-20 bg-brand-900/90 flex flex-col items-center justify-center text-center p-6 animate-scale-in">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
                <div className="bg-brand-600 text-white px-4 py-2 rounded-full font-bold text-lg">{unlockedBadge}</div>
                <p className="text-gray-300 mt-4 text-sm">You've leveled up your trading profile.</p>
            </div>
        )}

        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-700 flex justify-between items-center ${type === 'LONG' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
           <h2 className={`text-xl font-bold flex items-center gap-2 ${type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
             {type === 'LONG' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
             {type === 'LONG' ? 'Покупка' : 'Продажа'} {coin.symbol}
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Info */}
          <div className="flex justify-between items-center">
             <span className="text-gray-400">Цена входа</span>
             <span className="text-xl font-bold text-white">${coin.current_price.toLocaleString()}</span>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Количество ({coin.symbol})</label>
            <div className="relative">
               <input 
                 type="number" 
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none transition-colors"
                 placeholder="0.00"
                 step="any"
               />
               <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-bold">{coin.symbol}</span>
            </div>
          </div>

          {/* Leverage Slider */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Кредитное плечо</span>
              <span className="text-brand-400 font-bold">{leverage}x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={coin.category === 'crypto' ? "20" : "100"} 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1x</span>
              <span>{coin.category === 'crypto' ? '20x' : '100x'}</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
             <div className="flex justify-between">
                <span className="text-gray-400">Объем сделки</span>
                <span className="text-white">${totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-400">Маржа</span>
                <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                  ${marginRequired.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </span>
             </div>
             <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-400">Доступный баланс</span>
                <span className="text-gray-300">${balance.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
             </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleExecute}
            disabled={loading || !canAfford || numAmount <= 0}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
              ${type === 'LONG' 
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading ? 'Обработка...' : `Подтвердить ${type === 'LONG' ? 'Покупку' : 'Продажу'}`}
          </button>
        </div>
      </div>
    </div>
  );
};