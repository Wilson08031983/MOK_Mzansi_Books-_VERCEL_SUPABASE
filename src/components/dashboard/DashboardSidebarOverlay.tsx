
import React from 'react';

interface DashboardSidebarOverlayProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardSidebarOverlay: React.FC<DashboardSidebarOverlayProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  if (!sidebarOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-all duration-300"
      onClick={() => setSidebarOpen(false)}
    ></div>
  );
};

export default DashboardSidebarOverlay;
