import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { resetLocalAuth } from '@/services/resetLocalAuth';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '@/hooks/useLocalization';

const AuthReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useLocalization();
  
  useEffect(() => {
    document.title = t('auth.authReset.title');
  }, [t]);
  
  const handleReset = () => {
    try {
      setIsResetting(true);
      setMessage(t('auth.authReset.resetting'));
      
      // Reset and seed local auth with Admin and Wilson accounts
      resetLocalAuth();
      
      // Check if users were created
      const storedCredentials = window.localStorage.getItem('userCredentials');
      if (storedCredentials) {
        const credentials = JSON.parse(storedCredentials);
        const userCount = Object.keys(credentials).length;
        
        setMessage(t('auth.authReset.successCount', { count: userCount }));
        toast.success(t('auth.authReset.successMessage'));
      } else {
        setMessage(t('auth.authReset.noCredentialsError'));
        toast.error(t('auth.authReset.failedMessage'));
      }
    } catch (error) {
      console.error(`${t('auth.authReset.errorPrefix')}`, error);
      setMessage(t('auth.authReset.generalError'));
      toast.error(t('auth.authReset.failedMessage'));
    } finally {
      setIsResetting(false);
    }
  };
  
  const getDefaultLogins = () => {
    return (
      <div className="grid gap-3 mt-4 text-sm font-sf-pro">
        <div className="grid grid-cols-2">
          <span className="font-semibold">{t('auth.authReset.adminUser')}</span>
          <span>admin@mokmzansibooks.com</span>
        </div>
        <div className="grid grid-cols-2">
          <span className="font-semibold">{t('auth.authReset.adminPassword')}</span>
          <span>admin123</span>
        </div>

      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 font-sf-pro">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center border-b border-slate-200">
          <CardTitle className="text-xl font-semibold text-slate-900">{t('auth.authReset.heading')}</CardTitle>
          <CardDescription>
            {t('auth.authReset.description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <p className="mb-4 text-slate-700">
            {t('auth.authReset.toolDescription')}
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
            {isResetting ? t('auth.authReset.resetting') : t('auth.authReset.resetButton')}
          </Button>
          
          {message.includes('Success') && getDefaultLogins()}
        </CardContent>
        
        <CardFooter className="border-t border-slate-200 flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}> 
            {t('auth.authReset.backToHome')}
          </Button>
          
          <Button variant="outline" onClick={() => navigate('/login')}>
            {t('auth.authReset.goToLogin')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthReset;
