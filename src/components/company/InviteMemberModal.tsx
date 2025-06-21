
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteMemberModal = ({ isOpen, onClose }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send invitations",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Generate a mock token
      const tokenData = `invite-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Store invitation in localStorage
      const invitations = JSON.parse(localStorage.getItem('mokInvitations') || '[]');
      invitations.push({
        id: `inv-${Date.now()}`,
        company_id: user.id,
        invited_email: email,
        invitation_token: tokenData,
        invited_by: user.id,
        created_at: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem('mokInvitations', JSON.stringify(invitations));
      
      // Log invitation URL (would be sent via email in a real implementation)
      const inviteUrl = `${window.location.origin}/accept-invitation?token=${tokenData}`;
      console.log('Invitation URL (would be emailed):', inviteUrl);
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Invitation Sent",
        description: `Invitation has been sent to ${email}`,
      });

      setEmail('');
      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-mokm-purple-500" />
            <span>Invite Team Member</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email}
              className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;
