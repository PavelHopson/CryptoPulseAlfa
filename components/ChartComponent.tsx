import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartPoint } from '../types';

interface Props {
  data: ChartPoint[];
  height?: number;
  showAxes?: boolean;
  isPositive?: boolean;
}

export const ChartComponent: React.FC<Props> = ({ data, height = 300, showAxes = true, isPositive = true }) => {
  const color = isPositive ? '#10b981' : '#ef4444';

  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">Нет данных для графика</div>;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
          {showAxes && (
             <XAxis 
             dataKey="time" 
             stroke="#64748b" 
             tick={{ fontSize: 12 }} 
             tickLine={false} 
             axisLine={false}
             minTickGap={40}
           />
          )}
          {showAxes && (
            <YAxis 
            domain={['auto', 'auto']} 
            stroke="#64748b" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(val) => val > 1000 ? `$${(val/1000).toFixed(1)}k` : `$${val.toFixed(2)}`}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          )}
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#f8fafc' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, {maximumFractionDigits: 4})}`, 'Цена']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};