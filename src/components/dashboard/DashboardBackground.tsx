
import React from 'react';

const DashboardBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
      {/* Large Orange/Pink Ball */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-mokm-orange-400/25 to-mokm-pink-400/25 rounded-full blur-3xl opacity-70 pulsate-soft"></div>

      {/* Medium Purple/Blue Ball */}
      <div className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-br from-mokm-purple-400/20 to-mokm-blue-400/20 rounded-full blur-3xl opacity-60 pulsate-soft" style={{ animationDelay: '1s' }}></div>

      {/* Small Pink/Orange Ball */}
      <div className="absolute bottom-32 right-1/3 w-32 h-32 bg-gradient-to-br from-mokm-pink-400/30 to-mokm-orange-400/30 rounded-full blur-2xl opacity-70 pulsate-soft" style={{ animationDelay: '0.5s' }}></div>

      {/* Tiny Blue/Purple Ball */}
      <div className="absolute top-40 left-1/2 w-20 h-20 bg-gradient-to-br from-mokm-blue-400/25 to-mokm-purple-400/25 rounded-full blur-2xl opacity-70 pulsate-soft" style={{ animationDelay: '1.5s' }}></div>

      {/* Extra Large Gradient Ball */}
      <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-br from-mokm-orange-300/15 via-mokm-pink-300/15 to-mokm-purple-300/15 rounded-full blur-3xl opacity-70 pulsate-soft" style={{ animationDelay: '0.7s' }}></div>

      {/* Medium Right Ball */}
      <div className="absolute top-60 right-60 w-40 h-40 bg-gradient-to-br from-mokm-pink-400/25 to-mokm-purple-400/25 rounded-full blur-2xl opacity-70 pulsate-soft" style={{ animationDelay: '0.3s' }}></div>

      {/* Small Left Ball */}
      <div className="absolute bottom-60 left-40 w-24 h-24 bg-gradient-to-br from-mokm-blue-400/30 to-mokm-orange-400/30 rounded-full blur-2xl opacity-70 pulsate-soft" style={{ animationDelay: '1.2s' }}></div>
    </div>
  );
};

export default DashboardBackground;
