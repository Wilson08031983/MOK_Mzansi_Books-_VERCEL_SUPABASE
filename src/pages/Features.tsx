
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import Header from '@/components/Header';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const FeaturesPage = () => {
  return (
    <div className={cn(
      'min-h-screen bg-background/95 relative overflow-hidden',
      'flex flex-col'
    )}>
      <AnimatedBackground />
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="pt-16">
            <Features />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default FeaturesPage;
