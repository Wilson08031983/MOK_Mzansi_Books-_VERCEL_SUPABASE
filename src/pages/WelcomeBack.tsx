import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';

const WelcomeBack = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  // Auto-redirect to dashboard after countdown
  useEffect(() => {
    if (redirectCountdown <= 0) {
      navigate('/dashboard');
      return;
    }
    
    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [redirectCountdown, navigate]);
  
  // If no user is logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob shadow-4xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/20 to-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000 shadow-4xl"></div>
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-gradient-to-br from-blue-200/20 to-green-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000 shadow-4xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        <Card className="shadow-business-xl border-0 bg-white/90 backdrop-blur-md hover-lift animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 flex items-center justify-center shadow-business-lg animate-float rounded-2xl overflow-hidden bg-white">
              <img src="/lovable-uploads/8021eb93-6e6a-421e-a8ff-bed101269a7c.png" alt="MOKMzansiBooks Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 drop-shadow-sm">
                {getGreeting()}, {user?.user_metadata?.first_name || 'Welcome Back'}!
              </CardTitle>
              <div className="mt-2 flex justify-center">
                <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-green-700 text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Successfully signed in
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-6">
              <p className="text-gray-600">
                You'll be redirected to your dashboard in <span className="font-semibold text-purple-600">{redirectCountdown}</span> seconds
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 h-1.5 rounded-full" 
                  style={{ width: `${(5 - redirectCountdown) * 20}%` }}
                />
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold h-12 shadow-business-lg hover:shadow-business-xl transition-all duration-300"
                >
                  Go to Dashboard Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/projects')}
                    className="bg-white text-gray-600 hover:text-purple-600 border-gray-200"
                  >
                    My Projects
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    className="bg-white text-gray-600 hover:text-purple-600 border-gray-200"
                  >
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeBack;
