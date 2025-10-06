import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail } from 'lucide-react';
import { logAuditEvent } from '@/services/loggingService';

const ResendVerification = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if email was passed from signup page
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('If an account with this email exists, a new verification email has been sent.');
        logAuditEvent('verification_resend_requested', undefined, undefined, window.location.href, undefined, navigator.userAgent, 0, {
          email: email,
          success: true
        });
      } else {
        setError(result.message || 'Failed to resend verification email');
        logAuditEvent('verification_resend_requested', undefined, undefined, window.location.href, undefined, navigator.userAgent, 0, {
          email: email,
          success: false,
          error: result.message
        });
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again later.');
      logAuditEvent('verification_resend_requested', undefined, undefined, window.location.href, undefined, navigator.userAgent, 0, {
        email: email,
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-business-xl border-0 glass backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center shadow-business-lg rounded-2xl bg-card mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Resend Verification Email</CardTitle>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a new verification link.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background border-border focus:border-primary focus:ring-primary"
                placeholder="Enter your email address"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm flex items-center space-x-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <a href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendVerification;
