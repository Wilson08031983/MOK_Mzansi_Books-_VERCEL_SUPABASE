
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type StatItem = {
  name: string;
  value?: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
  route?: string; // optional route to navigate on click
};

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
      {stats.map((stat, index) => {
        const bgClass = stat.bgColor || 'bg-primary/10';
        const iconColorClass = stat.color || 'text-primary';
        const clickable = Boolean(stat.route);
        const handleClick = () => {
          if (stat.route) {
            navigate(stat.route);
          }
        };
        return (
          <Card
            key={index}
            className={`liquid-glass glow-hover border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-500 hover-lift animate-fade-in delay-${index * 100} group ${clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50' : ''}`}
            onClick={handleClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : -1}
            onKeyDown={(e) => {
              if (!clickable) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-sf-pro">{stat.name}</p>
                  <div className="mt-3">
                    <p className={`${stat.name === 'Total Revenue' ? 'text-base' : 'text-lg'} font-bold text-slate-900 dark:text-slate-100 font-sf-pro truncate`}>
                      {stat.value}
                    </p>
                  </div>
                  {stat.change && (
                    <p className={`text-sm mt-2 flex items-center font-medium font-sf-pro ${stat.color || 'text-slate-600 dark:text-slate-400'}`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${bgClass} shadow-colored group-hover:shadow-colored-lg transition-all duration-300 group-hover:scale-110`}>
                  <stat.icon className={`h-7 w-7 ${iconColorClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;
