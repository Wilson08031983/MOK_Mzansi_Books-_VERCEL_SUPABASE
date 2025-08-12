import React, { useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';

interface LocalizedPageWrapperProps {
  children: React.ReactNode;
  titleKey: string;
  className?: string;
}

export const LocalizedPageWrapper: React.FC<LocalizedPageWrapperProps> = ({ 
  children, 
  titleKey, 
  className = '' 
}) => {
  const { t } = useLocalization();

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t(titleKey)} - MOK Mzansi Books`;
  }, [t, titleKey]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default LocalizedPageWrapper;
