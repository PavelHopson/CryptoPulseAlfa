import { CoinData, AssetCategory, Timeframe, ChartPoint } from '../types';
import { getSystemConfig } from './adminService';

const API_URL = 'https://api.coingecko.com/api/v3';

export interface ServiceResponse<T> {
  data: T;
  error?: string;
}

// --- MOCK DATA GENERATORS ---

const generateSparkline = (basePrice: number, volatility: number = 0.02) => {
  return Array.from({length: 168}, () => basePrice + (Math.random() - 0.5) * (basePrice * volatility));
};

// Helper to simulate live price updates (Jitter)
// NOW READS FROM ADMIN CONFIG
const applyLiveJitter = (coins: CoinData[]): CoinData[] => {
  const config = getSystemConfig();
  const volMultiplier = config.marketVolatility; // 1.0 is default
  const bias = config.marketBias; 

  return coins.map(coin => {
    const baseVol = coin.category === 'crypto' ? 0.002 : 0.0005; 
    const volatility = baseVol * volMultiplier;
    
    let direction = (Math.random() - 0.5); // -0.5 to 0.5
    
    // Apply Bias
    if (bias === 'BULLISH') direction += 0.2;
    if (bias === 'BEARISH') direction -= 0.2;

    const change = 1 + (direction * volatility);
    const newPrice = coin.current_price * change;
    
    return {
      ...coin,
      current_price: newPrice,
      price_change_percentage_24h: coin.price_change_percentage_24h + (direction * 0.1 * volMultiplier)
    };
  });
};

// --- MOCK HISTORY GENERATOR FOR TIMEFRAMES ---
export const fetchCoinHistory = async (coinId: string, timeframe: Timeframe, currentPrice: number): Promise<ChartPoint[]> => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 400));

  const points: ChartPoint[] = [];
  const now = Date.now();
  let pointsCount = 100;
  let interval = 0;
  let volatility = 0.01;

  switch (timeframe) {
    case '1H':
      pointsCount = 60;
      interval = 60 * 1000; // 1 minute
      volatility = 0.002;
      break;
    case '1D':
      pointsCount = 96; // every 15 min
      interval = 15 * 60 * 1000;
      volatility = 0.01;
      break;
    case '1W':
      pointsCount = 84; // every 2 hours
      interval = 2 * 60 * 60 * 1000;
      volatility = 0.03;
      break;
    case '1M':
      pointsCount = 30; // daily
      interval = 24 * 60 * 60 * 1000;
      volatility = 0.08;
      break;
    case '1Y':
      pointsCount = 52; // weekly
      interval = 7 * 24 * 60 * 60 * 1000;
      volatility = 0.25;
      break;
  }

  // Generate backwards from current price
  let lastPrice = currentPrice;
  
  for (let i = 0; i < pointsCount; i++) {
    const time = now - (i * interval);
    
    // Format time based on timeframe
    let timeStr = '';
    const dateObj = new Date(time);
    
    if (timeframe === '1H' || timeframe === '1D') {
      timeStr = dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1W' || timeframe === '1M') {
      timeStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } else {
      timeStr = dateObj.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    }

    points.unshift({
      originalTime: time,
      time: timeStr,
      price: lastPrice
    });

    // Random walk for previous price
    const change = 1 + (Math.random() - 0.5) * volatility;
    lastPrice = lastPrice / change;
  }

  return points;
};


const MOCK_FOREX: CoinData[] = [
  {
    id: 'eur-usd', symbol: 'EUR/USD', name: 'Евро / Доллар', image: 'https://flagcdn.com/w80/eu.png',
    current_price: 1.0845, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 50000000000,
    high_24h: 1.0890, low_24h: 1.0810, price_change_24h: 0.0025, price_change_percentage_24h: 0.23,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 1.60, ath_change_percentage: -32, ath_date: '', atl: 0.82, atl_change_percentage: 32, atl_date: '', roi: null, last_updated: '',
    category: 'forex', sparkline_in_7d: { price: generateSparkline(1.08, 0.01) }
  },
  {
    id: 'usd-jpy', symbol: 'USD/JPY', name: 'Доллар / Йена', image: 'https://flagcdn.com/w80/jp.png',
    current_price: 155.60, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 40000000000,
    high_24h: 156.10, low_24h: 155.20, price_change_24h: -0.40, price_change_percentage_24h: -0.26,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 160.20, ath_change_percentage: -3, ath_date: '', atl: 75.00, atl_change_percentage: 100, atl_date: '', roi: null, last_updated: '',
    category: 'forex', sparkline_in_7d: { price: generateSparkline(155, 0.015) }
  },
  {
    id: 'usd-rub', symbol: 'USD/RUB', name: 'Доллар / Рубль', image: 'https://flagcdn.com/w80/ru.png',
    current_price: 92.45, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 5000000000,
    high_24h: 93.00, low_24h: 91.80, price_change_24h: 0.50, price_change_percentage_24h: 0.54,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 120.00, ath_change_percentage: -23, ath_date: '', atl: 23.00, atl_change_percentage: 300, atl_date: '', roi: null, last_updated: '',
    category: 'forex', sparkline_in_7d: { price: generateSparkline(92, 0.03) }
  },
  {
    id: 'usd-cny', symbol: 'USD/CNY', name: 'Доллар / Юань', image: 'https://flagcdn.com/w80/cn.png',
    current_price: 7.24, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 15000000000,
    high_24h: 7.25, low_24h: 7.23, price_change_24h: 0.01, price_change_percentage_24h: 0.14,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 8.28, ath_change_percentage: -12, ath_date: '', atl: 6.04, atl_change_percentage: 20, atl_date: '', roi: null, last_updated: '',
    category: 'forex', sparkline_in_7d: { price: generateSparkline(7.24, 0.005) }
  }
];

