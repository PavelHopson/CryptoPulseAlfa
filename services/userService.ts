import { UserProfile, Position, CoinData, Transaction, AssetAllocation, PerformancePoint, UserActivity } from '../types';

const STORAGE_KEY_USERS = 'cryptopulse_users_v2';
const STORAGE_KEY_SESSION = 'cryptopulse_session_id';
const STORAGE_KEY_ACTIVITY = 'cryptopulse_user_activity';
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const INITIAL_STATE: UserProfile = {
  id: 'demo-user',
  name: "Трейдер (Демо)",
  email: "demo@cryptopulse.ai",
  password: "demo",
  avatar: '',
  balance: 100000,
  equity: 100000,
  positions: [],
  transactions: [],
  is_pro: true,
  member_since: new Date().toISOString(),
  preferences: {
    currency: 'USD',
    language: 'RU',
    notifications: {
      email: true,
      push: true,
      priceAlerts: false
    },
    twoFactorEnabled: false
  },
  achievements: [],
  level: 1,
  xp: 0
};

const PAVEL_USER: UserProfile = {
  id: 'pavel-hopson-id',
  name: "PavelHopson",
  email: "garaa11@mail.ru",
  password: "Zeref1997",
  avatar: 'https://cdn-icons-png.flaticon.com/512/12114/12114233.png', // Default Crypto Avatar
  balance: 500000, // VIP Balance
  equity: 500000,
  positions: [],
  transactions: [],
  is_pro: true,
  member_since: new Date().toISOString(),
  preferences: {
    currency: 'USD',
    language: 'RU',
    notifications: {
      email: true,
      push: true,
      priceAlerts: true
    },
    twoFactorEnabled: false
  },
  achievements: [],
  level: 10, // Bonus Level
  xp: 5000
};

// --- Helpers Defined Before Use ---

const saveAllUsers = (users: UserProfile[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

const getAllUsers = (): UserProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  let users: UserProfile[] = stored ? JSON.parse(stored) : [];

  let needsSave = false;

  // Ensure Demo User exists
  if (!users.find(u => u.id === 'demo-user')) {
    const demoUser = JSON.parse(JSON.stringify(INITIAL_STATE));
    users.push(demoUser);
    needsSave = true;
  }

  // Ensure Pavel exists and is synced
  const pavelIndex = users.findIndex(u => u.email === PAVEL_USER.email);
  if (pavelIndex === -1) {
    users.push(PAVEL_USER);
    needsSave = true;
  } else {
    // Sync static data if changed in code
    const existingPavel = users[pavelIndex];
    if (existingPavel.avatar !== PAVEL_USER.avatar) {
         users[pavelIndex] = { ...existingPavel, avatar: PAVEL_USER.avatar };
         needsSave = true;
    }
  }

  if (needsSave) {
    saveAllUsers(users);
  }

  return users;
};

export const logUserActivity = (userId: string, type: UserActivity['type'], details: string) => {
  const storedLogs = localStorage.getItem(STORAGE_KEY_ACTIVITY);
  const logs: UserActivity[] = storedLogs ? JSON.parse(storedLogs) : [];
  
  const newLog: UserActivity = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    type,
    details,
    timestamp: new Date().toISOString(),
    ip: '192.168.1.' + Math.floor(Math.random() * 255)
  };

  // Keep last 500 logs total
  const updatedLogs = [newLog, ...logs].slice(0, 500);
  localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(updatedLogs));
};

// --- Public API ---

export const getUserProfile = (): UserProfile => {
  const users = getAllUsers();
  const sessionId = localStorage.getItem(STORAGE_KEY_SESSION);
  
  if (!sessionId) {
     // No session, try to default to demo
     const demo = users.find(u => u.id === 'demo-user');
     if (demo) {
       localStorage.setItem(STORAGE_KEY_SESSION, 'demo-user');
       return demo;
     }
     return users[0];
  }

  const user = users.find(u => u.id === sessionId);
  
  if (!user) {
      // Session ID invalid (user deleted?), fallback to demo
      const demo = users.find(u => u.id === 'demo-user');
      if (demo) {
        localStorage.setItem(STORAGE_KEY_SESSION, 'demo-user');
        return demo;
      }
      return users[0];
  }
  
  return user;
};

