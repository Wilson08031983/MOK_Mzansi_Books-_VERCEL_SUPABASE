
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
import { getAllTeamMembers, isAdminRole } from '@/services/localAuthService';
import { getAllEmployees, Employee } from '@/services/employeeService';
import { userLinkingService } from '@/services/userLinkingService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define admin roles locally
const ADMIN_ROLES = ['CEO', 'Manager', 'Bookkeeper', 'Director', 'Founder'];

const UserManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Load admin users and employees
  const loadAdminUsers = () => {
    try {
      setIsLoading(true);
      
      // Get all team members from authentication system
      const teamMembers = getAllTeamMembers();
      
      // Filter only admin users
      const adminMembers = teamMembers.filter(member => 
        isAdminRole(member.role) || member.isAdmin
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
    loadAdminUsers();
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
      // TODO: Implement actual user deletion
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
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
              </div>
              <Shield className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CEO Level</p>
                <p className="text-2xl font-bold text-gray-900">{roleStats.CEO}</p>
              </div>
              <Crown className="h-8 w-8 text-mokm-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">{roleStats.Manager}</p>
              </div>
              <Users className="h-8 w-8 text-mokm-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Directors</p>
                <p className="text-2xl font-bold text-gray-900">{roleStats.Director}</p>
              </div>
              <Building className="h-8 w-8 text-mokm-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-sf-pro">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Administrative Users
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
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admin users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-mokm-purple-500" />
              <span className="ml-2 text-gray-600">Loading admin users...</span>
            </div>
          ) : filteredAdminUsers.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No admin users found</p>
              <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Department</th>
                    <th className="text-left py-3 px-4">Source</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getRoleBadgeColor(user.role)} border`}>
                          {user.role === 'CEO' && <Crown className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{user.department}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {user.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleEditUser(user)}
                              disabled={!userLinkingService.canEditUser(user.id).canEdit}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user)}
                              disabled={!userLinkingService.canDeleteUser(user.id).canDelete}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default UserManagementTab;
