import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';

export const ProUpgrade: React.FC = () => {
  const { upgradeToProPlan, subscription } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-upgrade on component mount
  useEffect(() => {
    handleUpgrade();
  }, []);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToProPlan();
      setIsComplete(true);
      toast({
        title: "Upgrade Successful",
        description: "Your account has been upgraded to Pro plan!",
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error upgrading to Pro:', error);
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Pro Plan Upgrade</CardTitle>
          <CardDescription>
            {isComplete 
              ? "Your account has been successfully upgraded!" 
              : "Upgrading your account to Pro plan..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {isUpgrading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              <p className="text-slate-600">Processing your upgrade...</p>
            </div>
          ) : isComplete ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-slate-600">Upgrade complete! Redirecting to dashboard...</p>
              <p className="text-sm text-slate-500">Your new plan: {subscription?.plan_type}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-slate-600">Click the button below to upgrade to Pro plan.</p>
              <Button onClick={handleUpgrade} className="w-full">
                Upgrade Now
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {isComplete && (
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProUpgrade;