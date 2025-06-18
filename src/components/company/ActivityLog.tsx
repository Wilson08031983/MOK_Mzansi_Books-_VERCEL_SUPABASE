
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, User, FileText, Settings, Shield } from 'lucide-react';

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const activities = [
    {
      id: '1',
      type: 'user',
      action: 'User logged in',
      user: 'Wilson Mokgabudi',
      timestamp: '2024-01-15 09:30:00',
      details: 'Successful login from Chrome on Windows',
      icon: User,
      color: 'from-mokm-blue-500 to-mokm-purple-500'
    },
    {
      id: '2',
      type: 'document',
      action: 'Invoice created',
      user: 'Sarah Johnson',
      timestamp: '2024-01-15 09:15:00',
      details: 'Invoice INV-2024-001 created for ABC Corp',
      icon: FileText,
      color: 'from-mokm-orange-500 to-mokm-pink-500'
    },
    {
      id: '3',
      type: 'settings',
      action: 'Company details updated',
      user: 'Wilson Mokgabudi',
      timestamp: '2024-01-15 08:45:00',
      details: 'Updated company phone number and address',
      icon: Settings,
      color: 'from-mokm-purple-500 to-mokm-blue-500'
    },
    {
      id: '4',
      type: 'security',
      action: 'Team member invited',
      user: 'Wilson Mokgabudi',
      timestamp: '2024-01-15 08:30:00',
      details: 'Invited michael@mokmzansibooks.com as Member',
      icon: Shield,
      color: 'from-mokm-pink-500 to-mokm-orange-500'
    },
    {
      id: '5',
      type: 'document',
      action: 'Quotation sent',
      user: 'Sarah Johnson',
      timestamp: '2024-01-15 08:00:00',
      details: 'Quotation QUO-2024-005 sent to XYZ Ltd',
      icon: FileText,
      color: 'from-mokm-orange-500 to-mokm-pink-500'
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Activity Log</h2>
          <p className="text-slate-600 font-sf-pro">Track all activities and changes in your account</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 font-sf-pro rounded-xl transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
              >
                <option value="all">All Activities</option>
                <option value="user">User Actions</option>
                <option value="document">Documents</option>
                <option value="settings">Settings</option>
                <option value="security">Security</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business hover:shadow-business-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro text-xl">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 glass backdrop-blur-sm bg-white/30 rounded-2xl p-6 hover:bg-white/40 transition-all duration-300 hover-lift"
              >
                <div className={`p-3 bg-gradient-to-r ${activity.color} rounded-2xl shadow-colored flex-shrink-0`}>
                  <activity.icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 font-sf-pro">{activity.action}</h3>
                    <span className="text-sm text-slate-500 font-sf-pro">{getRelativeTime(activity.timestamp)}</span>
                  </div>
                  <p className="text-slate-600 font-sf-pro text-sm mt-1">{activity.details}</p>
                  <p className="text-slate-500 font-sf-pro text-xs mt-2">by {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 font-semibold font-sf-pro mb-2">No activities found</h3>
              <p className="text-slate-600 font-sf-pro text-sm">Try adjusting your search terms or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
