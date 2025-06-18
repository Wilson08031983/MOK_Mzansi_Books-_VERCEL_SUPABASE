
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/paystack';
import PlanCard from '@/components/PlanCard';
import PaymentModal from '@/components/PaymentModal';
import { usePayment } from '@/hooks/usePayment';

const Payment = () => {
  const navigate = useNavigate();
  const {
    selectedPlan,
    showPaymentModal,
    isProcessing,
    handleSelectPlan,
    initiatePayment,
    setShowPaymentModal,
  } = usePayment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 text-gray-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan for your South African business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <PlanCard
                key={key}
                planKey={key}
                plan={plan}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
        onPayment={initiatePayment}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default Payment;
