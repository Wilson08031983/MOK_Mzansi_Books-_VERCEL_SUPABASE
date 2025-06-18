
import React from 'react';

const DashboardLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 mx-auto"></div>
          <div className="absolute inset-2 bg-white rounded-full"></div>
        </div>
        <p className="mt-6 text-slate-600 font-sf-pro text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingScreen;
