import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

interface PageTitleProps {
  titleKey: string;
  className?: string;
  icon?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ titleKey, className = '', icon }) => {
  const { t } = useLocalization();

  return (
    <h1 className={`text-2xl font-bold flex items-center ${className}`}>
      {icon && <span className="mr-2">{icon}</span>}
      {t(titleKey)}
    </h1>
  );
};

export default PageTitle;
