import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, MoreHorizontal, Shield, User, Crown, UserPlus } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';

const TeamManagement = () => {
  const [teamMembers] = useState([
    {
      id: '1',
      name: 'Wilson Mokgabudi',
      email: 'wilson@mokmzansibooks.com',
      role: 'admin',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: 'W'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@mokmzansibooks.com',
      role: 'manager',
      status: 'active',
      lastActive: '1 day ago',
      avatar: 'S'
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael@mokmzansibooks.com',
      role: 'member',
      status: 'invited',
      lastActive: 'Never',
      avatar: 'M'
    }
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleAddNewUser = () => {
    console.log('Add new user clicked');
    // TODO: Implement add new user functionality
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-mokm-orange-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-mokm-purple-500" />;
      default:
        return <User className="h-4 w-4 text-mokm-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500';
      case 'manager':
        return 'bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500';
      default:
        return 'bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Invite Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Team Members</h2>
          <p className="text-slate-600 font-sf-pro">Manage your team and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleAddNewUser}
            className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 hover:from-mokm-orange-600 hover:to-mokm-pink-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add new user
          </Button>
          <Button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 hover:from-mokm-purple-600 hover:to-mokm-blue-600 text-white font-sf-pro rounded-xl shadow-colored hover:shadow-colored-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 rounded-2xl shadow-colored">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">3</p>
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
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">2</p>
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
                <p className="text-2xl font-bold text-slate-900 font-sf-pro">1</p>
                <p className="text-slate-600 font-sf-pro text-sm">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro text-xl">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="glass backdrop-blur-sm bg-white/30 rounded-2xl p-6 hover:bg-white/40 transition-all duration-300 hover-lift"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-2xl flex items-center justify-center shadow-colored">
                      <span className="text-white font-semibold font-sf-pro text-lg">{member.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 font-sf-pro">{member.name}</h3>
                      <p className="text-slate-600 font-sf-pro text-sm">{member.email}</p>
                      <p className="text-slate-500 font-sf-pro text-xs">Last active: {member.lastActive}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium font-sf-pro ${getRoleBadgeColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium font-sf-pro ${getStatusBadgeColor(member.status)}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
};

export default TeamManagement;
