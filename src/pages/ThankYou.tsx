
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThankYou = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl">
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for subscribing to MOKMzansiBooks
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                Redirecting to your dashboard in:
              </p>
              <div className="text-4xl font-bold text-purple-600 animate-bounce">
                {countdown}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                seconds
              </p>
            </div>

            <Button
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold py-3"
            >
              Go to Dashboard Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Your subscription is now active</p>
            <p>Welcome to the full MOKMzansiBooks experience!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;
