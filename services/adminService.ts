
import { SystemConfig, UserProfile, SystemLog, UserActivity } from '../types';
import { getUserProfile, logUserActivity } from './userService';

const CONFIG_KEY = 'cryptopulse_sys_config';
const LOGS_KEY = 'cryptopulse_sys_logs';
const USERS_KEY = 'cryptopulse_users_v2';
const ACTIVITY_KEY = 'cryptopulse_user_activity';

const DEFAULT_CONFIG: SystemConfig = {
  maintenanceMode: false,
  marketVolatility: 1.0,
  marketBias: 'NEUTRAL',
  allowRegistrations: true,
  globalAlert: null
};

const MOCK_PREFERENCES = {
  currency: 'USD' as const,
  language: 'EN' as const,
  notifications: {
    email: true,
    push: true,
    priceAlerts: false
  },
  twoFactorEnabled: false
};

// Updated MOCK_USERS to match UserProfile interface fully
const MOCK_USERS: UserProfile[] = [
  { 
    name: "Alice Trader", 
    email: "alice@crypto.com", 
    balance: 45000, 
    equity: 52000, 
    positions: [], 
    is_pro: true, 
    member_since: "2023-01-15", 
    status: 'ACTIVE',
    preferences: MOCK_PREFERENCES,
    achievements: [],
    level: 12,
    xp: 5400,
    avatar: ''
  },
  { 
    name: "Bob Hodler", 
    email: "bob@gmail.com", 
    balance: 1200, 
    equity: 800, 
    positions: [], 
    is_pro: false, 
    member_since: "2023-06-20", 
    status: 'SUSPENDED',
    preferences: MOCK_PREFERENCES,
    achievements: [],
    level: 2,
    xp: 300,
    avatar: ''
  },
  { 
    name: "Charlie Whale", 
    email: "c.whale@fund.org", 
    balance: 1500000, 
    equity: 2100000, 
    positions: [], 
    is_pro: true, 
    member_since: "2022-11-01", 
    status: 'ACTIVE',
    preferences: MOCK_PREFERENCES,
    achievements: [],
    level: 50,
    xp: 100000,
    avatar: ''
  },
];

export const getSystemConfig = (): SystemConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const updateSystemConfig = (updates: Partial<SystemConfig>) => {
  const current = getSystemConfig();
  const updated = { ...current, ...updates };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  logSystemEvent('INFO', `System configuration updated: ${Object.keys(updates).join(', ')}`);
  return updated;
};

export const getAllUsers = (): UserProfile[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const adminSetUserBalance = (userId: string, newBalance: number) => {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        const oldBalance = users[index].balance;
        users[index].balance = newBalance;
        users[index].equity = newBalance;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        logUserActivity(userId, 'BALANCE_ADJUSTMENT', `Admin changed balance from $${oldBalance.toFixed(2)} to $${newBalance.toFixed(2)}`);
        return true;
    }
    return false;
};

export const getUserActivityLogs = (userId: string): UserActivity[] => {
    const logs: UserActivity[] = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
    return logs.filter(l => l.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const updateUserStatus = (id: string, status: 'ACTIVE' | 'BANNED' | 'SUSPENDED') => {
  const users: UserProfile[] = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index].status = status;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    logSystemEvent('WARNING', `User ${id} status changed to ${status}`);
    return true;
  }
  return false;
};

export const logSystemEvent = (level: SystemLog['level'], message: string) => {
  const logs = getSystemLogs();
  const newLog: SystemLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    message,
    source: 'AdminPanel'
  };
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
};

export const getSystemLogs = (): SystemLog[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getSystemStats = () => {
  const users = getAllUsers();
  const active = users.filter(u => u.status === 'ACTIVE').length;
  return {
    totalVolume: 84239482100,
    activeUsers: active,
    serverLoad: 23,
    dbLatency: 45,
  };
};
