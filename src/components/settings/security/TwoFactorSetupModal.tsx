import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Smartphone } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useLocalization } from '@/hooks/useLocalization';
import { toast } from '@/hooks/use-toast';
import { generateTwoFactorSecret, storeTwoFactorCode, getTwoFactorCode, validateTwoFactorCode } from '@/services/securityService';
import { getCurrentUser } from '@/services/authService';

interface TwoFactorSetupModalProps {
  open: boolean;
  onClose: () => void;
  onEnabled: () => void;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ open, onClose, onEnabled }) => {
  const { t } = useLocalization();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [generated, setGenerated] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    const userEmail = getCurrentUser()?.email || '';
    setEmail(userEmail);
    const newCode = generateTwoFactorSecret();
    setGenerated(newCode);
    if (userEmail) {
      storeTwoFactorCode(userEmail, newCode);
    }
  }, [open]);

  const handleVerify = () => {
    if (!email) {
      toast({ title: 'Missing email', description: 'Cannot verify 2FA without a user email', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const expected = getTwoFactorCode(email);
      if (!expected) {
        toast({ title: 'Code expired', description: 'Please reopen setup to generate a new code.', variant: 'destructive' });
        return;
      }
      if (validateTwoFactorCode(code, expected)) {
        toast({ title: 'Two-Factor Enabled', description: '2FA is now enabled for your account.' });
        onEnabled();
        onClose();
      } else {
        toast({ title: 'Invalid Code', description: 'Please check the code and try again.', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]" aria-describedby="twoFactorSetupDescription">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-mokm-orange-500" />
            {t('settings.security.twoFactor')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" id="twoFactorSetupDescription">
          <p className="text-sm text-muted-foreground">
            For now, email delivery is not configured. Enter the code shown below to complete setup.
          </p>
          <div className="rounded-md bg-slate-100 px-4 py-3 font-mono tracking-widest text-center text-xl">
            {generated}
          </div>

          <div className="space-y-2">
            <Label>Enter the 6-digit code</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleVerify} disabled={submitting || code.length !== 6}>Enable 2FA</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorSetupModal;
