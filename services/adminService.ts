import { SystemConfig, UserProfile, SystemLog } from '../types';
import { getUserProfile } from './userService';

const CONFIG_KEY = 'cryptopulse_sys_config';
const LOGS_KEY = 'cryptopulse_sys_logs';

const DEFAULT_CONFIG: SystemConfig = {
  maintenanceMode: false,
  marketVolatility: 1.0, // Normal
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

// Mock Users for the Table (since we don't have a real backend DB)
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
    preferences: MOCK_PREFERENCES
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
    preferences: MOCK_PREFERENCES
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
    preferences: MOCK_PREFERENCES
  },
  { 
    name: "Dave Daytrader", 
    email: "dave@day.io", 
    balance: 500, 
    equity: 0, 
    positions: [], 
    is_pro: false, 
    member_since: "2024-02-10", 
    status: 'BANNED',
    preferences: MOCK_PREFERENCES
  },
  { 
    name: "Eve Sniper", 
    email: "eve@signals.net", 
    balance: 89000, 
    equity: 95000, 
    positions: [], 
    is_pro: true, 
    member_since: "2023-09-05", 
    status: 'ACTIVE',
    preferences: MOCK_PREFERENCES
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
  // Combine the real local user with mock users
  const localUser = getUserProfile();
  return [
    { ...localUser, id: 'local-user-1', status: 'ACTIVE' }, 
    ...MOCK_USERS.map((u, i) => ({ ...u, id: `mock-${i}` }))
  ];
};

export const updateUserStatus = (id: string, status: 'ACTIVE' | 'BANNED' | 'SUSPENDED') => {
  // In a real app, this would API call. Here we just log it.
  if (id === 'local-user-1') {
    // potentially lock the local user out
  }
  logSystemEvent('WARNING', `User ${id} status changed to ${status}`);
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
  // Keep last 50 logs
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
};

export const getSystemLogs = (): SystemLog[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getSystemStats = () => {
  return {
    totalVolume: 84239482100,
    activeUsers: 14532,
    serverLoad: 23, // %
    dbLatency: 45, // ms
  };
};