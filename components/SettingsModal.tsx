
import React, { useState, useEffect } from 'react';
import { X, Save, User, Shield, Bell, Globe, AlertTriangle, CheckCircle, Trash2, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { getUserProfile, updateUserProfile, resetAccount, logoutUser } from '../services/userService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'PREFS'>('GENERAL');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    language: 'EN',
    emailNotif: true,
    pushNotif: true,
    priceAlerts: false,
    twoFactor: false
  });
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      const profile = getUserProfile();
      setUser(profile);
      setFormData({
        name: profile.name,
        email: profile.email,
        currency: profile.preferences.currency,
        language: profile.preferences.language,
        emailNotif: profile.preferences.notifications.email,
        pushNotif: profile.preferences.notifications.push,
        priceAlerts: profile.preferences.notifications.priceAlerts,
        twoFactor: profile.preferences.twoFactorEnabled
      });
      setFeedback(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    updateUserProfile({
      name: formData.name,
      email: formData.email,
      preferences: {
        currency: formData.currency as any,
        language: formData.language as any,
        notifications: {
          email: formData.emailNotif,
          push: formData.pushNotif,
          priceAlerts: formData.priceAlerts
        },
        twoFactorEnabled: formData.twoFactor
      }
    });
    setFeedback({ type: 'success', message: 'Настройки успешно сохранены' });
    onUpdate(); 
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleReset = () => {
    if (confirm("Вы уверены? Это действие удалит всю историю торгов и вернет демо-баланс к $100k. Это нельзя отменить.")) {
      resetAccount();
      onUpdate();
      onClose();
      alert("Аккаунт сброшен.");
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-dark-card border border-gray-700 rounded-2xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl shadow-black/50 animate-scale-in flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-gray-900/50 border-b md:border-b-0 md:border-r border-gray-700 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
           <div className="text-xs font-bold text-gray-500 uppercase mb-2 hidden md:block">Настройки</div>
           
           <button 
             onClick={() => setActiveTab('GENERAL')}
             className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'GENERAL' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
           >
             <User className="w-4 h-4" /> Профиль
           </button>
           <button 
             onClick={() => setActiveTab('SECURITY')}
             className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'SECURITY' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
           >
             <Shield className="w-4 h-4" /> Безопасность
           </button>
           <button 
             onClick={() => setActiveTab('PREFS')}
             className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'PREFS' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
           >
             <Globe className="w-4 h-4" /> Интерфейс
           </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
           <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-dark-card">
              <h2 className="text-xl font-bold text-white">
                {activeTab === 'GENERAL' ? 'Настройки профиля' : activeTab === 'SECURITY' ? 'Безопасность' : 'Настройки приложения'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
           </div>

           <div className="p-6 overflow-y-auto flex-1">
              
              {feedback && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                   {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                   {feedback.message}
                </div>
              )}

              {/* GENERAL TAB */}
              {activeTab === 'GENERAL' && (
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                        {formData.name.charAt(0)}
                      </div>
                      <div>
                        <button className="text-brand-400 text-sm font-medium hover:text-brand-300">Изменить аватар</button>
                        <p className="text-xs text-gray-500">Рекомендуется: 400x400px</p>
                      </div>
                   </div>

                   <div className="grid gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Имя</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      
                      <div className="pt-6 border-t border-gray-800 flex flex-col gap-3">
                         <button 
                           onClick={handleLogout}
                           className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors text-gray-300"
                         >
                            <LogOut className="w-4 h-4" /> Выйти из аккаунта
                         </button>

                        <div className="mt-4">
                            <h3 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Опасная зона</h3>
                            <button 
                            onClick={handleReset}
                            className="w-full px-4 py-2 border border-red-900/50 text-red-500 hover:bg-red-900/20 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                            <Trash2 className="w-4 h-4" /> Сбросить данные аккаунта
                            </button>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'SECURITY' && (
                <div className="space-y-6">
                   <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-3">
                            <Shield className={`w-6 h-6 ${formData.twoFactor ? 'text-green-500' : 'text-gray-500'}`} />
                            <div>
                               <div className="font-medium text-white">Двухфакторная аутентификация (2FA)</div>
                               <div className="text-xs text-gray-400">Защитите свой аккаунт</div>
                            </div>
                         </div>
                         <button 
                           onClick={() => setFormData({...formData, twoFactor: !formData.twoFactor})}
                           className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.twoFactor ? 'bg-brand-500' : 'bg-gray-600'}`}
                         >
                           <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </button>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-white font-medium mb-4">Смена пароля</h3>
                      <div className="space-y-3">
                         <input type="password" placeholder="Текущий пароль" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none" />
                         <input type="password" placeholder="Новый пароль" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none" />
                      </div>
                   </div>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'PREFS' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Валюта отображения</label>
                        <div className="grid grid-cols-3 gap-2">
                           {['USD', 'EUR', 'RUB'].map((c) => (
                             <button
                               key={c}
                               onClick={() => setFormData({...formData, currency: c})}
                               className={`py-2 rounded-lg text-sm font-bold transition-colors border ${
                                 formData.currency === c 
                                 ? 'bg-brand-600 border-brand-500 text-white' 
                                 : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                               }`}
                             >
                               {c}
                             </button>
                           ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Язык</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button
                             onClick={() => setFormData({...formData, language: 'EN'})}
                             className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors border flex items-center justify-center gap-2 ${
                               formData.language === 'EN' 
                               ? 'bg-brand-600 border-brand-500 text-white' 
                               : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                             }`}
                           >
                             <span className="text-lg">🇺🇸</span> English
                           </button>
                           <button
                             onClick={() => setFormData({...formData, language: 'RU'})}
                             className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors border flex items-center justify-center gap-2 ${
                               formData.language === 'RU' 
                               ? 'bg-brand-600 border-brand-500 text-white' 
                               : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                             }`}
                           >
                             <span className="text-lg">🇷🇺</span> Русский
                           </button>
                        </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Bell className="w-4 h-4" /> Уведомления</h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                            <span className="text-sm text-gray-300">Email рассылка</span>
                            <input 
                                type="checkbox" 
                                checked={formData.emailNotif}
                                onChange={e => setFormData({...formData, emailNotif: e.target.checked})}
                                className="w-4 h-4 accent-brand-500" 
                            />
                         </div>
                         <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                            <span className="text-sm text-gray-300">Push уведомления</span>
                            <input 
                                type="checkbox" 
                                checked={formData.pushNotif}
                                onChange={e => setFormData({...formData, pushNotif: e.target.checked})}
                                className="w-4 h-4 accent-brand-500" 
                            />
                         </div>
                      </div>
                   </div>
                </div>
              )}

           </div>

           {/* Footer */}
           <div className="p-6 border-t border-gray-700 bg-dark-card flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 text-gray-400 hover:text-white font-medium transition-colors">Отмена</button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-colors"
              >
                 <Save className="w-4 h-4" /> Сохранить
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};