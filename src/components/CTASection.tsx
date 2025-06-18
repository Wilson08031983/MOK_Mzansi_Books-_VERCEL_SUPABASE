
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-700 via-purple-700 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-100/5 via-purple-100/5 to-blue-100/5"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-1 mb-4 animate-scale-in delay-200">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
            <span className="ml-2 text-white/90 font-medium">Trusted by South African businesses</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight animate-slide-up delay-300">
            Ready to Transform Your
            <span className="block animate-fade-in delay-500">Business Finances?</span>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-700">
            Join thousands of South African entrepreneurs who trust MOKMzansiBooks to manage their finances efficiently and grow their businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-1000">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-slate-700 hover:bg-gray-100 hover:text-slate-800 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 group">
                Start Your Free Trial Today
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact-sales">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-slate-700 px-8 py-4 text-lg font-semibold transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                Contact Sales
              </Button>
            </Link>
          </div>

          <div className="text-white/70 text-sm animate-fade-in delay-1200">
            No credit card required • Full access • Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
