import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { verifyEmailByToken } from '@/services/localAuthService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Verifying your email, please wait...');
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = searchParams.get('token') || '';
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    try {
      const result = verifyEmailByToken(token);
      if (result.success) {
        setStatus('success');
        setEmail(result.email);
        setMessage('Your email has been successfully verified. You can now log in.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed.');
      }
    } catch (e) {
      setStatus('error');
      setMessage('An unexpected error occurred during verification.');
    }
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