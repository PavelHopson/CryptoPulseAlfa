import React, { useState, useEffect } from 'react';
import { generateCoinAnalysis } from '../services/geminiService';
import { Bot, RefreshCw, Sparkles } from 'lucide-react';
import { CoinData } from '../types';

export const AIInsight: React.FC<{ coin: CoinData }> = ({ coin }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateCoinAnalysis(coin.name, coin.current_price, coin.price_change_percentage_24h);
    setAnalysis(result);
    setLoading(false);
    setGenerated(true);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 blur-[60px] opacity-20"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-indigo-300">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Gemini AI Analyst</h3>
        </div>
        {!generated && (
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        )}
        {generated && (
            <button onClick={handleGenerate} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
            </button>
        )}
      </div>

      <div className="relative z-10 min-h-[80px]">
        {!generated && !loading && (
          <p className="text-gray-400 text-sm italic">
            Get real-time AI insights on {coin.name}'s market structure, sentiment, and key indicators using Google Gemini.
          </p>
        )}
        {loading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-indigo-500/20 rounded w-3/4"></div>
            <div className="h-3 bg-indigo-500/20 rounded w-full"></div>
            <div className="h-3 bg-indigo-500/20 rounded w-5/6"></div>
          </div>
        )}
        {analysis && !loading && (
           <div className="prose prose-invert prose-sm max-w-none">
             <p className="text-gray-200 leading-relaxed">{analysis}</p>
           </div>
        )}
      </div>
    </div>
  );
};