const MOCK_FUTURES: CoinData[] = [
  {
    id: 'spx-500', symbol: 'US500', name: 'S&P 500', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/S%26P_Standard_%26_Poor%27s_logo.svg/1200px-S%26P_Standard_%26_Poor%27s_logo.svg.png',
    current_price: 5230.50, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 0,
    high_24h: 5250.00, low_24h: 5210.00, price_change_24h: 15.50, price_change_percentage_24h: 0.30,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 5300, ath_change_percentage: -1.3, ath_date: '', atl: 666, atl_change_percentage: 685, atl_date: '', roi: null, last_updated: '',
    category: 'futures', sparkline_in_7d: { price: generateSparkline(5200, 0.03) }
  },
  {
    id: 'nasdaq-100', symbol: 'NAS100', name: 'Nasdaq 100', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/NASDAQ_Logo.svg/1200px-NASDAQ_Logo.svg.png',
    current_price: 18150.20, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 0,
    high_24h: 18300.00, low_24h: 17950.00, price_change_24h: 85.20, price_change_percentage_24h: 0.47,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 18500, ath_change_percentage: -1.9, ath_date: '', atl: 800, atl_change_percentage: 2100, atl_date: '', roi: null, last_updated: '',
    category: 'futures', sparkline_in_7d: { price: generateSparkline(18000, 0.04) }
  },
  {
    id: 'gold', symbol: 'XAU', name: 'Золото (Gold)', image: 'https://cdn-icons-png.flaticon.com/512/197/197596.png',
    current_price: 2350.10, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 0,
    high_24h: 2365.00, low_24h: 2340.00, price_change_24h: 8.10, price_change_percentage_24h: 0.35,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 2450, ath_change_percentage: -4, ath_date: '', atl: 1050, atl_change_percentage: 123, atl_date: '', roi: null, last_updated: '',
    category: 'futures', sparkline_in_7d: { price: generateSparkline(2350, 0.02) }
  },
  {
    id: 'oil-wti', symbol: 'WTI', name: 'Нефть WTI', image: 'https://cdn-icons-png.flaticon.com/512/2102/2102494.png',
    current_price: 78.40, market_cap: 0, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 0,
    high_24h: 79.20, low_24h: 77.80, price_change_24h: -0.90, price_change_percentage_24h: -1.14,
    market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 0, total_supply: 0, max_supply: 0,
    ath: 147, ath_change_percentage: -46, ath_date: '', atl: -37, atl_change_percentage: 311, atl_date: '', roi: null, last_updated: '',
    category: 'futures', sparkline_in_7d: { price: generateSparkline(78, 0.05) }
  }
];

const MOCK_COINS: CoinData[] = [
  {
    id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 64231.45, market_cap: 1200000000000, market_cap_rank: 1, fully_diluted_valuation: 1300000000000, total_volume: 35000000000,
    high_24h: 65000, low_24h: 63000, price_change_24h: -1.2, price_change_percentage_24h: -1.2,
    market_cap_change_24h: -1000000000, market_cap_change_percentage_24h: -1.2, circulating_supply: 19000000, total_supply: 21000000, max_supply: 21000000,
    ath: 73750, ath_change_percentage: -12.5, ath_date: '2024-03-14T00:00:00.000Z', atl: 67.81, atl_change_percentage: 90000, atl_date: '2013-07-06T00:00:00.000Z', roi: null, last_updated: '2024-05-20T12:00:00.000Z',
    category: 'crypto', sparkline_in_7d: { price: generateSparkline(64000, 0.04) }
  },
  {
    id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3050.12, market_cap: 360000000000, market_cap_rank: 2, fully_diluted_valuation: null, total_volume: 15000000000,
    high_24h: 3100, low_24h: 2950, price_change_24h: 2.5, price_change_percentage_24h: 2.5,
    market_cap_change_24h: 5000000000, market_cap_change_percentage_24h: 2.5, circulating_supply: 120000000, total_supply: 120000000, max_supply: null,
    ath: 4891, ath_change_percentage: -37.5, ath_date: '2021-11-16T00:00:00.000Z', atl: 0.42, atl_change_percentage: 700000, atl_date: '2015-10-21T00:00:00.000Z', roi: null, last_updated: '2024-05-20T12:00:00.000Z',
    category: 'crypto', sparkline_in_7d: { price: generateSparkline(3050, 0.04) }
  }
];