export const registerUser = (name: string, email: string, password: string): { success: boolean, message: string } => {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'Пользователь с таким email уже существует' };
  }

  const newUser: UserProfile = {
    ...JSON.parse(JSON.stringify(INITIAL_STATE)),
    id: Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    email: normalizedEmail,
    password,
    avatar: '',
    member_since: new Date().toISOString(),
    balance: 10000, // Bonus
    equity: 10000,
    transactions: [],
    positions: [],
    achievements: [],
    level: 1,
    xp: 0
  };

  users.push(newUser);
  saveAllUsers(users);
  localStorage.setItem(STORAGE_KEY_SESSION, newUser.id!);
  logUserActivity(newUser.id!, 'LOGIN', 'New user registration');
  return { success: true, message: 'Регистрация успешна' };
};

export const loginUser = (email: string, password: string): { success: boolean, message: string } => {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  
  // Strict check
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
  
  if (user && user.id) {
    localStorage.setItem(STORAGE_KEY_SESSION, user.id);
    logUserActivity(user.id, 'LOGIN', 'Login via email');
    return { success: true, message: 'Вход выполнен успешно' };
  }
  return { success: false, message: 'Неверный email или пароль' };
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
  window.location.reload();
};

export const updateUserProfile = (updates: Partial<UserProfile>): UserProfile => {
  const current = getUserProfile();
  if (!current.id) return current;

  const users = getAllUsers();
  const index = users.findIndex(u => u.id === current.id);
  
  if (index === -1) return current;

  // Perform deep merge for preferences
  const updatedUser = { ...current, ...updates };
  if (updates.preferences) {
    updatedUser.preferences = {
      ...current.preferences,
      ...updates.preferences,
      notifications: {
        ...current.preferences.notifications,
        ...updates.preferences.notifications
      }
    };
  }

  users[index] = updatedUser;
  saveAllUsers(users);
  
  // Logging
  if (updates.avatar) logUserActivity(current.id, 'PROFILE_UPDATE', 'Avatar changed');
  else if (updates.name || updates.email) logUserActivity(current.id, 'PROFILE_UPDATE', 'Profile details updated');
  else if (updates.preferences) logUserActivity(current.id, 'PROFILE_UPDATE', 'Preferences updated');

  return updatedUser;
};

export const resetAccount = (): UserProfile => {
  const current = getUserProfile();
  if (!current.id) return current;

  const resetUser: UserProfile = {
    ...current,
    balance: 100000,
    equity: 100000,
    positions: [],
    transactions: [],
    achievements: [],
    level: 1,
    xp: 0
  };
  
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === current.id);
  if (index !== -1) {
    users[index] = resetUser;
    saveAllUsers(users);
    logUserActivity(current.id, 'SECURITY_UPDATE', 'Account reset performed');
  }

  return resetUser;
};

export const depositFunds = (amount: number, currency: 'USD' | 'EUR' | 'RUB', method: string) => {
  const profile = getUserProfile();
  if (!profile.id) return profile;
  
  let usdAmount = amount;
  if (currency === 'RUB') usdAmount = amount / 92.5;
  if (currency === 'EUR') usdAmount = amount * 1.08;

  const transaction: Transaction = {
    id: Math.random().toString(36).substr(2, 9),
    type: 'DEPOSIT',
    amount: usdAmount,
    currency: 'USD', 
    status: 'COMPLETED',
    date: new Date().toISOString()
  };

  const updated = {
    ...profile,
    balance: profile.balance + usdAmount,
    transactions: [transaction, ...(profile.transactions || [])]
  };

  updateUserProfile(updated);
  logUserActivity(profile.id, 'BALANCE_ADJUSTMENT', `Deposit: +$${usdAmount.toFixed(2)} via ${method}`);
  return updated;
};

