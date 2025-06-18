
import { FileText, Users, BarChart3, Shield, Clock, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: 'Smart Invoicing',
      description: 'Create professional invoices with automatic VAT calculations tailored for South African tax requirements.',
    },
    {
      icon: BarChart3,
      title: 'Financial Reports',
      description: 'Get insights with comprehensive reports including P&L, cash flow, and tax-ready statements.',
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Manage all your client information, transaction history, and communications in one place.',
    },
    {
      icon: Zap,
      title: 'RFQ Automation',
      description: 'Streamline your request for quotation process and save time on tender documents.',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Stay on top of your finances with real-time updates and automated reminders.',
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      description: 'Your data is protected with enterprise-grade security and regular backups.',
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 animate-slide-up drop-shadow-lg">
            Everything Your Business Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-300 drop-shadow-sm">
            Powerful features designed specifically for South African businesses, from sole proprietors to growing enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 border border-gray-200 hover:border-purple-200 transition-all duration-500 shadow-business hover:shadow-business-xl transform hover:scale-105 hover:-translate-y-4 animate-fade-in hover-lift"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:via-pink-200 group-hover:to-purple-200 transition-all duration-500 group-hover:scale-110 shadow-business group-hover:shadow-business-lg animate-float">
                  <feature.icon className="h-6 w-6 text-slate-600 group-hover:text-purple-700 transition-colors duration-300 drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700 transition-colors duration-300 drop-shadow-sm">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
