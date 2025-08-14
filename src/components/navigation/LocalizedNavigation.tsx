import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

interface NavigationItem {
  key: string;
  path: string;
  icon?: React.ReactNode;
}

interface LocalizedNavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export const LocalizedNavigation: React.FC<LocalizedNavigationProps> = ({
  items,
  currentPath,
  onNavigate,
  className = ''
}) => {
  const { t } = useLocalization();

  return (
    <nav className={className}>
      {items.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
          onClick={() => onNavigate?.(item.path)}
        >
          {item.icon}
          <span>{t(`nav.${item.key}`)}</span>
        </div>
      ))}
    </nav>
  );
};

export default LocalizedNavigation;
