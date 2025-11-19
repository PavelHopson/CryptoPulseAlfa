import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCoinAnalysis = async (assetName: string, price: number, change24h: number): Promise<string> => {
  if (!apiKey) {
    return "AI Анализ недоступен: API ключ не настроен.";
  }

  try {
    // Determine sentiment context based on price change
    const isSignificant = Math.abs(change24h) > 1.5; 
    let sentimentContext = "";
    
    if (change24h > 0) {
       sentimentContext = isSignificant 
         ? "Актив демонстрирует сильный бычий импульс. Фокус на росте и фиксации прибыли." 
         : "Актив показывает умеренный рост. Фокус на уровнях сопротивления.";
    } else {
       sentimentContext = isSignificant 
         ? "Актив под сильным давлением продавцов. Фокус на поддержке и возможной панической распродаже." 
         : "Актив показывает умеренное снижение. Консолидация.";
    }

    const prompt = `
      Ты — старший финансовый аналитик ведущей фирмы (как Bloomberg или Goldman Sachs).
      Проанализируй текущее состояние актива: ${assetName}.
      Текущая цена: ${price}.
      Изменение за 24ч: ${change24h}%.
      
      Контекст: ${sentimentContext}
      
      Предоставь профессиональный, краткий инсайт (максимум 3-4 предложения) на РУССКОМ языке:
      1. Интерпретация движения цены (Бычий/Медвежий/Нейтральный тренд) относительно класса актива.
      2. Ключевой технический или фундаментальный фактор (RSI, скользящие средние, новости).
      3. Стратегический совет для трейдера (Держать, Покупать на просадке, Шортить, Ждать).
      
      Стиль: Строгий, профессиональный, без воды. Не используй markdown форматирование (жирный шрифт и т.д.), только текст.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response preferred
      }
    });

    return response.text || "Анализ временно недоступен.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Не удалось сгенерировать AI анализ. Попробуйте позже.";
  }
};