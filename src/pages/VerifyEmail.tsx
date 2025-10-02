import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logAuditEvent } from '@/services/loggingService';
import { verifyEmailByToken } from '@/services/localAuthService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Verifying your email. This may take a moment...');
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = searchParams.get('token') || '';
    const userId = searchParams.get('uid') || '';
    const emailParam = searchParams.get('email') || '';
    
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
        // Prefer server verification when available
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
          setMessage('Your email is verified. You can now log in.');
          if (emailParam) setEmail(emailParam);
          logAuditEvent('email_verified', userId, undefined, window.location.href, undefined, navigator.userAgent, 1, {
            verificationMethod: 'email_link',
            success: true
          });
        } else {
          // Fallback to client-side verification (dev/local flows)
          const localResult = verifyEmailByToken(token);
          if (localResult.success) {
            setStatus('success');
            setMessage('Your email is verified. You can now log in.');
            setEmail(localResult.email || emailParam || undefined);
            logAuditEvent('email_verified', userId, undefined, window.location.href, undefined, navigator.userAgent, 1, {
              verificationMethod: 'client_fallback',
              success: true
            });
          } else {
            setStatus('error');
            setMessage(result.message || localResult.error || 'Verification failed. Request a new link and try again.');
            logAuditEvent('verify_email.attempt', userId, undefined, window.location.href, undefined, navigator.userAgent, 0, {
              reason: 'verification_failed',
              error: result.message || localResult.error
            });
          }
        }
      } catch (error: any) {
        // Network/API error — try client-side fallback
        const localResult = verifyEmailByToken(token);
        if (localResult.success) {
          setStatus('success');
          setMessage('Your email is verified. You can now log in.');
          setEmail(localResult.email || emailParam || undefined);
          logAuditEvent('email_verified', userId, undefined, window.location.href, undefined, navigator.userAgent, 1, {
            verificationMethod: 'client_fallback',
            success: true
          });
        } else {
          setStatus('error');
          setMessage(localResult.error || 'We couldn’t verify your email. Request a new link and try again.');
          logAuditEvent('verify_email.attempt', userId, undefined, window.location.href, undefined, navigator.userAgent, 0, {
            reason: 'network_error',
            error: error.message
          });
        }
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