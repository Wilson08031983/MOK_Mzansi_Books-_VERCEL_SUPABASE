import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logAuditEvent } from '@/services/loggingService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Verifying your email, please wait...');
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = searchParams.get('token') || '';
    const userId = searchParams.get('uid') || '';
    
    if (!token || !userId) {
      setStatus('error');
      setMessage('Invalid verification link.');
      logAuditEvent('verify_email.attempt', userId, undefined, window.location.href, undefined, navigator.userAgent, 0, {
        reason: 'missing_parameters',
        token: token ? 'provided' : 'missing',
        userId: userId ? 'provided' : 'missing'
      });
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            userId
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified. You can now log in.');
          logAuditEvent('email_verified', userId, undefined, window.location.href, undefined, navigator.userAgent, 1, {
            verificationMethod: 'email_link',
            success: true
          });
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification failed.');
          logAuditEvent('verify_email.attempt', userId, undefined, window.location.href, undefined, navigator.userAgent, 0, {
            reason: 'verification_failed',
            error: result.message
          });
        }
      } catch (error: any) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
        logAuditEvent('verify_email.attempt', userId, undefined, window.location.href, undefined, navigator.userAgent, 0, {
          reason: 'network_error',
          error: error.message
        });
      }
    };

    verifyEmail();
  }, [searchParams]);

  const goToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-business-xl border-0 glass backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === 'pending' && (
            <p className="text-muted-foreground">{message}</p>
          )}
          {status === 'success' && (
            <>
              <p className="text-green-600 font-medium">{message}</p>
              {email && <p className="text-sm text-muted-foreground">Verified: {email}</p>}
              <div className="pt-4">
                <Button onClick={goToLogin} className="w-full">Go to Login</Button>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-red-600 font-medium">{message}</p>
              <div className="pt-4 flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/signup">Create a new account</Link>
                </Button>
                <Button onClick={goToLogin}>Go to Login</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;