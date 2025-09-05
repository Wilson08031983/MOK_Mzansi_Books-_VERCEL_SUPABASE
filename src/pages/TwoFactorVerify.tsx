import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Smartphone, RefreshCw } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useLocalization } from '@/hooks/useLocalization';
import { toast } from '@/hooks/use-toast';
import { 
  getTwoFactorCode, 
  validateTwoFactorCode, 
  generateTwoFactorSecret, 
  storeTwoFactorCode,
  getSecuritySettings
} from '@/services/securityService';
import { getCurrentUser } from '@/services/authService';

const TwoFactorVerify: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { email?: string } } as any;
  const { t } = useLocalization();

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Helper: compute where to go based on first-time flag
  const computeRedirect = () => {
    try {
      const mokUserRaw = localStorage.getItem('mokUser');
      const mokUser = mokUserRaw ? JSON.parse(mokUserRaw) : null;
      const fallbackUser = getCurrentUser();
      const userId = mokUser?.id || fallbackUser?.id || 'anonymous';
      const firstSeenKey = `user_first_login_seen_${userId}`;
      const hasSeen = !!localStorage.getItem(firstSeenKey);
      return hasSeen ? '/welcome-back' : '/dashboard';
    } catch {
      return '/welcome-back';
    }
  };

  useEffect(() => {
    const passedEmail = location?.state?.email || getCurrentUser()?.email || '';
    setEmail(passedEmail);

    // If 2FA is not enabled, skip page safely
    const settings = getSecuritySettings();
    if (!settings.twoFactorEnabled) {
      navigate(computeRedirect(), { replace: true });
      return;
    }

    // If no code exists (page refresh), generate one and store it
    const existing = passedEmail ? getTwoFactorCode(passedEmail) : null;
    if (!existing && passedEmail) {
      const newCode = generateTwoFactorSecret();
      storeTwoFactorCode(passedEmail, newCode);
      toast({
        title: 'Two-Factor Code Generated',
        description: `Temporary demo code: ${newCode}`,
      });
    }
  }, [location, navigate]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Missing email',
        description: 'Cannot verify without a user email.',
        variant: 'destructive'
      });
      return;
    }
    setSubmitting(true);
    try {
      const expected = getTwoFactorCode(email);
      if (!expected) {
        toast({ title: 'Code expired', description: 'Request a new code and try again.', variant: 'destructive' });
        return;
      }
      if (validateTwoFactorCode(code, expected)) {
        toast({ title: 'Two-Factor Verified', description: 'Login verification completed.' });
        navigate(computeRedirect(), { replace: true });
      } else {
        toast({ title: 'Invalid Code', description: 'Please check the code and try again.', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    if (!email) return;
    const newCode = generateTwoFactorSecret();
    storeTwoFactorCode(email, newCode);
    toast({ title: 'New Code Sent', description: `Temporary demo code: ${newCode}` });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-business-xl border-0 glass glass-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-mokm-orange-500" />
              {t('settings.security.twoFactor')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <Label className="font-medium">Enter the 6-digit code</Label>
                <div className="mt-3">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={handleResend}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Resend code
                </Button>
                <Button type="submit" disabled={submitting || code.length !== 6}>
                  Verify
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Emails will be configured later. For now, the code is shown here via toast for testing.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
