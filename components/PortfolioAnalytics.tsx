
import React from 'react';
import { AssetAllocation, PerformancePoint } from '../types';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface Props {
  allocation: AssetAllocation[];
  history: PerformancePoint[];
}

export const PortfolioAnalytics: React.FC<Props> = ({ allocation, history }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Performance History */}
      <div className="lg:col-span-2 bg-dark-card border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" /> Динамика Портфеля (30д)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 'Equity']}
              />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
              />
              <YAxis 
                 hide 
                 domain={['auto', 'auto']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-dark-card border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-brand-500" /> Распределение Активов
        </h3>
        <div className="h-48 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {allocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string, props: any) => [
                  `$${value.toLocaleString(undefined, {maximumFractionDigits: 2})} (${props.payload.percentage.toFixed(1)}%)`, 
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
          {allocation.map((item) => (
            <div key={item.symbol} className="flex items-center justify-between text-xs">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                 <span className="text-gray-300">{item.symbol}</span>
               </div>
               <div className="text-gray-400">{item.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
