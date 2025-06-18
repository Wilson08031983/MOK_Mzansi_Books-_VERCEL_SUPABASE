
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ExpenseBreakdownProps {
  data: { label: string; value: number }[];
}

const MOKM_COLORS = [
  '#f97316', // mokm-orange-500
  '#e879f9', // mokm-pink-400
  '#a855f7', // mokm-purple-500
  '#3b82f6', // mokm-blue-500
  '#06b6d4'  // cyan-500
];

const chartConfig = {
  office: { label: "Office", color: "#f97316" },
  travel: { label: "Travel", color: "#e879f9" },
  meals: { label: "Meals", color: "#a855f7" },
  software: { label: "Software", color: "#3b82f6" },
  other: { label: "Other", color: "#06b6d4" },
};

const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300 animate-fade-in h-full flex flex-col">
      <CardHeader className="pb-6">
        <CardTitle className="text-slate-900 font-sf-pro text-xl">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <defs>
                  {MOKM_COLORS.map((color, index) => (
                    <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} />
                      <stop offset="100%" stopColor={`${color}80`} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={30}
                  dataKey="value"
                  className="focus:outline-none"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient${index})`}
                      className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const value = Number(data.value) || 0;
                      const percentage = ((value / total) * 100).toFixed(1);
                      return (
                        <div className="glass backdrop-blur-xl bg-white/90 border border-white/20 rounded-xl shadow-business p-3">
                          <p className="font-medium text-slate-900 font-sf-pro">{data.payload.label}</p>
                          <p className="text-sm text-slate-600 font-sf-pro">
                            R {value.toLocaleString()} ({percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-6 space-y-3">
            {data.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between text-sm glass backdrop-blur-sm bg-white/30 rounded-xl p-3 hover:bg-white/40 transition-all duration-300">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 shadow-sm" 
                    style={{ backgroundColor: MOKM_COLORS[index % MOKM_COLORS.length] }}
                  />
                  <span className="text-slate-700 font-medium font-sf-pro">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 font-sf-pro">R {item.value.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 font-sf-pro">
                    {((item.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdown;
