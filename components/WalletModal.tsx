import React, { useState } from 'react';
import { X, Wallet, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { connectWallet } from '../services/web3Service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WalletModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      await connectWallet(provider);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setConnecting(null);
      }, 1000);
    } catch (e) {
      setConnecting(null);
    }
  };

  const wallets = [
    { id: 'Metamask', name: 'MetaMask', icon: '🦊', color: 'bg-orange-500/10 border-orange-500/50 text-orange-500' },
    { id: 'WalletConnect', name: 'WalletConnect', icon: '📡', color: 'bg-blue-500/10 border-blue-500/50 text-blue-500' },
    { id: 'Trust', name: 'Trust Wallet', icon: '🛡️', color: 'bg-cyan-500/10 border-cyan-500/50 text-cyan-500' },
    { id: 'Phantom', name: 'Phantom', icon: '👻', color: 'bg-purple-500/10 border-purple-500/50 text-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl shadow-black/50 animate-scale-in">
        
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Wallet className="w-5 h-5 text-brand-500" /> Подключить Кошелек
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-3">
           {success ? (
             <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Успешно!</h3>
                <p className="text-gray-400 text-sm mt-2">Ваш кошелек привязан к профилю CryptoPulse.</p>
             </div>
           ) : (
             <>
               <p className="text-sm text-gray-400 mb-4">Выберите провайдера для подключения Web3 активов.</p>
               {wallets.map(w => (
                 <button 
                   key={w.id}
                   onClick={() => handleConnect(w.id)}
                   disabled={connecting !== null}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${connecting === w.id ? 'bg-brand-600 border-brand-500' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800 hover:border-gray-600'}`}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gray-900 ${w.color}`}>
                          {w.icon}
                       </div>
                       <div className="text-left">
                          <div className={`font-bold ${connecting === w.id ? 'text-white' : 'text-gray-200'}`}>{w.name}</div>
                          {connecting === w.id && <div className="text-xs text-white/80">Подключение...</div>}
                       </div>
                    </div>
                    {connecting === w.id ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                    )}
                 </button>
               ))}
             </>
           )}
        </div>
        
        <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center text-xs text-gray-500">
           Подключаясь, вы соглашаетесь с Условиями Использования.
        </div>
      </div>
    </div>
  );
};