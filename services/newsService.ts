
import { NewsArticle } from '../types';

// Using rss2json to bridge CORS issues and fetch real Investing.com feeds
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json';
const INVESTING_RU_RSS = 'https://ru.investing.com/rss/news.rss';
const INVESTING_CRYPTO_RSS = 'https://ru.investing.com/rss/news_301.rss'; // Crypto specific

export const fetchMarketNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(`${RSS_TO_JSON_API}?rss_url=${encodeURIComponent(INVESTING_RU_RSS)}`);
    const data = await response.json();

    if (data.status === 'ok') {
      return data.items.map((item: any) => ({
        id: item.guid || Math.random().toString(36),
        title: item.title,
        description: stripHtml(item.description).substring(0, 120) + '...',
        url: item.link,
        source: 'Investing.com',
        publishedAt: formatDate(item.pubDate),
        imageUrl: item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=200',
        type: 'MARKET'
      }));
    }
    return getMockNews();
  } catch (error) {
    console.error("News fetch error, using mock:", error);
    return getMockNews();
  }
};

export const getProjectNews = (): NewsArticle[] => {
  return [
    {
      id: 'p1',
      title: 'Обновление платформы 2.0: AI Аналитика',
      description: 'Мы внедрили Gemini AI для глубокого анализа активов. Теперь вы можете получать прогнозы на основе технического анализа.',
      url: '#',
      source: 'CryptoPulse Team',
      publishedAt: 'Сегодня',
      type: 'PROJECT',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'p2',
      title: 'Добавлены рынки Форекс и Фьючерсов',
      description: 'Теперь вы можете торговать не только криптовалютой. Доступны пары EUR/USD, Нефть, Золото и S&P 500.',
      url: '#',
      source: 'Dev Team',
      publishedAt: 'Вчера',
      type: 'PROJECT',
      imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'p3',
      title: 'Технические работы завершены',
      description: 'Мы оптимизировали базу данных и улучшили скорость загрузки графиков на 40%.',
      url: '#',
      source: 'System Admin',
      publishedAt: '23 Окт',
      type: 'PROJECT',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&q=80&w=200'
    }
  ];
};

// Fallback if API fails
const getMockNews = (): NewsArticle[] => [
  {
    id: '1',
    title: 'Биткоин тестирует уровень $65,000 на фоне новостей из США',
    description: 'Рынок криптовалют показывает высокую волатильность в ожидании решения ФРС по процентной ставке.',
    url: 'https://ru.investing.com/crypto/bitcoin/news',
    source: 'Investing.com',
    publishedAt: '1 час назад',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=200',
    type: 'MARKET'
  },
  {
    id: '2',
    title: 'Нефть дорожает из-за геополитической напряженности',
    description: 'Фьючерсы на нефть марки Brent превысили отметку $85 за баррель.',
    url: 'https://ru.investing.com/commodities/brent-oil',
    source: 'Investing.com',
    publishedAt: '3 часа назад',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=200',
    type: 'MARKET'
  }
];

function stripHtml(html: string) {
   let tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}
