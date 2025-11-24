import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SentimentDataPoint, WordCloudItem, SentimentType } from '../types';

interface TrendChartProps {
  data: SentimentDataPoint[];
}

export const SentimentTrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[-1, 1]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sentimentScore" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} 
            activeDot={{ r: 6 }} 
            name="Sentiment Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface WordCloudProps {
  items: WordCloudItem[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ items }) => {
  // Simple layout logic: larger font for higher frequency
  const maxVal = Math.max(...items.map(i => i.value));
  const minVal = Math.min(...items.map(i => i.value));
  
  const getSize = (val: number) => {
    const minSize = 0.8;
    const maxSize = 2.0;
    if (maxVal === minVal) return 1;
    return minSize + ((val - minVal) / (maxVal - minVal)) * (maxSize - minSize);
  };

  const getColor = (sentiment: SentimentType) => {
    switch(sentiment) {
      case SentimentType.POSITIVE: return 'text-emerald-600 bg-emerald-50';
      case SentimentType.NEGATIVE: return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 justify-center items-center h-full overflow-y-auto">
      {items.map((item, idx) => (
        <span 
          key={idx}
          className={`px-3 py-1 rounded-full font-medium transition-all hover:scale-105 cursor-default ${getColor(item.sentiment)}`}
          style={{ fontSize: `${getSize(item.value)}rem` }}
          title={`${item.value} occurrences`}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
};
