import React from 'react';
import NextPublicHolidayDisplay from '../hr/NextPublicHolidayDisplay';

interface InfoBannerProps {
  className?: string;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ className = '' }) => {
  return (
    <div className={`mb-6 animate-fade-in ${className}`}>
      <NextPublicHolidayDisplay compact={true} />
    </div>
  );
};

export default InfoBanner;
