
import React from 'react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccessGuardProps {
  children: React.ReactNode;
  requiresFullAccess?: boolean;
  fallback?: React.ReactNode;
}

const AccessGuard = ({ 
  children, 
  requiresFullAccess = false, 
  fallback 
}: AccessGuardProps) => {
  const { hasFullAccess, hasLimitedAccess, loading } = useSubscriptionAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (requiresFullAccess && !hasFullAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl">Premium Feature</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            This feature requires a premium subscription. Upgrade now to unlock all features!
          </p>
          <Link to="/payment">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default AccessGuard;
