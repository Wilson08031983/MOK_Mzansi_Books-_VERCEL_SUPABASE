import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-pink-300/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob shadow-4xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-blue-300/40 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 shadow-4xl"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-pink-200/40 to-purple-300/40 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000 shadow-4xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight animate-slide-up drop-shadow-lg">
              South African Accounting
              <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-fade-in delay-300 drop-shadow-md">
                Software Built For
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-slate-700 bg-clip-text text-transparent animate-fade-in delay-500 drop-shadow-md">Your Business</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-700 drop-shadow-sm">
              Helping South Africans grow, one page at a time. Streamline your finances with our comprehensive platform designed specifically for SA businesses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-1000">
            <Link to="/payment">
              <Button size="lg" className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 hover:from-orange-500 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-business-xl hover:shadow-4xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-float">
                Start Free 30-Day Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/payment">
              <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-500 hover:text-white hover:border-transparent px-8 py-4 text-lg font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-business hover:shadow-business-xl">
                Pay Now
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in delay-1200">
            <div className="flex items-center gap-2 animate-scale-in delay-1300 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-business hover:shadow-business-lg transition-all duration-300">
              <CheckCircle className="h-4 w-4 text-green-500 drop-shadow-sm" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2 animate-scale-in delay-1400 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-business hover:shadow-business-lg transition-all duration-300">
              <CheckCircle className="h-4 w-4 text-green-500 drop-shadow-sm" />
              <span>Full Access</span>
            </div>
            <div className="flex items-center gap-2 animate-scale-in delay-1500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-business hover:shadow-business-lg transition-all duration-300">
              <CheckCircle className="h-4 w-4 text-green-500 drop-shadow-sm" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
