
export type AssetCategory = 'crypto' | 'forex' | 'futures';
export type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
  category?: AssetCategory;
}

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  amount: number;
  leverage: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_FEE';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
}

export interface AssetAllocation {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface UserPreferences {
  currency: 'USD' | 'EUR' | 'RUB';
  language: 'EN' | 'RU';
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
  };
  twoFactorEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'LOGIN' | 'PROFILE_UPDATE' | 'BALANCE_ADJUSTMENT' | 'SECURITY_UPDATE';
  details: string;
  timestamp: string;
  ip?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  balance: number;
  equity: number;
  positions: Position[];
  transactions?: Transaction[];
  preferences: UserPreferences;
  is_pro: boolean;
  member_since: string;
  status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  achievements: Achievement[];
  level: number;
  xp: number;
}

export interface ChartPoint {
  time: string;
  price: number;
  originalTime: number;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  originalTime: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  type: 'MARKET' | 'PROJECT';
}

export interface TraderProfile {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  profitPercent: number;
  winRate: number;
  followers: number;
  isHot: boolean;
  topAsset: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  marketVolatility: number;
  marketBias: 'NEUTRAL' | 'BULLISH' | 'BEARISH';
  allowRegistrations: boolean;
  globalAlert: string | null;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  source: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balanceEth: number;
  provider: string | null; // 'Metamask' | 'WalletConnect' etc
}