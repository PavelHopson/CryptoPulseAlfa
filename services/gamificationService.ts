import { UserProfile, Achievement } from '../types';
import { updateUserProfile, getUserProfile } from './userService';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_trade', title: 'Первый Шаг', description: 'Открыть первую сделку', icon: '🚀' },
  { id: 'profit_1k', title: 'Акула Рынка', description: 'Заработать $1,000 чистой прибыли', icon: '🦈' },
  { id: 'loss_survivor', title: 'Железные Нервы', description: 'Пережить просадку, но не закрыться', icon: '🛡️' },
  { id: 'leverage_master', title: 'Мастер Риска', description: 'Открыть сделку с плечом 20x+', icon: '⚡' },
  { id: 'diversified', title: 'Инвестор', description: 'Иметь активы в Крипто, Форекс и Фьючерсах одновременно', icon: '🌐' },
  { id: 'copy_cat', title: 'Зеркало', description: 'Скопировать сделку другого трейдера', icon: '👯' }
];

export const checkAchievements = (user: UserProfile): Achievement[] => {
  const unlocked: Achievement[] = [];
  const existingIds = user.achievements?.map(a => a.id) || [];

  // 1. First Trade
  if (user.positions.length > 0 && !existingIds.includes('first_trade')) {
    unlocked.push(ALL_ACHIEVEMENTS.find(a => a.id === 'first_trade')!);
  }

  // 2. Profit > 1k
  const totalProfit = user.equity - 100000; // Assuming 100k start
  if (totalProfit > 1000 && !existingIds.includes('profit_1k')) {
    unlocked.push(ALL_ACHIEVEMENTS.find(a => a.id === 'profit_1k')!);
  }

  // 3. High Leverage
  const hasHighLev = user.positions.some(p => p.leverage >= 20);
  if (hasHighLev && !existingIds.includes('leverage_master')) {
    unlocked.push(ALL_ACHIEVEMENTS.find(a => a.id === 'leverage_master')!);
  }
  
  // If new achievements
  if (unlocked.length > 0) {
    const newAchievements = [...(user.achievements || []), ...unlocked.map(a => ({...a, unlockedAt: new Date().toISOString()}))];
    // Level up logic: 1 Badge = 100 XP. Level = XP / 200
    const newXP = (user.xp || 0) + (unlocked.length * 100);
    const newLevel = Math.floor(newXP / 200) + 1;
    
    updateUserProfile({
      achievements: newAchievements,
      xp: newXP,
      level: newLevel
    });
    
    return unlocked;
  }

  return [];
};

export const getLevelProgress = (user: UserProfile) => {
    const currentLevelXP = (user.level - 1) * 200;
    const nextLevelXP = user.level * 200;
    const currentXP = user.xp || 0;
    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
};