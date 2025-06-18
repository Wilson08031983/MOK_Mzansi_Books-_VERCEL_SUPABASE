
import React, { useState } from 'react';
import { 
  Search,
  Plus,
  Filter,
  Calendar,
  CalendarDays,
  Check,
  MoreVertical,
  FileText,
  Upload,
  Download,
  Plane,
  Heart,
  Gift,
  Users,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  managerId?: string;
  managerName?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  department: string;
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
}

interface LeaveManagementProps {
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  leaveBalances: LeaveBalance[];
  hrMetrics: { onLeaveToday: number };
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ 
  leaveRequests, 
  setLeaveRequests, 
  leaveBalances,
  hrMetrics 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');

  // Filter leave requests
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = leaveStatusFilter === 'all' || request.status === leaveStatusFilter;
    const matchesType = leaveTypeFilter === 'all' || request.leaveType === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Leave-specific helper functions
  const getLeaveStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type: LeaveRequest['leaveType']) => {
    switch (type) {
      case 'annual':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'maternity':
        return 'bg-pink-100 text-pink-800';
      case 'paternity':
        return 'bg-indigo-100 text-indigo-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'emergency':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeIcon = (type: LeaveRequest['leaveType']) => {
    switch (type) {
      case 'annual':
        return <Plane className="h-4 w-4" />;
      case 'sick':
        return <Heart className="h-4 w-4" />;
      case 'maternity':
      case 'paternity':
        return <Gift className="h-4 w-4" />;
      case 'personal':
        return <Users className="h-4 w-4" />;
      case 'emergency':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Handle leave approval/rejection
  const handleLeaveAction = (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: action === 'approve' ? 'approved' : 'rejected',
            approvedDate: action === 'approve' ? new Date().toISOString().split('T')[0] : undefined,
            rejectedReason: action === 'reject' ? reason : undefined
          }
        : request
    ));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Leave Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage employee leave requests and balances</p>
        </div>
        
        <Button className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro">
          <Plus className="h-4 w-4 mr-2" />
          New Leave Request
        </Button>
      </div>

      {/* Leave Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">
                  {leaveRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-yellow-500 to-mokm-orange-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Approved This Month</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">On Leave Today</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">{hrMetrics.onLeaveToday}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 font-sf-pro">Average Days/Employee</p>
                <p className="text-3xl font-bold text-slate-900 font-sf-pro">18.5</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-pink-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters for Leave Requests */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leave requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-slate-500 font-sf-pro">
              <Filter className="h-4 w-4" />
              <span>Status:</span>
            </div>
            
            <select
              value={leaveStatusFilter}
              onChange={(e) => setLeaveStatusFilter(e.target.value)}
              className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="flex items-center space-x-1 text-sm text-slate-500 font-sf-pro">
              <Filter className="h-4 w-4" />
              <span>Type:</span>
            </div>
            
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="px-3 py-2 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-mokm-purple-500/50 focus:border-mokm-purple-500/50 transition-all duration-300 font-sf-pro text-sm"
            >
              <option value="all">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {filteredLeaveRequests.length > 0 ? (
              filteredLeaveRequests.map(request => (
                <div key={request.id} className="p-4 border border-white/20 rounded-xl bg-white/30 hover:bg-white/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                        {getInitials(request.employeeName)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-900 font-sf-pro">{request.employeeName}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getLeaveStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-sf-pro">{request.employeePosition}</p>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            {getLeaveTypeIcon(request.leaveType)}
                            <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getLeaveTypeColor(request.leaveType)}`}>
                              {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-slate-600 font-sf-pro">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-slate-600 font-sf-pro">
                            <span>{request.days} days</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-700 mt-2 font-sf-pro">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                        
                        {request.rejectedReason && (
                          <p className="text-sm text-red-600 mt-1 font-sf-pro">
                            <strong>Rejection Reason:</strong> {request.rejectedReason}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white font-sf-pro"
                            onClick={() => handleLeaveAction(request.id, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 font-sf-pro"
                            onClick={() => handleLeaveAction(request.id, 'reject', 'Insufficient leave balance')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <Button variant="outline" size="sm" className="font-sf-pro">
                        <FileText className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm" className="font-sf-pro">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-mokm-purple-100 to-mokm-blue-100 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-mokm-purple-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-500 font-sf-pro">No leave requests found</h3>
                <p className="mt-1 text-slate-400 font-sf-pro">
                  Adjust your filters to see leave requests
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Balances */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Employee Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveBalances.map(balance => (
              <div key={balance.employeeId} className="p-4 border border-white/20 rounded-xl bg-white/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                    {getInitials(balance.employeeName)}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 font-sf-pro">{balance.employeeName}</h4>
                    <p className="text-sm text-slate-600 font-sf-pro">{balance.department}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 font-sf-pro">Annual Leave</span>
                    <span className="text-sm font-bold text-slate-900 font-sf-pro">
                      {balance.annual.remaining}/{balance.annual.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(balance.annual.remaining / balance.annual.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 font-sf-pro">Sick Leave</span>
                    <span className="text-sm font-bold text-slate-900 font-sf-pro">
                      {balance.sick.remaining}/{balance.sick.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(balance.sick.remaining / balance.sick.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 font-sf-pro">Personal Leave</span>
                    <span className="text-sm font-bold text-slate-900 font-sf-pro">
                      {balance.personal.remaining}/{balance.personal.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(balance.personal.remaining / balance.personal.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Actions */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Leave Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center space-x-2 py-3 font-sf-pro">
              <Upload className="h-5 w-5" />
              <span>Bulk Import Leave</span>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center space-x-2 py-3 font-sf-pro">
              <Download className="h-5 w-5" />
              <span>Export Leave Report</span>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center space-x-2 py-3 font-sf-pro">
              <Calendar className="h-5 w-5" />
              <span>Leave Calendar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
