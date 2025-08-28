
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLocalization } from '@/hooks/useLocalization';

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
  const navigate = useNavigate();
  const { t, formatCurrency } = useLocalization();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Map dashboard labels to category values used by ExpensesTab filters (normalized to lowercase keys)
  const labelToCategoryId = useMemo(() => {
    const mapping: Record<string, string> = {
      // Dashboard labels
      'office': 'Office Supplies',
      'travel': 'Transportation',
      'meals': 'Business Meals',
      'software': 'Software & Subscriptions',
      'other': 'Other',

      // Manual expense categories (pass-through by normalized key)
      'office supplies': 'Office Supplies',
      'transportation': 'Transportation',
      'business meals': 'Business Meals',
      'marketing & advertising': 'Marketing & Advertising',
      'professional services': 'Professional Services',
      'software & subscriptions': 'Software & Subscriptions',
      'equipment & hardware': 'Equipment & Hardware',
      'travel & accommodation': 'Travel & Accommodation',
      'utilities': 'Utilities',
      'insurance': 'Insurance',
      'training & development': 'Training & Development',
      'maintenance & repairs': 'Maintenance & Repairs',
    };

    return mapping;
  }, []);

  const handleNavigateToCategory = (label: string) => {
    const normalized = (label || '').toString().trim().toLowerCase();
    const categoryId = labelToCategoryId[normalized] ?? 'all';
    navigate('/accounting', {
      state: {
        activeTab: 'expenses',
        expenseCategoryFilter: categoryId
      }
    });
  };

  return (
    <Card className="glass backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/10 dark:border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300 animate-fade-in h-full flex flex-col">
      <CardHeader className="pb-6">
        <CardTitle className="text-slate-900 dark:text-slate-100 font-sf-pro text-xl">{t('dashboard.expensesByCategory')}</CardTitle>
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
                  onClick={(data, index) => {
                    if (Array.isArray((data as any)?.payload)) return;
                    const label = (data && (data as any).name) || (data as any)?.payload?.label || (data as any)?.payload?.name || (data as any)?.label;
                    if (label) handleNavigateToCategory(label);
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#gradient${index % MOKM_COLORS.length})`}
                      className="cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleNavigateToCategory(entry.label)}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="grid grid-cols-1 gap-2 mt-6">
            {data.map((item, index) => (
              <div 
                key={item.label} 
                className="flex items-center justify-between text-sm glass backdrop-blur-md bg-white/10 dark:bg-white/5 rounded-xl p-3 hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigateToCategory(item.label)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 shadow-sm" 
                    style={{ backgroundColor: MOKM_COLORS[index % MOKM_COLORS.length] }}
                  />
                  <span className="text-slate-700 dark:text-slate-200 font-medium font-sf-pro">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-sf-pro">{formatCurrency(item.value || 0)}</span>
                  <span className="text-xs text-slate-500 font-sf-pro">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%
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
