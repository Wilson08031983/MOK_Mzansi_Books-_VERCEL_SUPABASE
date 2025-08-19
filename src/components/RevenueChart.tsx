
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  revenueData: { label: string; value: number }[];
  expensesData: { label: string; value: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ revenueData, expensesData }) => {
  const [view, setView] = useState<'revenue' | 'expenses'>('revenue');

  const activeData = view === 'revenue' ? revenueData : expensesData;

  const chartConfig = useMemo(() => ({
    value: {
      label: view === 'revenue' ? 'Revenue' : 'Expenses',
      color: view === 'revenue' ? '#a855f7' : '#ef4444',
    },
  }), [view]);

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 animate-fade-in h-full flex flex-col">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center justify-between">
          <span className="text-slate-900 font-sf-pro text-xl">Revenue Overview</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('revenue')}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 hover:scale-105 font-sf-pro ${view === 'revenue' ? 'bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg' : 'glass backdrop-blur-sm bg-white/50 text-slate-600 hover:bg-white/70 border border-white/20'}`}
            >
              Revenue
            </button>
            <button
              onClick={() => setView('expenses')}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 hover:scale-105 font-sf-pro ${view === 'expenses' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-colored hover:shadow-colored-lg' : 'glass backdrop-blur-sm bg-white/50 text-slate-600 hover:bg-white/70 border border-white/20'}`}
            >
              Expenses
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ChartContainer config={chartConfig} className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={view === 'revenue' ? '#a855f7' : '#ef4444'} />
                  <stop offset="100%" stopColor={view === 'revenue' ? '#e879f9' : '#f97316'} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'SF Pro Display' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'SF Pro Display' }}
                tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
