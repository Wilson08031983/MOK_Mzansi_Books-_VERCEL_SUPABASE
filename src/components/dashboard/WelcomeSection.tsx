
import React from 'react';

interface WelcomeSectionProps {
  period: string;
  setPeriod: (period: string) => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ period, setPeriod }) => {
  return (
    <div className="flex items-center justify-between mb-10 animate-fade-in">
      <div>
        <h2 className="text-4xl font-bold text-slate-900 mb-3 font-sf-pro">Welcome back, Wilson!</h2>
        <p className="text-slate-600 text-lg font-sf-pro">Here's what's happening with your business today.</p>
      </div>
      <div className="flex items-center space-x-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 shadow-business hover:shadow-business-lg transition-all duration-300 font-sf-pro"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
  );
};

export default WelcomeSection;
