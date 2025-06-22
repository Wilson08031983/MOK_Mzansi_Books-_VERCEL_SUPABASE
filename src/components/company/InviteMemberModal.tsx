
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Shield, AlertCircle, UserPlus, Lock, CheckCircle, Link, Eye, Edit2, LucideFileText, Users, ShoppingBag, ClipboardList, Receipt, Briefcase, Package, UserCog, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthHook';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendInvitationEmail } from '@/services/emailService';
import { verifyAdminPermission } from '@/services/localAuthService';
import { createInvitation, generateInvitationLink } from '@/services/invitationService';
import { PERMISSION_PAGES, UserPermissions, isAdminRole, getAdminPermissions, getDefaultPermissions } from '@/services/permissionService';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

const InviteMemberModal = ({ isOpen, onClose, onInviteSuccess }: InviteMemberModalProps) => {
  // Modal states
  const [step, setStep] = useState(1); // Step 1: Invite details, Step 2: Admin verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Staff Member');
  const [invitationLink, setInvitationLink] = useState('');
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState<UserPermissions>(getDefaultPermissions());
  
  // Admin verification states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Role options list
  const roleOptions = [
    'CEO',
    'Manager',
    'Bookkeeper',
    'Director',
    'Founder',
    'Staff Member'
  ];
  
  // Effect to handle role selection - show permissions for non-admin roles
  useEffect(() => {
    const isAdmin = isAdminRole(selectedRole);
    setShowPermissions(!isAdmin);
    
    // Set default permissions based on role
    if (isAdmin) {
      setPermissions(getAdminPermissions());
    } else {
      setPermissions(getDefaultPermissions());
    }
  }, [selectedRole]);

  // Reset modal state when closed
  const handleClose = () => {
    // Reset all states
    setStep(1);
    setInviteEmail('');
    setSelectedRole('Staff Member');
    setAdminEmail('');
    setAdminPassword('');
    setError(null);
    setSuccess(false);
    setLoading(false);
    setInvitationLink('');
    setPermissions(getDefaultPermissions());
    setShowPermissions(true);
    onClose();
  };

  // Proceed to admin verification
  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!inviteEmail || !selectedRole) {
      setError('Please fill in all fields');
      return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(inviteEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError(null);
    setStep(2); // Move to admin verification
  };

  // Handle invitation process
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInvitationLink('');
    
    try {
      // Special case for Wilson Moabelo - use case-insensitive check
      if (adminEmail.toLowerCase().trim() === 'mokgethwamoabelo@gmail.com' && adminPassword === 'Ka!gi#so123J') {
        console.log('CEO admin verification bypassed for Wilson');
        // Proceed directly as this account is always granted CEO admin access
      } else {
        // Log verification attempt for debugging
        console.log(`Verifying admin permissions for: ${adminEmail}`);
        
        // Verify admin credentials for other accounts
        const isAdmin = await verifyAdminPermission(adminEmail, adminPassword);
        console.log(`Verification result: ${isAdmin ? 'Success' : 'Failed'}`);
        
        if (!isAdmin) {
          setError('Admin verification failed. Please check your credentials or permissions.');
          setLoading(false);
          return;
        }
      }
      
      // Calculate admin name based on credentials (for personalization)
      const adminName = adminEmail.split('@')[0] || 'Admin';
      
      // Create a secure invitation with token
      const invitation = createInvitation(inviteEmail, selectedRole, adminEmail, permissions);
      const inviteLink = generateInvitationLink(invitation.token);
      
      // Set the invitation link for display
      setInvitationLink(inviteLink);
      
      // Send invitation email using Resend API
      const emailSent = await sendInvitationEmail({
        to: inviteEmail,
        inviterName: adminName,
        email: inviteEmail,
        role: selectedRole,
        invitationLink: inviteLink
      });
      
      if (!emailSent) {
        // Even if email fails, the invitation is still created
        toast({
          title: "Invitation Created - Email Failed",
          description: `Invitation for ${inviteEmail} was created, but the invitation email could not be sent. You can copy the invitation link and share it manually.`
        });
        
        // Still mark as success since the invitation was created
        setSuccess(true);
        return;
      }
      
      // Everything succeeded
      toast({
        title: "Team Member Invited",
        description: `${inviteEmail} has been invited as a ${selectedRole} and sent a secure invitation email.`
      });
      
      setSuccess(true);
      
      // Call success callback if provided
      if (onInviteSuccess) onInviteSuccess();
      
    } catch (error) {
      console.error('Error inviting team member:', error);
      setError(error instanceof Error ? error.message : 'Failed to process invitation');
      setInvitationLink('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {step === 1 && (
              <>
                <UserPlus className="h-5 w-5 text-mokm-purple-500" />
                <span>Invite New Team Member</span>
              </>
            )}
            {step === 2 && (
              <>
                <Shield className="h-5 w-5 text-mokm-orange-500" />
                <span>Admin Verification Required</span>
              </>
            )}
          </DialogTitle>
          
          {step === 1 && (
            <DialogDescription>
              Add a new team member by completing this form. You'll need to verify your admin credentials to complete the invitation.
            </DialogDescription>
          )}
          
          {step === 2 && (
            <DialogDescription>
              Please enter your admin credentials to confirm you have permission to invite team members.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="font-medium">Team member invited successfully!</p>
            </div>
            
            {invitationLink && (
              <div className="mt-2">
                <p className="text-sm mb-2">Share this invitation link with the team member:</p>
                <div className="flex">
                  <input 
                    type="text" 
                    value={invitationLink} 
                    readOnly 
                    className="flex-1 text-xs p-2 border border-green-200 rounded-l-md bg-white" 
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(invitationLink);
                      toast({
                        title: "Link Copied",
                        description: "Invitation link copied to clipboard",
                        duration: 2000
                      });
                    }}
                    className="rounded-l-none bg-green-600 hover:bg-green-700"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Copy</span>
                    </div>
                  </Button>
                </div>
              </div>
            )}
            
            <p className="text-xs mt-2">The link will expire in 24 hours. You can close this dialog and access your team management dashboard.</p>
          </div>
        )}
        
        {/* Step 1: Team Member Details */}
        {step === 1 && (
          <form onSubmit={handleProceedToVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter team member email"
                required
                className="w-full"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-2">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> The invited user will set their own password during account activation.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Assign Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Page Permissions Section - Only shown for non-admin roles */}
            {showPermissions && (
              <div className="space-y-4 mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Page Permissions</h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 rounded bg-slate-200 flex items-center justify-center">
                        <Eye className="h-3 w-3 text-slate-600" />
                      </div>
                      <span>View</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 rounded bg-slate-200 flex items-center justify-center">
                        <Edit2 className="h-3 w-3 text-slate-600" />
                      </div>
                      <span>Edit</span>
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  {PERMISSION_PAGES.map((page) => {
                    const pageIcon = (() => {
                      switch(page) {
                        case 'My Company': return <LucideFileText className="h-4 w-4 text-slate-600" />;
                        case 'Clients': return <Users className="h-4 w-4 text-slate-600" />;
                        case 'Quotations': return <ClipboardList className="h-4 w-4 text-slate-600" />;
                        case 'Invoices': return <Receipt className="h-4 w-4 text-slate-600" />;
                        case 'Projects': return <Briefcase className="h-4 w-4 text-slate-600" />;
                        case 'Inventory': return <Package className="h-4 w-4 text-slate-600" />;
                        case 'HR Management': return <UserCog className="h-4 w-4 text-slate-600" />;
                        case 'Accounting': return <ShoppingBag className="h-4 w-4 text-slate-600" />;
                        case 'Reports': return <BarChart3 className="h-4 w-4 text-slate-600" />;
                        default: return <LucideFileText className="h-4 w-4 text-slate-600" />;
                      }
                    })();
                    
                    return (
                      <li key={page} className="flex items-center justify-between py-2 px-3 hover:bg-slate-100 rounded-md">
                        <div className="flex items-center space-x-2">
                          {pageIcon}
                          <span>{page}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          {/* Read Permission Checkbox */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`read-${page}`}
                              checked={permissions[page]?.read || false}
                              onChange={(e) => {
                                const newPermissions = {...permissions};
                                newPermissions[page] = {
                                  ...newPermissions[page],
                                  read: e.target.checked,
                                  // If read is unchecked, also uncheck write
                                  write: e.target.checked ? newPermissions[page]?.write || false : false
                                };
                                setPermissions(newPermissions);
                              }}
                              className="rounded border-slate-300 text-mokm-purple-500 focus:ring-mokm-purple-500"
                            />
                          </div>
                          
                          {/* Write Permission Checkbox - only enabled if read is checked */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`write-${page}`}
                              checked={permissions[page]?.write || false}
                              disabled={!permissions[page]?.read}
                              onChange={(e) => {
                                const newPermissions = {...permissions};
                                newPermissions[page] = {
                                  ...newPermissions[page],
                                  write: e.target.checked
                                };
                                setPermissions(newPermissions);
                              }}
                              className="rounded border-slate-300 text-mokm-blue-500 focus:ring-mokm-blue-500"
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <p><span className="font-semibold">Note:</span> All users automatically have access to the Dashboard page.</p>
                  <p className="mt-1"><span className="font-semibold">❌ Restricted:</span> Non-admin users cannot access Settings or the Admin Panel.</p>
                </div>
              </div>
            )}
            
            {/* Invitation Link Display Section - Only shown after link is generated */}
            {invitationLink && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-blue-800 font-medium">Invitation Link</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    onClick={() => {
                      navigator.clipboard.writeText(invitationLink);
                      toast({
                        title: "Link Copied",
                        description: "Invitation link copied to clipboard",
                        duration: 2000
                      });
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Copy</span>
                      <Link className="h-4 w-4" />
                    </div>
                  </Button>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 break-all text-sm">
                  {invitationLink}
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  This link will expire in 24 hours. The invited user must use this link to complete their registration.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!inviteEmail || !selectedRole}
                className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600"
              >
                Continue
              </Button>
            </div>
          </form>
        )}
        
        {/* Step 2: Admin Verification */}
        {step === 2 && (
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                <p className="text-sm text-amber-800">
                  <strong>Admin verification required.</strong> Please enter your admin credentials to complete this action.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter your admin email"
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter your admin password"
                required
                className="w-full"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Only users with admin roles (CEO, Manager, Bookkeeper, Director, Founder) can invite new members.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !adminEmail || !adminPassword}
                className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;
