import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Mail, 
  MoreHorizontal, 
  Shield, 
  User, 
  Crown, 
  UserPlus, 
  Briefcase, 
  BookOpen, 
  LockIcon, 
  KeyRound,
  Eye,
  Trash2,
  Edit2,
  MoreVertical,
  RefreshCw,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InviteMemberModal from './InviteMemberModal';
import ManagePermissionsModal from './ManagePermissionsModal';
import AuthVerificationModal from './AuthVerificationModal';
import { getAllTeamMembers, deleteUser } from '@/services/localAuthService';
import { sendAccountDeletionEmail } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthHook';
import { getUserPermissions, isAdminRole } from '@/services/permissionService';
import { syncTeamMembersToEmployees, getSyncStatus } from '@/services/teamEmployeeSyncService';
import { userLinkingService } from '@/services/userLinkingService';
import { useNavigate } from 'react-router-dom';

const TeamManagement = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isAuthVerificationModalOpen, setIsAuthVerificationModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'delete' | 'update'>('update');
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    email: string;
    role: string;
    fullName?: string;
  } | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{
    id: string;
    email: string;
    role: string;
    fullName?: string;
    permissions?: Record<string, { read: boolean; write: boolean; }>;
  }>>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0
  });
  const [syncStatus, setSyncStatus] = useState({
    totalTeamMembers: 0,
    syncedMembers: 0,
    unsyncedMembers: [] as string[]
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Function to load team members and sync status
  const loadTeamMembers = () => {
    try {
      console.log('🔄 TeamManagement: Loading team members...');
      const members = getAllTeamMembers();
      console.log('🔄 TeamManagement: Loaded team members:', members.map(m => ({ 
        id: m.id, 
        email: m.email, 
        fullName: m.fullName, 
        role: m.role 
      })));
      setTeamMembers(members);
      
      // Calculate stats
      setStats({
        total: members.length,
        active: members.length, // In a real app, this would filter by status
        pending: 0 // In a real app with actual pending invites
      });
      
      // Update sync status
      const status = getSyncStatus();
      console.log('🔄 TeamManagement: Sync status:', status);
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    }
  };
  
  // Load team members on component mount
  useEffect(() => {
    console.log('🔄 TeamManagement: Component mounted, loading team members');
    loadTeamMembers();
  }, []);
  
  // Also reload when component becomes visible (navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 TeamManagement: Page became visible, reloading team members');
        loadTeamMembers();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle successful invitation
  const handleInviteSuccess = () => {
    loadTeamMembers();
    toast({
      title: "Team Updated",
      description: "The team member list has been refreshed with the new invitation."
    });
  };
  
  // Handle permissions update
  const handlePermissionsUpdated = () => {
    loadTeamMembers();
    toast({
      title: "Permissions Updated",
      description: "User permissions have been updated successfully."
    });
  };
  
  // Handle sync team members to employees
  const handleSyncToEmployees = async () => {
    setIsSyncing(true);
    
    try {
      const result = syncTeamMembersToEmployees();
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Synced ${result.syncedCount} team members to HR Management. ${result.skippedCount} already existed.`,
          duration: 5000
        });
      } else {
        toast({
          title: "Sync Completed with Errors",
          description: `Synced ${result.syncedCount} members, but encountered ${result.errors.length} errors.`,
          variant: "destructive",
          duration: 5000
        });
        console.error('Sync errors:', result.errors);
      }
      
      // Refresh sync status
      loadTeamMembers();
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync team members to HR Management.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Open confirm delete modal for a member
  const openDeleteConfirmation = (member: { id: string; email: string; role: string; fullName?: string; }) => {
    setSelectedMember(member);
    
    // Require admin verification for all users
    setAuthAction('delete');
    setIsAuthVerificationModalOpen(true);
  };
  
  // Handle admin verification for permissions
  const openPermissionsWithVerification = (member: { id: string; email: string; role: string; fullName?: string; }) => {
    setSelectedMember(member);
    
    // Require admin verification for all users
    setAuthAction('update');
    setIsAuthVerificationModalOpen(true);
  };
  
  // When admin is verified for permissions
  const handleAuthVerifiedForPermissions = () => {
    if (selectedMember) {
      setIsPermissionModalOpen(true);
    }
  };
  
  // Handle user deletion after admin verification
  const handleAuthVerifiedForDeletion = async () => {
    if (selectedMember) {
      // Check if user can be deleted (primary user protection)
      const canDelete = userLinkingService.canDeleteUser(selectedMember.id);
      
      if (!canDelete) {
        toast({
          title: "Cannot Delete User",
          description: "This user is the primary company representative and cannot be deleted.",
          variant: "destructive"
        });
        return;
      }
      
      const { success } = deleteUser(selectedMember.id);
      
      if (success) {
        // Send deletion email
        await sendAccountDeletionEmail({
          to: selectedMember.email,
          firstName: selectedMember.fullName || selectedMember.email.split('@')[0],
        });
        
        loadTeamMembers();
        toast({
          title: "User Deleted",
          description: `${selectedMember.email} has been removed from your team.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: "There was a problem removing this user.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Open permissions modal for a member
  const openPermissionsModal = (member: { id: string; email: string; role: string; fullName?: string; }) => {
    setSelectedMember(member);
    // Require admin verification first
    openPermissionsWithVerification(member);
  };
  
  // New user form
  const handleAddNewUser = () => {
    setIsInviteModalOpen(true);
  };

  // Get primary linked user details from Company Details
  const [primaryLinkedUser, setPrimaryLinkedUser] = useState(() => userLinkingService.getPrimaryUser());

  // Listen for company details updates in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'companyDetails') {
        setPrimaryLinkedUser(userLinkingService.getPrimaryUser());
        loadTeamMembers();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleDirectUpdate = () => {
      setPrimaryLinkedUser(userLinkingService.getPrimaryUser());
      loadTeamMembers();
    };
    window.addEventListener('companyDetailsUpdated', handleDirectUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyDetailsUpdated', handleDirectUpdate);
    };
  }, []);

  // Convert team members from the local auth service format to display format
  const displayMembers = teamMembers.map(member => {
    const permissions = member.permissions || {};
    const permissionCount = Object.values(permissions)
      .filter((p): p is { read: boolean; write: boolean } => p !== null && typeof p === 'object' && 'read' in p)
      .filter(p => p.read)
      .length;
  
    const writePermissionCount = Object.values(permissions)
      .filter((p): p is { read: boolean; write: boolean } => p !== null && typeof p === 'object' && 'write' in p)
      .filter(p => p.write)
      .length;
  
    const isPrimary = !!primaryLinkedUser && member.email.toLowerCase() === primaryLinkedUser.email.toLowerCase();
    const displayName = isPrimary ? primaryLinkedUser.fullName : (member.fullName || member.email.split('@')[0]);
    const displayPosition = isPrimary ? primaryLinkedUser.position : undefined;
  
    return {
      id: member.id,
      name: displayName,
      email: member.email,
      role: member.role?.toLowerCase() || 'staff',
      isAdmin: isAdminRole(member.role || '') || isPrimary,
      isPrimary,
      position: displayPosition,
      permissionCount,
      writePermissionCount,
      permissions: permissions,
      status: 'active',
      lastActive: 'Recently',
      avatar: member.email.charAt(0).toUpperCase()
    };
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'ceo':
        return <Crown className="h-4 w-4 text-mokm-orange-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-mokm-purple-500" />;
      case 'bookkeeper':
        return <BookOpen className="h-4 w-4 text-mokm-blue-500" />;
      case 'director':
      case 'founder':
        return <Briefcase className="h-4 w-4 text-mokm-orange-500" />;
      default:
        return <User className="h-4 w-4 text-mokm-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'ceo':
        return 'bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500';
      case 'manager':
        return 'bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500';
      case 'founder':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'director':
        return 'bg-gradient-to-r from-emerald-500 to-cyan-500';
      case 'bookkeeper':
        return 'bg-gradient-to-r from-teal-500 to-cyan-400';
      default:
        return 'bg-gradient-to-r from-mokm-blue-500 to-cyan-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'invited':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Team Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro tracking-tight">Team Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage your company's team members and permissions.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Sync to HR button hidden as sync is now automatic when opening Team Management tab */}
          {/*
          <Button
            onClick={handleSyncToEmployees}
            disabled={isSyncing || syncStatus.unsyncedMembers.length === 0}
            className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 text-white rounded-xl px-4 disabled:opacity-50"
          >
            {isSyncing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync to HR'}
          </Button>
          */}
          <Button
            onClick={handleAddNewUser}
            className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white rounded-xl px-4"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Team Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 rounded-2xl shadow-colored">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{stats.total}</p>
                <p className="text-slate-600 font-sf-pro text-sm">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-colored">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{stats.active}</p>
                <p className="text-slate-600 font-sf-pro text-sm">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-colored">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">{stats.pending}</p>
                <p className="text-slate-600 font-sf-pro text-sm">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 rounded-2xl shadow-colored">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 font-sf-pro">{syncStatus.syncedMembers}</p>
                  <p className="text-slate-600 font-sf-pro text-sm">Synced to HR</p>
                  {syncStatus.unsyncedMembers.length > 0 && (
                    <p className="text-xs text-mokm-orange-600 font-sf-pro">
                      {syncStatus.unsyncedMembers.length} pending sync
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-slate-900 font-sf-pro text-xl">Team Members</CardTitle>
          <Button
            variant="link"
            className="text-mokm-purple-700 hover:text-mokm-purple-900 font-sf-pro"
            onClick={() => navigate('/settings?tab=users#admin-users')}
            title="View Administrative Users in Settings"
          >
            <Shield className="h-4 w-4 mr-1" /> Admin Employees Only
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Mail className="h-12 w-12 mx-auto mb-3 text-mokm-purple-300" />
                <p className="mb-1">No team members found</p>
                <p className="text-sm">Invite your first team member to get started</p>
              </div>
            ) : (
              displayMembers.map((member) => (
                <div
                  key={member.id}
                  className="glass backdrop-blur-sm bg-white/30 rounded-2xl p-6 hover:bg-white/40 transition-all duration-300 hover-lift"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-4 ${((member.isPrimary) || isAdminRole(((member.isPrimary && member.position) ? member.position : member.role) as string) || member.isAdmin) ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={() => {
                        const isAdminOrPrimary = (member.isPrimary) || isAdminRole(((member.isPrimary && member.position) ? member.position : member.role) as string) || member.isAdmin;
                        if (!isAdminOrPrimary) return; // Linkage exclusive to admin/primary
                        navigate(`/settings?tab=users&selectedUser=${member.id}#admin-users`);
                      }}
                      onKeyDown={(e) => {
                        const isAdminOrPrimary = (member.isPrimary) || isAdminRole(((member.isPrimary && member.position) ? member.position : member.role) as string) || member.isAdmin;
                        if (!isAdminOrPrimary) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/settings?tab=users&selectedUser=${member.id}#admin-users`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      title={((member.isPrimary) || isAdminRole(((member.isPrimary && member.position) ? member.position : member.role) as string) || member.isAdmin)
                        ? 'Go to Administrative Users in Settings to manage this member'
                        : 'Only Admin or Primary users are linked to Administrative Users'}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-2xl flex items-center justify-center shadow-colored">
                        <span className="text-white font-semibold font-sf-pro text-lg">{member.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 font-sf-pro flex items-center gap-2">
                          {member.name}
                          {member.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Primary</span>
                          )}
                        </h3>
                        {member.isPrimary && member.position && (
                          <p className="text-slate-700 font-sf-pro text-sm">{member.position}</p>
                        )}
                        <p className="text-slate-600 font-sf-pro text-sm">{member.email}</p>
                        <p className="text-slate-500 font-sf-pro text-xs">Last active: {member.lastActive}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon((member.isPrimary && member.position) ? member.position : member.role)}
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-medium font-sf-pro ${getRoleBadgeColor((member.isPrimary && member.position) ? member.position : member.role)}`}>
                          {(((member.isPrimary && member.position) ? member.position : member.role) as string).charAt(0).toUpperCase() + (((member.isPrimary && member.position) ? member.position : member.role) as string).slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium font-sf-pro ${getStatusBadgeColor(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                        
                        {!member.isAdmin && (
                          <div className="flex gap-1">
                            <span className="px-3 py-1 rounded-full text-xs font-medium font-sf-pro bg-blue-100 text-blue-800 flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {member.permissionCount} Page{member.permissionCount !== 1 ? 's' : ''}
                            </span>
                            
                            <span className="px-3 py-1 rounded-full text-xs font-medium font-sf-pro bg-green-100 text-green-800 flex items-center gap-1">
                              <Edit2 className="h-3 w-3" /> {member.writePermissionCount} Write
                            </span>
                          </div>
                        )}
                        
                        {member.isAdmin ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium font-sf-pro bg-purple-100 text-purple-800 flex items-center gap-1">
                            <KeyRound className="h-3 w-3" /> Full Access
                          </span>
                        ) : null}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass backdrop-blur-sm bg-white/70 border border-white/20">
                            {!member.isAdmin && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => openPermissionsModal({
                                  id: member.id,
                                  email: member.email,
                                  role: member.role,
                                  fullName: member.name
                                })}
                              >
                                <LockIcon className="h-4 w-4" />
                                <span>Edit Access</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                              disabled={!userLinkingService.canDeleteUser(member.id).canDelete}
                              onClick={() => openDeleteConfirmation({
                                id: member.id,
                                email: member.email,
                                role: member.role,
                                fullName: member.name
                              })}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSuccess={handleInviteSuccess}
      />
      
      {selectedMember && (
        <ManagePermissionsModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          userId={selectedMember.id}
          userEmail={selectedMember.email}
          userRole={selectedMember.role}
          onPermissionsUpdated={handlePermissionsUpdated}
        />
      )}
      
      <AuthVerificationModal
        isOpen={isAuthVerificationModalOpen}
        onClose={() => setIsAuthVerificationModalOpen(false)}
        onVerified={authAction === 'delete' ? handleAuthVerifiedForDeletion : handleAuthVerifiedForPermissions}
        actionType={authAction}
        targetEntityName={authAction === 'delete' ? 'User' : 'User Permissions'}
      />
    </div>
  );
};

export default TeamManagement;
