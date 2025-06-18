
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import FounderSection from '@/components/FounderSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <FounderSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
