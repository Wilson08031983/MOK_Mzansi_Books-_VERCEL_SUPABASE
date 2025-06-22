import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { verifyAdminPermission, ensureWilsonHasCEOAccess } from '@/services/localAuthService';
import { useToast } from '@/hooks/use-toast';

interface AuthVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionType: 'delete' | 'update';
  targetEntityName?: string;
}

/**
 * Authentication Verification Modal
 * Used to verify admin credentials before performing critical actions
 */
const AuthVerificationModal: React.FC<AuthVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  actionType,
  targetEntityName = 'user'
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      
      // Special case for Wilson Moabelo's account (case-insensitive)
      if (email.toLowerCase().trim() === 'mokgethwamoabelo@gmail.com' && password === 'Ka!gi#so123J') {
        console.log('CEO admin verification successful in AuthVerificationModal');
        
        // Ensure Wilson's account is properly set up in localStorage
        ensureWilsonHasCEOAccess();
        
        toast({
          title: "Verification Successful",
          description: "Your CEO access has been verified.",
          variant: "default"
        });
        onVerified();
        onClose();
        return;
      }

      // For other admin accounts
      const isAdmin = await verifyAdminPermission(email, password);
      if (isAdmin) {
        toast({
          title: "Verification Successful",
          description: "Your admin status has been verified.",
          variant: "default"
        });
        onVerified();
        onClose();
      } else {
        setError('Invalid credentials or insufficient permissions');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'delete':
        return `Delete ${targetEntityName}`;
      case 'update':
        return `Update ${targetEntityName} permissions`;
      default:
        return 'Admin verification required';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'delete':
        return `Please verify your admin credentials to delete this ${targetEntityName.toLowerCase()}.`;
      case 'update':
        return `Please verify your admin credentials to update ${targetEntityName.toLowerCase()} permissions.`;
      default:
        return 'This action requires admin verification.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass backdrop-blur-sm bg-white/70 border border-white/20">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <DialogTitle className="text-center">{getActionTitle()}</DialogTitle>
          <DialogDescription className="text-center">
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white/80"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-2">
            <Shield className="h-4 w-4" />
            <span>Only admins (CEO, Manager, Bookkeeper, Director, Founder) can perform this action</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white hover:from-mokm-purple-600 hover:to-mokm-blue-600"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthVerificationModal;
