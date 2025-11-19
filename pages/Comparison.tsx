import React, { useState, useEffect } from 'react';
import { fetchTopCoins, fetchCoinHistory } from '../services/cryptoService';
import { CoinData, Timeframe } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeftRight, TrendingUp, AlertCircle, Search } from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const [availableCoins, setAvailableCoins] = useState<CoinData[]>([]);
  const [coinA, setCoinA] = useState<string>('bitcoin');
  const [coinB, setCoinB] = useState<string>('ethereum');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await fetchTopCoins();
      setAvailableCoins(data);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!coinA || !coinB) return;
      setLoading(true);
      
      const assetA = availableCoins.find(c => c.id === coinA);
      const assetB = availableCoins.find(c => c.id === coinB);
      
      if (assetA && assetB) {
          const historyA = await fetchCoinHistory(coinA, timeframe, assetA.current_price);
          const historyB = await fetchCoinHistory(coinB, timeframe, assetB.current_price);
          
          const merged = historyA.map((candleA, index) => {
             const candleB = historyB[index];
             
             const startA = historyA[0].close;
             const startB = historyB[0].close;
             
             return {
                 time: candleA.time,
                 valueA: ((candleA.close - startA) / startA) * 100,
                 valueB: candleB ? ((candleB.close - startB) / startB) * 100 : 0,
                 priceA: candleA.close,
                 priceB: candleB?.close
             };
          });
          
          setChartData(merged);
      }
      setLoading(false);
    };

    if (availableCoins.length > 0) {
        fetchData();
    }
  }, [coinA, coinB, timeframe, availableCoins]);

  const getName = (id: string) => availableCoins.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <ArrowLeftRight className="w-8 h-8 text-brand-500" /> СРАВНЕНИЕ АКТИВОВ
           </h1>
           <p className="text-gray-400">Анализ корреляции и относительной доходности (%)</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-gray-900 rounded-lg p-1">
            {(['1W', '1M', '1Y'] as Timeframe[]).map(t => (
            <button 
                key={t} 
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${timeframe === t ? 'bg-brand-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
                {t}
            </button>
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-dark-card border border-gray-800 p-6 rounded-2xl">
          <div className="space-y-2">
              <label className="text-xs font-bold text-brand-400 uppercase">Актив А (Базовый)</label>
              <div className="relative">
                  <select 
                    value={coinA} 
                    onChange={e => setCoinA(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white appearance-none focus:border-brand-500 focus:outline-none"
                  >
                      {availableCoins.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500 text-xs">▼</div>
              </div>
          </div>
          
          <div className="space-y-2">
              <label className="text-xs font-bold text-purple-400 uppercase">Актив Б (Сравнение)</label>
              <div className="relative">
                  <select 
                    value={coinB} 
                    onChange={e => setCoinB(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white appearance-none focus:border-purple-500 focus:outline-none"
                  >
                      {availableCoins.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500 text-xs">▼</div>
              </div>
          </div>
      </div>

      {/* Chart Area */}
      <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 min-h-[400px] relative">
         {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-dark-card/80 z-10">
                 <div className="flex flex-col items-center gap-2">
                     <Search className="w-8 h-8 text-brand-500 animate-bounce" />
                     <span className="text-gray-400 text-sm">Анализ данных...</span>
                 </div>
             </div>
         ) : (
            <>
                <div className="mb-6 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                        <span className="font-bold text-white">{getName(coinA)}</span>
                        <span className={`text-xs ${chartData[chartData.length-1]?.valueA >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {chartData[chartData.length-1]?.valueA.toFixed(2)}%
                        </span>
                    </div>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="font-bold text-white">{getName(coinB)}</span>
                        <span className={`text-xs ${chartData[chartData.length-1]?.valueB >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {chartData[chartData.length-1]?.valueB.toFixed(2)}%
                        </span>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                            <XAxis 
                                dataKey="time" 
                                stroke="#64748b" 
                                tick={{ fontSize: 10 }} 
                                tickLine={false} 
                                axisLine={false} 
                                minTickGap={50}
                            />
                            <YAxis 
                                stroke="#64748b" 
                                tick={{ fontSize: 10 }} 
                                tickFormatter={(val) => `${val.toFixed(0)}%`}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                labelStyle={{ color: '#94a3b8' }}
                                itemStyle={{ color: '#f8fafc' }}
                                formatter={(value: number, name: string) => [
                                    `${value.toFixed(2)}%`, 
                                    name === 'valueA' ? getName(coinA) : getName(coinB)
                                ]}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="valueA" 
                                stroke="#0ea5e9" 
                                strokeWidth={2}
                                fill="url(#colorA)" 
                                name="valueA"
                            />
                            <Area 
                                type="monotone" 
                                dataKey="valueB" 
                                stroke="#a855f7" 
                                strokeWidth={2}
                                fill="url(#colorB)" 
                                name="valueB"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </>
         )}
      </div>
      
      <div className="bg-gray-900/30 border border-gray-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="text-sm text-gray-400">
              <span className="font-bold text-gray-300">Как читать этот график:</span> Графики нормализованы. 
              Обе линии начинаются с 0% в левой части. Это показывает 
              <span className="text-white font-medium"> относительную эффективность (ROI) </span> 
              активов за выбранный период, игнорируя разницу в абсолютной цене.
          </div>
      </div>
    </div>
  );
};