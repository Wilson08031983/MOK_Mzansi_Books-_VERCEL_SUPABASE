
import { Link } from 'react-router-dom';
import HelpCentre from './HelpCentre';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900 text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-slate-900/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" 
                  alt="MOKMzansiBooks Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">MOKMzansiBooks</span>
            </div>
            <p className="text-gray-300 max-w-md leading-relaxed">
              Helping South African businesses grow, one page at a time. Comprehensive financial management designed specifically for local entrepreneurs.
            </p>
          </div>

          <div className="space-y-4 animate-fade-in delay-200">
            <h4 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Product</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/features" className="hover:text-orange-400 transition-all duration-300 transform hover:translate-x-1">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-pink-400 transition-all duration-300 transform hover:translate-x-1">Pricing</Link></li>
              <li><Link to="/demo" className="hover:text-purple-400 transition-all duration-300 transform hover:translate-x-1">Demo</Link></li>
              <li><Link to="/integrations" className="hover:text-blue-400 transition-all duration-300 transform hover:translate-x-1">Integrations</Link></li>
            </ul>
          </div>

          <div className="space-y-4 animate-fade-in delay-400">
            <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <div className="mb-3">
                  <HelpCentre />
                </div>
              </li>
              <li>
                <Link to="/contact" className="hover:text-pink-400 transition-all duration-300 transform hover:translate-x-1">Contact Us</Link>
              </li>
              <li><Link to="/privacy" className="hover:text-purple-400 transition-all duration-300 transform hover:translate-x-1">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition-all duration-300 transform hover:translate-x-1">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 animate-fade-in delay-600">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 MOKMzansiBooks. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-300 text-sm hover:text-orange-400 transition-colors duration-300 cursor-pointer">mokgethwamoabelo@gmail.com</span>
              <span className="text-gray-300 text-sm hover:text-pink-400 transition-colors duration-300 cursor-pointer">+27 64 550 4029</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
