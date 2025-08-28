
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Shield, 
  Building,
  Crown,
  Mail,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllTeamMembers, isAdminRole, updateUserRole } from '@/services/localAuthService';
import { getAllEmployees, Employee } from '@/services/employeeService';
import { userLinkingService } from '@/services/userLinkingService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateEmployeeFromTeamMember } from '@/services/teamEmployeeSyncService';
import { useLocalization } from '@/hooks/useLocalization';

// Define admin roles locally
const ADMIN_ROLES = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];

const UserManagementTab = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [highlightUserId, setHighlightUserId] = useState<string | null>(null);

  // Listen for selected user highlight events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { userId?: string };
      if (detail?.userId) {
        const idStr = String(detail.userId);
        // Scroll into view if exists
        setTimeout(() => {
          const el = document.querySelector(`[data-user-id="${idStr}"]`) as HTMLElement | null;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 0);
        setHighlightUserId(idStr);
        // Auto-clear highlight after a delay
        setTimeout(() => setHighlightUserId(null), 2000);
      }
    };
    window.addEventListener('settings:selectedUser', handler as EventListener);
    return () => window.removeEventListener('settings:selectedUser', handler as EventListener);
  }, []);

  // Listen for team members updates to refresh admin users list
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('🔄 UserManagementTab: Received teamMembersUpdated event:', detail);
      
      // Reload admin users when team members are updated
      loadAdminUsers();
      
      if (detail?.reason === 'primaryUserUpdated') {
        toast({
          title: "Admin User Updated",
          description: `Primary user information has been updated from company details`,
          variant: "default"
        });
      }
    };
    
    window.addEventListener('teamMembersUpdated', handler as EventListener);
    return () => window.removeEventListener('teamMembersUpdated', handler as EventListener);
  }, [toast]);

  // Load admin users and employees
  const loadAdminUsers = () => {
    try {
      setIsLoading(true);
      
      // Get all team members from authentication system
      const teamMembers = getAllTeamMembers();
      
      // Determine primary company user by email
      const primaryUser = userLinkingService.getPrimaryUser();
      const primaryEmail = primaryUser?.email?.toLowerCase();
      
      // Filter only admin users or the primary user explicitly
      const adminMembers = teamMembers.filter(member => 
        isAdminRole(member.role) || member.isAdmin || (primaryEmail ? member.email.toLowerCase() === primaryEmail : false)
      );
      
      // Get all employees from HR system
      const employees = getAllEmployees();
      
      // Combine admin users with employee data if available
      const enrichedAdminUsers = adminMembers.map(admin => {
        const employeeData = employees.find(emp => 
          emp.email?.toLowerCase() === admin.email?.toLowerCase()
        );
        
        return {
          id: admin.id,
          name: admin.fullName || admin.email.split('@')[0],
          email: admin.email,
          role: admin.role,
          isAdmin: admin.isAdmin,
          status: 'Active', // In a real system, this would be dynamic
          lastLogin: 'Recently', // In a real system, this would track actual login times
          department: employeeData?.department || 'Administration',
          position: employeeData?.position || admin.role,
          phone: employeeData?.contactNumber || 'Not provided',
          joinDate: employeeData?.startDate || 'N/A',
          avatar: admin.email.charAt(0).toUpperCase(),
          source: employeeData ? 'HR System' : 'Team Invitation'
        };
      });
      
      setAdminUsers(enrichedAdminUsers);
      setAllEmployees(employees);
      
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 UserManagementTab: Loading admin users...');
        
        // Get all team members from authentication system
        const teamMembers = getAllTeamMembers();
        console.log('🔄 UserManagementTab: Raw team members:', teamMembers.map(m => ({ 
          id: m.id, 
          email: m.email, 
          fullName: m.fullName, 
          role: m.role 
        })));
        
        // Determine primary company user by email
        const primaryUser = userLinkingService.getPrimaryUser();
        const primaryEmail = primaryUser?.email?.toLowerCase();
        
        // Filter only admin users or the primary user explicitly
        const adminMembers = teamMembers.filter(member => 
          isAdminRole(member.role) || member.isAdmin || (primaryEmail ? member.email.toLowerCase() === primaryEmail : false)
        );
        console.log('🔄 UserManagementTab: Filtered admin users (including primary if applicable):', adminMembers);
        
        // Get all employees from HR system
        const employees = getAllEmployees();
        console.log('🔄 UserManagementTab: HR employees:', employees.length, 'found');
        
        // Combine admin users with employee data if available
        const enrichedAdminUsers = adminMembers.map(admin => {
          const employeeData = employees.find(emp => 
            emp.email?.toLowerCase() === admin.email?.toLowerCase()
          );
          
          const enriched = {
            id: admin.id,
            name: admin.fullName || admin.email.split('@')[0],
            email: admin.email,
            role: admin.role,
            isAdmin: admin.isAdmin,
            status: 'Active', // In a real system, this would be dynamic
            lastLogin: 'Recently', // In a real system, this would track actual login times
            department: employeeData?.department || 'Administration',
            position: employeeData?.position || admin.role,
            phone: employeeData?.contactNumber || 'Not provided',
            joinDate: employeeData?.startDate || 'N/A',
            avatar: admin.email.charAt(0).toUpperCase(),
            source: employeeData ? 'HR System' : 'Team Invitation'
          };
          
          console.log('🔄 UserManagementTab: Enriched admin user:', {
            original: { fullName: admin.fullName, role: admin.role },
            enriched: { name: enriched.name, position: enriched.position },
            employeeData: employeeData ? { name: `${employeeData.firstName} ${employeeData.surname}`.trim(), position: employeeData.position } : null
          });
          
          return enriched;
        });
        
        console.log('🔄 UserManagementTab: Final enriched admin users:', enrichedAdminUsers);
        setAdminUsers(enrichedAdminUsers);
        setAllEmployees(employees);
        
      } catch (error) {
        console.error('Error loading admin users:', error);
        toast({
          title: "Error",
          description: "Failed to load admin users",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter admin users based on search query
  const filteredAdminUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role statistics
  const roleStats = {
    CEO: adminUsers.filter(u => u.role === 'CEO').length,
    Manager: adminUsers.filter(u => u.role === 'Manager').length,
    Director: adminUsers.filter(u => u.role === 'Director').length,
    Bookkeeper: adminUsers.filter(u => u.role === 'Bookkeeper').length,
    Founder: adminUsers.filter(u => u.role === 'Founder').length
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAdminUsers();
    toast({
      title: "Refreshed",
      description: "Admin user list has been updated"
    });
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    const editCheck = userLinkingService.canEditUser(user.id);
    if (!editCheck.canEdit) {
      toast({
        title: "Cannot Edit User",
        description: editCheck.reason || 'This user cannot be edited',
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Implement edit user modal/functionality
    toast({
      title: "Edit User",
      description: "Edit user functionality will be implemented"
    });
  };

  // Handle delete user
  const handleDeleteUser = (user: any) => {
    const deleteCheck = userLinkingService.canDeleteUser(user.id);
    if (!deleteCheck.canDelete) {
      toast({
        title: "Cannot Delete User",
        description: deleteCheck.reason || 'This user cannot be deleted',
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to remove ${user.name} from admin users? This action cannot be undone.`)) {
      // Demote the user to a non-admin role instead of deleting
      const result = updateUserRole(user.id, 'Staff');
      if (!result.success) {
        toast({
          title: 'Failed to Remove Admin Access',
          description: result.error || 'Could not update user role',
          variant: 'destructive'
        });
        return;
      }

      try {
        // Sync any linked employee record to reflect the new role
        updateEmployeeFromTeamMember(user.email);
      } catch (e) {
        console.warn('Failed to sync employee after role change:', e);
      }

      toast({
        title: "User Removed",
        description: `${user.name} has been removed from admin users`
      });
      loadAdminUsers(); // Refresh the list
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CEO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Director':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Bookkeeper':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Founder':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Users Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">{t('settings.users.totalAdminUsers')}</p>
                <p className="text-2xl font-bold text-slate-100">{adminUsers.length}</p>
              </div>
              <Shield className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">{t('settings.users.ceoLevel')}</p>
                <p className="text-2xl font-bold text-slate-100">{roleStats.CEO}</p>
              </div>
              <Crown className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">{t('settings.users.managers')}</p>
                <p className="text-2xl font-bold text-slate-100">{roleStats.Manager}</p>
              </div>
              <Users className="h-8 w-8 text-mokm-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">{t('settings.users.directors')}</p>
                <p className="text-2xl font-bold text-slate-100">{roleStats.Director}</p>
              </div>
              <Building className="h-8 w-8 text-mokm-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anchor for deep-linking to Administrative Users section */}
      <div id="admin-users" className="-mt-24 pt-24" />

      {/* Admin Users Table */}
      <Card className="glass backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-sf-pro text-slate-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {t('settings.users.administrativeUsers')}
              <Badge className="ml-2 bg-mokm-purple-100 text-mokm-purple-800">
                {adminUsers.length} Admin{adminUsers.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('settings.users.refresh')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search admin users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/40 border-white/10 text-slate-100 placeholder:text-slate-400 focus:border-mokm-blue-500 focus:ring-mokm-blue-500/20"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Zap className="h-4 w-4 animate-pulse mr-2" />
              <span className="ml-2 text-slate-300">Loading admin users...</span>
            </div>
          ) : filteredAdminUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-300">
              <Mail className="h-12 w-12 mx-auto mb-4 text-mokm-purple-300" />
              <p className="mb-2 font-medium">No admin users found</p>
              <p className="text-sm">Add admin users from HR Management or by inviting team members with admin roles.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAdminUsers.map((user) => (
                <div key={user.id} data-user-id={user.id} className={`flex items-center justify-between p-4 rounded-xl glass backdrop-blur-sm bg-slate-900/40 border border-white/10 transition-colors ${highlightUserId === String(user.id) ? 'ring-2 ring-mokm-purple-400 bg-slate-900/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-semibold">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">{user.name}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </div>
                    <Badge className={`ml-2 border ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
                    <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">{user.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)} className="gap-2">
                          <Settings className="h-4 w-4" /> Manage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="gap-2 text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementTab;
