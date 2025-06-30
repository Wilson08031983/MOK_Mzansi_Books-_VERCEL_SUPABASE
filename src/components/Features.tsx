
import { FileText, Users, BarChart3, Shield, Clock, Zap, TrendingUp, CreditCard, FileSearch, Receipt, FileCheck, PieChart, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, color, index }: FeatureCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);
    
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card 
        className={cn(
          'group p-6 transition-all duration-300 hover:shadow-lg h-full',
          'bg-background/90 backdrop-blur-sm border border-border/50',
          'hover:border-primary/50 hover:shadow-primary/10',
          'flex flex-col h-full transform hover:-translate-y-1',
          'relative overflow-hidden',
          'transition-all duration-500 ease-out',
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:to-primary/5 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500',
          'after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-transparent after:to-primary/10 after:opacity-0 group-hover:after:opacity-100 after:transition-all after:duration-700',
          'hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]',
          'hover:ring-1 hover:ring-primary/20'
        )}
      >
        <div className="space-y-4 flex-1 relative z-10">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
            'transition-all duration-300 group-hover:scale-110',
            `bg-gradient-to-br ${color}`,
            'shadow-sm group-hover:shadow-md',
            'relative overflow-hidden',
            'before:absolute before:inset-0 before:bg-white/10 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300'
          )}>
            <Icon className="h-6 w-6 text-foreground/90 relative z-10" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4 transition-colors duration-300 group-hover:text-foreground/90">
            {description}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 -ml-2 group-hover:text-primary transition-all duration-300 group-hover:bg-primary/5 rounded-lg px-3 py-1.5 font-medium"
          >
            <span className="relative">
              Learn more
              <ArrowRight className="ml-1 h-4 w-4 inline-block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 absolute right-0 top-1/2 -translate-y-1/2" />
            </span>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: 'Smart Invoicing',
      description: 'Create professional invoices with automatic VAT calculations tailored for South African tax requirements.',
      color: 'from-mokm-blue-100 to-mokm-blue-200'
    },
    {
      icon: BarChart3,
      title: 'Financial Reports',
      description: 'Get insights with comprehensive reports including P&L, cash flow, and tax-ready statements.',
      color: 'from-mokm-purple-100 to-mokm-purple-200'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Manage all your client information, transaction history, and communications in one place.',
      color: 'from-mokm-pink-100 to-mokm-pink-200'
    },
    {
      icon: FileSearch,
      title: 'RFQ Automation',
      description: 'Streamline your request for quotation process and save time on tender documents.',
      color: 'from-emerald-100 to-teal-200'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Stay on top of your finances with real-time updates and automated reminders.',
      color: 'from-amber-100 to-orange-200'
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      description: 'Your data is protected with enterprise-grade security and regular backups.',
      color: 'from-slate-100 to-slate-200'
    },
    {
      icon: CreditCard,
      title: 'Expense Tracking',
      description: 'Easily track and categorize business expenses for better financial management.',
      color: 'from-violet-100 to-indigo-200'
    },
    {
      icon: Receipt,
      title: 'Receipt Management',
      description: 'Digitally store and organize all your receipts for tax and expense tracking.',
      color: 'from-rose-100 to-pink-200'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track your business performance with detailed analytics and visual reports.',
      color: 'from-cyan-100 to-blue-200'
    }
  ];

  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // Stagger the animations for a better visual effect
    const headerTimer = setTimeout(() => setIsHeaderVisible(true), 100);
    const contentTimer = setTimeout(() => setIsContentVisible(true), 300);
    
    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 lg:py-32 relative">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center space-y-6 mb-16 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isHeaderVisible ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Powerful Features
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl lg:text-6xl font-bold font-sf-pro-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            initial={{ opacity: 0, y: 10 }}
            animate={isHeaderVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Everything Your Business Needs
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={isHeaderVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Powerful features designed specifically for South African businesses, from sole proprietors to growing enterprises.
          </motion.p>
          
          <motion.div 
            className="absolute -z-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl -top-20 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeaderVisible ? { opacity: 0.5, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={isContentVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              index={index}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isContentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button 
            size="lg" 
            className="px-8 py-6 text-base group transition-all duration-300 hover:shadow-lg"
          >
            <span className="relative">
              Explore All Features
              <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
