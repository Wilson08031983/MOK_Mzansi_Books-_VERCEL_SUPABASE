import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Settings,
  LogOut,
  X,
  BarChart3,
  FileText,
  Users,
  Receipt,
  PieChart,
  Building2,
  UserCheck,
  Calculator,
  Briefcase,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  LockIcon,
  AlertCircle
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItem {
  title: string;
  icon: React.ElementType;
  href: string;
  alwaysAccessible?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', icon: BarChart3, href: '/dashboard', alwaysAccessible: true },
  { title: 'My Company', icon: Building2, href: '/company' },
  { title: 'Clients', icon: Users, href: '/clients' },
  { title: 'Quotations', icon: Receipt, href: '/quotations' },
  { title: 'Invoices', icon: FileText, href: '/invoices' },
  { title: 'Projects', icon: Briefcase, href: '/projects' },
  { title: 'Inventory', icon: PackageOpen, href: '/inventory' },
  { title: 'HR Management', icon: UserCheck, href: '/hr-management' },
  { title: 'Accounting', icon: Calculator, href: '/accounting' },
  { title: 'Reports', icon: PieChart, href: '/reports' },
  { title: 'Settings', icon: Settings, href: '/settings' },
];

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canAccessPage } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Store sidebar state in local storage so it persists between sessions
  useEffect(() => {
    const savedState = localStorage.getItem('dashboard-sidebar-collapsed');
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('dashboard-sidebar-collapsed', String(newState));
  };

  // Determine if we're on mobile based on window width
  const isMobile = windowWidth < 1024; // lg breakpoint

  const handleNavigation = (href: string, canAccess: boolean) => {
    if (!canAccess) {
      toast({
        title: "Access Restricted",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      return;
    }
    navigate(href);
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 ${collapsed ? 'w-20' : 'w-72'} glass backdrop-blur-xl bg-white/80 border-r border-white/20 shadow-business-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-20 px-3 md:px-6 border-b border-white/10">
        <Link to="/" className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-3'} animate-fade-in hover:opacity-80 transition-opacity duration-300 cursor-pointer`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-float overflow-hidden">
            <img 
              src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" 
              alt="MOKMzansiBooks Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
              MOKMzansiBooks
            </span>
          )}
        </Link>
        {isMobile ? (
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        ) : (
          <button 
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            {collapsed ? 
              <ChevronRight className="h-5 w-5 text-slate-600" /> : 
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            }
          </button>
        )}
      </div>

      <nav className="mt-8 px-2 md:px-4">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            const hasAccess = item.alwaysAccessible || canAccessPage(item.title);
            
            // Define styles based on access and active state
            const itemClass = `group flex items-center ${collapsed ? 'justify-center p-3' : 'px-4 py-4'} text-sm font-medium rounded-xl transition-all duration-300 ${
              !hasAccess ? 'opacity-70 cursor-not-allowed' :
              isActive ? 'bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored-lg' :
              'text-slate-700 hover:bg-white/50 hover:shadow-business hover-lift'
            }`;
            
            const iconClass = `h-5 w-5 ${collapsed ? '' : 'mr-4'} ${
              isActive ? 'text-white' : 'text-slate-500 group-hover:text-mokm-purple-600'
            } transition-colors`;
            
            const contentElement = (
              <div
                className={itemClass}
                onClick={() => hasAccess && handleNavigation(item.href, hasAccess)}
              >
                <item.icon className={iconClass} />
                {!collapsed && <span className="font-sf-pro">{item.title}</span>}
                {!hasAccess && !collapsed && (
                  <LockIcon className="ml-auto h-4 w-4 text-slate-400" />
                )}
              </div>
            );
            
            return (
              <li key={index} className={`animate-fade-in delay-${100 + index * 100}`}>
                {collapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>{contentElement}</div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-sf-pro flex items-center gap-2">
                        {item.title}
                        {!hasAccess && <LockIcon className="h-3 w-3 text-slate-400" />}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  contentElement
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-2 right-2 space-y-2">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full justify-center text-slate-700 hover:bg-white/50 hover:text-mokm-orange-600 transition-all duration-300">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Sign Out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-white/50 hover:text-mokm-orange-600 transition-all duration-300 font-sf-pro">
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
