
import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Bitcoin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { depositFunds } from '../services/userService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'RUB'>('RUB'); // Default to RUB for RU audience
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Пожалуйста, введите корректную сумму');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate network processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      depositFunds(val, currency, method);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setAmount('');
        onClose();
      }, 1500);
    } catch (e) {
      setError('Транзакция не удалась. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl shadow-black/50 animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-500" /> Пополнение счета
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!success ? (
            <>
              {/* Currency Selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Валюта</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['RUB', 'USD', 'EUR'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`py-2 rounded-lg text-sm font-bold transition-colors border ${
                        currency === c 
                        ? 'bg-brand-600 border-brand-500 text-white' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Способ оплаты</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => setMethod('card')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      method === 'card' ? 'bg-brand-500/10 border-brand-500 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Банковская карта (Visa/MC/Mir)</span>
                    </div>
                    {method === 'card' && <CheckCircle className="w-4 h-4 text-brand-500" />}
                  </button>

                  <button 
                    onClick={() => setMethod('sbp')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      method === 'sbp' ? 'bg-brand-500/10 border-brand-500 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium">СБП (Быстрый платеж)</span>
                    </div>
                    {method === 'sbp' && <CheckCircle className="w-4 h-4 text-brand-500" />}
                  </button>

                  <button 
                    onClick={() => setMethod('crypto')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      method === 'crypto' ? 'bg-brand-500/10 border-brand-500 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bitcoin className="w-5 h-5" />
                      <span className="font-medium">Криптовалюта</span>
                    </div>
                    {method === 'crypto' && <CheckCircle className="w-4 h-4 text-brand-500" />}
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Сумма пополнения</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 font-bold">{currency}</span>
                </div>
                {currency !== 'USD' && amount && (
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    Примерно ${(
                      parseFloat(amount) * (currency === 'RUB' ? 0.0108 : 1.08)
                    ).toFixed(2)} USD
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button
                onClick={handleDeposit}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Обработка...' : 'Подтвердить платеж'}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Оплата прошла успешно!</h3>
              <p className="text-gray-400">Средства зачислены на ваш баланс.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};