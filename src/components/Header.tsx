import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 w-full bg-slate-900/70 backdrop-blur-md border-b border-white/10 z-50 shadow-business">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" 
                alt="MOKMzansiBooks Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              MOKMzansiBooks
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/features" 
              className={`font-medium transition-colors hover:text-slate-100 ${
                location.pathname === '/features' ? 'text-white' : 'text-slate-300'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium transition-colors hover:text-slate-100 ${
                location.pathname === '/pricing' ? 'text-white' : 'text-slate-300'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/demo" 
              className={`font-medium transition-colors hover:text-slate-100 ${
                location.pathname === '/demo' ? 'text-white' : 'text-slate-300'
              }`}
            >
              Demo
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors hover:text-slate-100 ${
                location.pathname === '/contact' ? 'text-white' : 'text-slate-300'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-slate-300">Welcome, {user.email}</span>
                <Link to="/dashboard">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-business">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  size="sm"
                  className="border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-red-500/10 hover:text-slate-900 dark:hover:text-red-300 hover:border-slate-400/60 dark:hover:border-red-400/30"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-business">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900/80 backdrop-blur-md border-t border-white/10 shadow-business">
            <Link 
              to="/features" 
              className="block px-3 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="block px-3 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/demo" 
              className="block px-3 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </Link>
            <Link 
              to="/contact" 
              className="block px-3 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <div className="px-3 py-2 space-y-2">
                <div className="text-sm font-bold text-slate-300">Welcome, {user.email}</div>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-business">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={() => { signOut(); setIsMenuOpen(false); }} 
                  variant="outline" 
                  size="sm"
                  className="w-full border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-red-500/10 hover:text-slate-900 dark:hover:text-red-300 hover:border-slate-400/60 dark:hover:border-red-400/30"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-slate-200 hover:bg-white/10 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-business">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
