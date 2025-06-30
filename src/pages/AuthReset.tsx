import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { resetAuthState } from '@/services/localAuthService';
import { useNavigate } from 'react-router-dom';

const AuthReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'Reset Auth - MOK Mzansi Books';
  }, []);
  
  const handleReset = () => {
    try {
      setIsResetting(true);
      setMessage('Resetting...');
      
      // Use the existing resetAuthState function
      resetAuthState();
      
      // Check if users were created
      const storedCredentials = window.localStorage.getItem('userCredentials');
      if (storedCredentials) {
        const credentials = JSON.parse(storedCredentials);
        const userCount = Object.keys(credentials).length;
        
        setMessage(`Success! ${userCount} test users reset.`);
        toast.success('Auth reset successful!');
      } else {
        setMessage('Failed to reset auth. No user credentials found.');
        toast.error('Auth reset failed!');
      }
    } catch (error) {
      console.error('Error resetting auth:', error);
      setMessage('Failed to reset auth due to an error.');
      toast.error('Auth reset failed!');
    } finally {
      setIsResetting(false);
    }
  };
  
  const getDefaultLogins = () => {
    return (
      <div className="grid gap-3 mt-4 text-sm font-sf-pro">
        <div className="grid grid-cols-2">
          <span className="font-semibold">Admin User:</span>
          <span>admin@mokmzansibooks.com</span>
        </div>
        <div className="grid grid-cols-2">
          <span className="font-semibold">Admin Password:</span>
          <span>admin123</span>
        </div>
        <div className="grid grid-cols-2">
          <span className="font-semibold">Regular User:</span>
          <span>user@mokmzansibooks.com</span>
        </div>
        <div className="grid grid-cols-2">
          <span className="font-semibold">Regular Password:</span>
          <span>user123</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 font-sf-pro">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center border-b border-slate-200">
          <CardTitle className="text-xl font-semibold text-slate-900">Authentication Reset</CardTitle>
          <CardDescription>
            Reset the authentication system to its default state
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <p className="mb-4 text-slate-700">
            Use this tool to reset all authentication credentials to the default test accounts.
            This is useful if you're having trouble logging in.
          </p>
          
          {message && (
            <div className={`p-3 rounded-lg mb-4 ${message.includes('Success') ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
              {message}
            </div>
          )}
          
          <Button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white"
          >
            {isResetting ? 'Resetting...' : 'Reset Authentication'}
          </Button>
          
          {message.includes('Success') && getDefaultLogins()}
        </CardContent>
        
        <CardFooter className="border-t border-slate-200 flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
          
          <Button variant="outline" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthReset;
