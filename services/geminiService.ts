import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCoinAnalysis = async (assetName: string, price: number, change24h: number): Promise<string> => {
  if (!apiKey) {
    return "AI Analysis unavailable: API Key not configured. Please add your Gemini API Key to the environment variables.";
  }

  try {
    // Determine sentiment context based on price change
    const isSignificant = Math.abs(change24h) > 1.5; // Lower threshold for Forex/Indices
    let sentimentContext = "";
    
    if (change24h > 0) {
       sentimentContext = isSignificant 
         ? "The asset shows strong bullish momentum. Focus on the surge and potential profit-taking or continuation." 
         : "The asset shows mild bullish signs. Focus on steady growth and resistance levels.";
    } else {
       sentimentContext = isSignificant 
         ? "The asset is under strong bearish pressure. Focus on the sharp drop and potential support or panic selling." 
         : "The asset shows mild bearish signs. Focus on consolidation and potential support levels.";
    }

    const prompt = `
      You are a senior financial market analyst at a top-tier firm (like Bloomberg or Goldman Sachs). 
      Analyze the current status of ${assetName}. 
      Current Price: ${price}. 
      24h Change: ${change24h}%.
      
      Context: ${sentimentContext}
      
      Provide a professional, concise 3-sentence insight:
      1. Interpret the price movement (Bullish/Bearish/Neutral) relative to the specific asset class (Crypto, Forex, or Commodities).
      2. Mention a key technical factor (e.g., moving averages, RSI, geopolitical influence for commodities, or central bank policy for forex).
      3. A strategic tip for a trader holding or looking to enter this position.
      
      Keep it strictly professional. Do not use markdown formatting like bolding, just plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response preferred
      }
    });

    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI analysis at this moment. Please try again later.";
  }
};
