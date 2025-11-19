
import React from 'react';
import { X } from 'lucide-react';

export const MockAd: React.FC = () => {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-40 max-w-sm w-full animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg shadow-2xl border-2 border-yellow-400 p-4 relative overflow-hidden">
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/20 rounded-full p-1"
        >
          <X className="w-3 h-3" />
        </button>
        
        <div className="text-xs font-bold bg-black/30 text-white px-2 py-0.5 rounded inline-block mb-2">
          РЕКЛАМА
        </div>
        
        <div className="flex gap-3 items-center">
            <div className="text-3xl">🚀</div>
            <div>
                <h4 className="font-bold text-white text-lg leading-tight">MemeCoin X1000?</h4>
                <p className="text-white/90 text-xs mt-1">Успей купить до листинга на Binance! Только сегодня бонус +50%.</p>
            </div>
        </div>
        
        <button className="w-full mt-3 bg-white text-orange-700 font-bold py-2 rounded text-sm hover:bg-gray-100 transition-colors shadow-lg">
           Узнать подробнее
        </button>
      </div>
    </div>
  );
};
