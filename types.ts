
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
  // Unified fields for non-crypto assets
  category?: AssetCategory;
}

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  amount: number; // Quantity of asset
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

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  password?: string; // Only for mock auth
  balance: number; // Available Cash
  equity: number; // Cash + Unrealized PnL
  positions: Position[];
  transactions?: Transaction[];
  preferences: UserPreferences;
  is_pro: boolean;
  member_since: string;
  status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
}

export interface ChartPoint {
  time: string;
  price: number;
  originalTime: number; // Timestamp for sorting
}

export enum TimeRange {
  H24 = '24h',
  D7 = '7d',
  D30 = '30d'
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string; // Snippet
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  type: 'MARKET' | 'PROJECT'; // Market news or Site update
}

// --- ADMIN TYPES ---

export interface SystemConfig {
  maintenanceMode: boolean;
  marketVolatility: number; // 0.1 to 5.0 multiplier
  marketBias: 'NEUTRAL' | 'BULLISH' | 'BEARISH'; // Influences random jitter
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