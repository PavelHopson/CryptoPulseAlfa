
import { UserProfile, Position, CoinData, Transaction, AssetAllocation, PerformancePoint } from '../types';

const STORAGE_KEY_USERS = 'cryptopulse_users_v2';
const STORAGE_KEY_SESSION = 'cryptopulse_session_id';
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const INITIAL_STATE: UserProfile = {
  id: 'demo-user',
  name: "Трейдер (Демо)",
  email: "demo@cryptopulse.ai",
  password: "demo",
  balance: 100000, // $100k Demo Account
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
  }
};

// Helper to get all users
const getAllUsers = (): UserProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  return stored ? JSON.parse(stored) : [INITIAL_STATE];
};

// Helper to save all users
const saveAllUsers = (users: UserProfile[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const getUserProfile = (): UserProfile => {
  const users = getAllUsers();
  const sessionId = localStorage.getItem(STORAGE_KEY_SESSION);
  
  if (!sessionId) {
     // Default to demo user if no session, or ensure demo exists
     const demo = users.find(u => u.id === 'demo-user');
     if (demo) return demo;
     // Re-init demo if lost
     saveAllUsers([INITIAL_STATE]);
     return INITIAL_STATE;
  }

  const user = users.find(u => u.id === sessionId);
  return user || INITIAL_STATE;
};

export const registerUser = (name: string, email: string, password: string): { success: boolean, message: string } => {
  const users = getAllUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Пользователь с таким email уже существует' };
  }

  const newUser: UserProfile = {
    ...INITIAL_STATE,
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, // In a real app, hash this!
    member_since: new Date().toISOString(),
    balance: 10000, // Start bonus
    equity: 10000,
    transactions: []
  };

  users.push(newUser);
  saveAllUsers(users);
  localStorage.setItem(STORAGE_KEY_SESSION, newUser.id!);
  return { success: true, message: 'Регистрация успешна' };
};

export const loginUser = (email: string, password: string): { success: boolean, message: string } => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user && user.id) {
    localStorage.setItem(STORAGE_KEY_SESSION, user.id);
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

  const updated = { ...current, ...updates };
  
  // Deep merge preferences
  if (updates.preferences) {
    updated.preferences = {
      ...current.preferences,
      ...updates.preferences,
      notifications: {
        ...current.preferences.notifications,
        ...updates.preferences.notifications
      }
    };
  }

  // Save to list
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === current.id);
  if (index !== -1) {
    users[index] = updated;
    saveAllUsers(users);
  }

  return updated;
};

export const resetAccount = (): UserProfile => {
  const current = getUserProfile();
  if (!current.id) return current;

  const resetUser: UserProfile = {
    ...current,
    balance: 100000,
    equity: 100000,
    positions: [],
    transactions: []
  };
  
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === current.id);
  if (index !== -1) {
    users[index] = resetUser;
    saveAllUsers(users);
  }

  return resetUser;
};

export const depositFunds = (amount: number, currency: 'USD' | 'EUR' | 'RUB', method: string) => {
  const profile = getUserProfile();
  
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

  // 1. Cash (USD)
  if (user.balance > 0) {
    allocation.push({
      name: 'US Dollar',
      symbol: 'USD',
      value: user.balance,
      percentage: 0, // calc later
      color: '#10b981' // Emerald
    });
  }

  // 2. Positions
  user.positions.forEach((pos, index) => {
    const price = currentPrices[pos.assetId] || pos.entryPrice;
    
    let pnl = 0;
    if (pos.type === 'LONG') {
      pnl = (price - pos.entryPrice) * pos.amount;
    } else {
      pnl = (pos.entryPrice - price) * pos.amount;
    }
    const margin = (pos.entryPrice * pos.amount) / pos.leverage;
    // Equity Value of the position for allocation chart
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

  // Calculate percentages
  return allocation.map(item => ({
    ...item,
    percentage: (item.value / totalEquity) * 100
  })).sort((a, b) => b.value - a.value);
};

export const getPerformanceHistory = (user: UserProfile): PerformancePoint[] => {
  // Simulate a history graph based on "Member Since"
  const points: PerformancePoint[] = [];
  const days = 30;
  const now = Date.now();
  let currentValue = user.equity; 
  
  // Generate backwards from current equity
  for (let i = 0; i < days; i++) {
    points.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      value: currentValue
    });
    
    // Reverse random walk logic to create history
    // If market was "volatile", change is bigger
    const change = 1 + (Math.random() - 0.5) * 0.05;
    currentValue = currentValue / change;
  }
  
  return points.reverse();
};