export const executeTrade = (
  asset: CoinData, 
  type: 'LONG' | 'SHORT', 
  amount: number, 
  leverage: number = 1
): { success: boolean; message: string } => {
  const profile = getUserProfile();
  
  const totalValue = asset.current_price * amount;
  const marginRequired = totalValue / leverage;

  if (profile.balance < marginRequired) {
    return { success: false, message: `Недостаточно средств. Требуется: $${marginRequired.toFixed(2)}` };
  }

  const newPosition: Position = {
    id: Math.random().toString(36).substr(2, 9),
    assetId: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    type,
    entryPrice: asset.current_price,
    amount,
    leverage,
    timestamp: Date.now(),
  };

  const updated = {
    ...profile,
    balance: profile.balance - marginRequired,
    positions: [newPosition, ...profile.positions]
  };
  
  updateUserProfile(updated);
  return { success: true, message: `Ордер ${type} исполнен: ${amount} ${asset.symbol}` };
};

export const closePosition = (positionId: string, currentPrice: number): UserProfile => {
  const profile = getUserProfile();
  const positionIndex = profile.positions.findIndex(p => p.id === positionId);
  
  if (positionIndex === -1) return profile;

  const pos = profile.positions[positionIndex];
  
  let pnl = 0;
  if (pos.type === 'LONG') {
    pnl = (currentPrice - pos.entryPrice) * pos.amount;
  } else {
    pnl = (pos.entryPrice - currentPrice) * pos.amount;
  }

  const margin = (pos.entryPrice * pos.amount) / pos.leverage;
  
  const updated = {
    ...profile,
    balance: profile.balance + margin + pnl,
    positions: profile.positions.filter(p => p.id !== positionId)
  };
  
  updateUserProfile(updated);
  return updated;
};

export const calculateEquity = (profile: UserProfile, currentPrices: Record<string, number>): number => {
  let unrealizedPnL = 0;
  
  profile.positions.forEach(pos => {
    const currentPrice = currentPrices[pos.assetId] || pos.entryPrice;
    if (pos.type === 'LONG') {
      unrealizedPnL += (currentPrice - pos.entryPrice) * pos.amount;
    } else {
      unrealizedPnL += (pos.entryPrice - currentPrice) * pos.amount;
    }
  });
  
  const totalUsedMargin = profile.positions.reduce((sum, pos) => {
    return sum + ((pos.entryPrice * pos.amount) / pos.leverage);
  }, 0);

  return profile.balance + totalUsedMargin + unrealizedPnL;
};

export const getAssetAllocation = (user: UserProfile, currentPrices: Record<string, number>): AssetAllocation[] => {
  const totalEquity = calculateEquity(user, currentPrices);
  const allocation: AssetAllocation[] = [];

  if (user.balance > 0) {
    allocation.push({
      name: 'US Dollar',
      symbol: 'USD',
      value: user.balance,
      percentage: 0, 
      color: '#10b981'
    });
  }

  user.positions.forEach((pos, index) => {
    const price = currentPrices[pos.assetId] || pos.entryPrice;
    let pnl = 0;
    if (pos.type === 'LONG') {
      pnl = (price - pos.entryPrice) * pos.amount;
    } else {
      pnl = (pos.entryPrice - price) * pos.amount;
    }
    const margin = (pos.entryPrice * pos.amount) / pos.leverage;
    const posValue = Math.max(0, margin + pnl); 

    if (posValue > 0) {
      allocation.push({
        name: pos.name,
        symbol: pos.symbol,
        value: posValue,
        percentage: 0,
        color: COLORS[index % COLORS.length]
      });
    }
  });

  return allocation.map(item => ({
    ...item,
    percentage: (item.value / totalEquity) * 100
  })).sort((a, b) => b.value - a.value);
};

export const getPerformanceHistory = (user: UserProfile): PerformancePoint[] => {
  const points: PerformancePoint[] = [];
  const days = 30;
  const now = Date.now();
  let currentValue = user.equity; 
  
  for (let i = 0; i < days; i++) {
    points.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      value: currentValue
    });
    
    const change = 1 + (Math.random() - 0.5) * 0.05;
    currentValue = currentValue / change;
  }
  
  return points.reverse();
};