// --- DATA FETCHERS ---

export const fetchMarketData = async (category: AssetCategory): Promise<ServiceResponse<CoinData[]>> => {
  if (category === 'crypto') {
    return fetchTopCoins();
  } else if (category === 'forex') {
    await new Promise(r => setTimeout(r, 600)); 
    return { data: applyLiveJitter(MOCK_FOREX) };
  } else if (category === 'futures') {
    await new Promise(r => setTimeout(r, 600));
    return { data: applyLiveJitter(MOCK_FUTURES) };
  }
  return { data: [] };
};

export const fetchTopCoins = async (): Promise<ServiceResponse<CoinData[]>> => {
  try {
    const response = await fetch(
      `${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      console.warn('CoinGecko API rate limited or down, using mock data.');
      return { 
        data: applyLiveJitter(MOCK_COINS),
        error: 'Рыночные данные временно недоступны. Показаны кешированные данные.'
      };
    }
    
    const data = await response.json();
    return { data: data.map((c: any) => ({ ...c, category: 'crypto' })) };
  } catch (error) {
    console.error('Failed to fetch coins:', error);
    return { 
      data: applyLiveJitter(MOCK_COINS),
      error: 'Ошибка сети. Показаны кешированные данные.'
    };
  }
};

export const fetchCoinDetails = async (id: string, category: AssetCategory = 'crypto'): Promise<ServiceResponse<CoinData | null>> => {
  // Handle non-crypto assets using mock data
  if (category === 'forex') {
    const asset = MOCK_FOREX.find(a => a.id === id);
    return { data: asset ? applyLiveJitter([asset])[0] : null };
  }
  if (category === 'futures') {
    const asset = MOCK_FUTURES.find(a => a.id === id);
    return { data: asset ? applyLiveJitter([asset])[0] : null };
  }

  // Existing Crypto logic
  try {
     const response = await fetch(
      `${API_URL}/coins/markets?vs_currency=usd&ids=${id}&sparkline=true&price_change_percentage=24h`
    );
     if (!response.ok) {
        const mock = MOCK_COINS.find(c => c.id === id);
        return {
          data: mock ? applyLiveJitter([mock])[0] : null,
          error: mock ? 'Детали недоступны. Используется кеш.' : 'Не удалось получить детали.'
        };
     }
     const data = await response.json();
     return { data: data[0] ? { ...data[0], category: 'crypto' } : null };
  } catch (error) {
      console.error('Error fetching detail:', error);
      const mock = MOCK_COINS.find(c => c.id === id);
      return {
        data: mock ? applyLiveJitter([mock])[0] : null,
        error: mock ? 'Ошибка сети. Используется кеш.' : 'Не удалось подключиться к провайдеру данных.'
      };
  }
};

export const fetchFavoriteCoins = async (ids: string[]): Promise<ServiceResponse<CoinData[]>> => {
  if (ids.length === 0) return { data: [] };
  
  // Filter mock non-crypto assets first
  const nonCryptoFavorites = [
    ...MOCK_FOREX.filter(a => ids.includes(a.id)),
    ...MOCK_FUTURES.filter(a => ids.includes(a.id))
  ];

  // Filter for actual crypto IDs
  const cryptoIds = ids.filter(id => !nonCryptoFavorites.find(nc => nc.id === id));
  
  if (cryptoIds.length === 0) return { data: applyLiveJitter(nonCryptoFavorites) };

  try {
    const response = await fetch(
      `${API_URL}/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      return {
        data: applyLiveJitter([...nonCryptoFavorites, ...MOCK_COINS.filter(c => cryptoIds.includes(c.id))]),
        error: 'Не удалось обновить избранное. Показан кеш.'
      };
    }
    
    const data = await response.json();
    return { data: [...applyLiveJitter(nonCryptoFavorites), ...data.map((c: any) => ({...c, category: 'crypto'}))] };
  } catch (error) {
    console.error('Failed to fetch favorite coins:', error);
    return {
      data: applyLiveJitter([...nonCryptoFavorites, ...MOCK_COINS.filter(c => cryptoIds.includes(c.id))]),
      error: 'Ошибка соединения. Показан кеш.'
    };
  }
};