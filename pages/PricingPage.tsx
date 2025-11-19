
import React, { useState } from 'react';
import { Check, X, Zap, Shield, Crown, Star } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { useNavigate } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const user = getUserProfile();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    // Simulate processing
    await new Promise(r => setTimeout(r, 1500));
    
    if (planId === 'FREE') {
        updateUserProfile({ is_pro: false });
    } else {
        updateUserProfile({ is_pro: true });
    }
    
    window.dispatchEvent(new Event('userUpdated'));
    setLoading(null);
    navigate('/profile');
  };

  const plans = [
    {
      id: 'FREE',
      name: 'Starter',
      price: 0,
      icon: <Star className="w-6 h-6 text-gray-400" />,
      description: 'Для новичков, изучающих рынок.',
      features: [
        'Доступ к Топ-20 монетам',
        'Базовые графики (Recharts)',
        'Избранное (до 5 активов)',
        'Новости рынка',
        'Сообщество трейдеров'
      ],
      limitations: [
        'Наличие рекламы',
        'Нет AI аналитики',
        'Нет TradingView графиков',
        'Нет сигналов на покупку'
      ],
      buttonText: 'Ваш текущий план',
      isCurrent: !user.is_pro,
      color: 'gray'
    },
    {
      id: 'PRO',
      name: 'Pro Trader',
      price: billing === 'MONTHLY' ? 9.99 : 99.99,
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      description: 'Максимальный набор инструментов.',
      features: [
        'Все функции Starter',
        'Отключение рекламы',
        'AI Аналитик (Gemini)',
        'TradingView графики (OHLC)',
        'Неограниченное избранное',
        'Сигналы (Buy/Sell)',
        'Приоритетная поддержка'
      ],
      limitations: [],
      buttonText: 'Выбрать Pro',
      isCurrent: user.is_pro && user.balance < 1000000, // Simplified logic
      color: 'brand',
      popular: true
    },
    {
      id: 'WHALE',
      name: 'Whale Club',
      price: billing === 'MONTHLY' ? 49.99 : 499.99,
      icon: <Crown className="w-6 h-6 text-purple-400" />,
      description: 'Для профессионалов с крупным капиталом.',
      features: [
        'Все функции Pro',
        'Персональный менеджер',
        'Доступ к закрытому чату',
        'Кредитное плечо до 100x',
        'API доступ',
        'Скрытые гемы (Alpha)'
      ],
      limitations: [],
      buttonText: 'Стать Китом',
      isCurrent: false, 
      color: 'purple'
    }
  ];

  return (
    <div className="animate-fade-in pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Выберите свой уровень</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Инвестируйте в лучшие инструменты для анализа рынка. 
          <span className="text-brand-400"> Отмените в любой момент.</span>
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-8 gap-4">
          <span className={`text-sm font-bold ${billing === 'MONTHLY' ? 'text-white' : 'text-gray-500'}`}>Ежемесячно</span>
          <button 
            onClick={() => setBilling(billing === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className="w-14 h-8 bg-gray-800 rounded-full relative border border-gray-700 transition-colors"
          >
            <div className={`absolute top-1 w-6 h-6 bg-brand-500 rounded-full transition-all ${billing === 'YEARLY' ? 'left-7' : 'left-1'}`}></div>
          </button>
          <span className={`text-sm font-bold ${billing === 'YEARLY' ? 'text-white' : 'text-gray-500'}`}>
            Ежегодно <span className="text-green-400 text-xs ml-1">-20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative bg-dark-card border rounded-2xl p-8 flex flex-col transition-all hover:transform hover:-translate-y-2 duration-300
              ${plan.popular ? 'border-brand-500 shadow-2xl shadow-brand-500/20' : 'border-gray-800 hover:border-gray-600'}
            `}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                РЕКОМЕНДУЕМ
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className={`p-2 rounded-lg bg-${plan.color === 'gray' ? 'gray' : plan.color}-500/10`}>
                     {plan.icon}
                   </div>
                   <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-400 min-h-[40px]">{plan.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-gray-500 text-sm"> / {billing === 'MONTHLY' ? 'мес' : 'год'}</span>
            </div>

            <div className="space-y-4 flex-1 mb-8">
              {plan.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className={`w-5 h-5 flex-shrink-0 text-${plan.color === 'gray' ? 'gray' : plan.color}-500`} />
                  <span>{feat}</span>
                </div>
              ))}
              {plan.limitations.map((lim, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span>{lim}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.isCurrent || loading !== null}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${plan.isCurrent 
                  ? 'bg-gray-800 text-gray-400 cursor-default' 
                  : plan.popular 
                    ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'}
              `}
            >
              {loading === plan.id ? 'Обработка...' : plan.isCurrent ? 'Текущий план' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-20 px-4">
         <h2 className="text-2xl font-bold text-white mb-8 text-center">Частые вопросы</h2>
         <div className="space-y-4">
            <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
               <h3 className="font-bold text-white mb-2">Как отключить рекламу?</h3>
               <p className="text-gray-400 text-sm">Реклама автоматически отключается при переходе на тариф Pro или Whale.</p>
            </div>
            <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
               <h3 className="font-bold text-white mb-2">Могу ли я вернуть деньги?</h3>
               <p className="text-gray-400 text-sm">Да, мы предоставляем 7-дневный пробный период. Если вам не понравится, мы вернем деньги.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
