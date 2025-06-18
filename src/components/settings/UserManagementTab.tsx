
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  UserCheck,
  Settings as SettingsIcon,
  Building
} from 'lucide-react';

const UserManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Administrator', status: 'Active', lastLogin: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Manager', status: 'Active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'User', status: 'Inactive', lastLogin: '2024-01-10' }
  ];

  const mockRoles = [
    { id: 1, name: 'Administrator', users: 1, permissions: 'Full Access' },
    { id: 2, name: 'Manager', users: 3, permissions: 'Limited Access' },
    { id: 3, name: 'User', users: 15, permissions: 'Basic Access' }
  ];

  return (
    <div className="space-y-6">
      {/* User Accounts */}
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-sf-pro">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Accounts
            </div>
            <Button className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Login</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.lastLogin}</td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles & Permissions */}
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro">
              <Shield className="h-5 w-5 mr-2" />
              Roles & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <p className="text-sm text-gray-600">{role.users} users • {role.permissions}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:border-gray-400">
                <Plus className="h-4 w-4 mr-2" />
                Create New Role
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teams & Departments */}
        <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
          <CardHeader>
            <CardTitle className="flex items-center font-sf-pro">
              <Building className="h-5 w-5 mr-2" />
              Teams & Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Sales Team</h4>
                  <p className="text-sm text-gray-600">5 members • John Doe (Lead)</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Marketing</h4>
                  <p className="text-sm text-gray-600">3 members • Jane Smith (Lead)</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Finance</h4>
                  <p className="text-sm text-gray-600">2 members • Mike Johnson (Lead)</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              
              <Button className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:border-gray-400">
                <Plus className="h-4 w-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementTab;
