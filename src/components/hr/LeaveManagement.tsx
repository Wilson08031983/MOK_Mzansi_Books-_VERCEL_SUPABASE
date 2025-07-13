import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
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
  AlertCircle,
  X,
  Info,
  Edit,
  Trash2,
  Palmtree,
  Stethoscope,
  Flower
} from 'lucide-react';
import NextPublicHolidayDisplay from './NextPublicHolidayDisplay';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Employee } from '@/services/employeeService';
import LeaveRequestModal from './LeaveRequestModal';
import { 
  LeaveRequest, 
  LeaveTypes, 
  calculateBusinessDaysExcludingHolidays,
  LeaveBalance
} from './LeaveManagementTypes';

interface LeaveManagementProps {
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  leaveBalances: LeaveBalance[];
  hrMetrics: { onLeaveToday: number };
  employees?: Employee[];
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ 
  leaveRequests, 
  setLeaveRequests, 
  leaveBalances,
  hrMetrics,
  employees = [] 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string | LeaveTypes>('all');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [rejectModal, setRejectModalOpen] = useState<{ isOpen: boolean; requestId: string }>({ isOpen: false, requestId: '' });
  
  // Load leave requests and balances from localStorage if available
  useEffect(() => {
    try {
      const storedRequests = localStorage.getItem('leaveRequests');
      const storedBalances = localStorage.getItem('leaveBalances');
      
      if (storedRequests) {
        const parsedRequests = JSON.parse(storedRequests);
        setLeaveRequests(parsedRequests);
      } else {
        // Initialize localStorage with current state if empty
        localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
      }
      
      if (storedBalances) {
        // In a real implementation, we would update the leaveBalances state here
        // For this demo, we're using the prop passed from the parent
      } else {
        // Initialize localStorage with current state if empty
        localStorage.setItem('leaveBalances', JSON.stringify(leaveBalances));
      }
    } catch (error) {
      console.error('Error loading leave data from localStorage:', error);
    }
  }, [leaveRequests, leaveBalances, setLeaveRequests]);  // Added missing dependencies

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

  const getLeaveTypeIcon = (type: LeaveRequest['leaveType']) => {
    switch (type) {
      case LeaveTypes.Annual:
        return <Palmtree className="h-4 w-4" />;
      case LeaveTypes.Sick:
        return <Stethoscope className="h-4 w-4" />;
      case LeaveTypes.Bereavement:
        return <Flower className="h-4 w-4" />;
      case LeaveTypes.Maternity:
      case LeaveTypes.Parental:
        return <Gift className="h-4 w-4" />;
      case LeaveTypes.FamilyResponsibility:
        return <Users className="h-4 w-4" />;
      case LeaveTypes.Unpaid:
      case LeaveTypes.Study:
      case LeaveTypes.Religious:
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getLeaveTypeColor = (type: LeaveRequest['leaveType']) => {
    switch (type) {
      case LeaveTypes.Annual:
        return 'bg-green-100 text-green-800';
      case LeaveTypes.Sick:
        return 'bg-red-100 text-red-800';
      case LeaveTypes.Bereavement:
        return 'bg-purple-100 text-purple-800';
      case LeaveTypes.Maternity:
      case LeaveTypes.Parental:
        return 'bg-blue-100 text-blue-800';
      case LeaveTypes.FamilyResponsibility:
        return 'bg-orange-100 text-orange-800';
      case LeaveTypes.Unpaid:
        return 'bg-gray-100 text-gray-800';
      case LeaveTypes.Study:
        return 'bg-cyan-100 text-cyan-800';
      case LeaveTypes.Religious:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // State for leave balances
  const [balances, setBalances] = useState<LeaveBalance[]>(leaveBalances);
  
  // Effect to update localStorage when leave balances change
  useEffect(() => {
    try {
      localStorage.setItem('leaveBalances', JSON.stringify(balances));
    } catch (error) {
      console.error('Error saving leave balances:', error);
    }
  }, [balances]);

  // Calculate business days excluding public holidays between two dates
  const calculateLeaveWorkingDays = (startDate: string, endDate: string): number => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return calculateBusinessDaysExcludingHolidays(start, end);
    } catch (error) {
      console.error('Error calculating working days:', error);
      return 0;
    }
  };

  // Handle leave approval/rejection
  const handleLeaveAction = (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    // Find the leave request
    const leaveRequest = leaveRequests.find(request => request.id === requestId);
    if (!leaveRequest) return;
    
    // Update the leave request status
    const updatedRequests = leaveRequests.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: action === 'approve' ? 'approved' as const : 'rejected' as const,
            approvedDate: action === 'approve' ? new Date().toISOString().split('T')[0] : undefined,
            rejectedReason: action === 'reject' ? reason : undefined
          }
        : request
    );
    
    setLeaveRequests(updatedRequests);
    
    // Save to localStorage
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    
    // If approving the leave request, update leave balances
    if (action === 'approve') {
      // Re-calculate business days excluding public holidays
      const actualLeaveDays = calculateLeaveWorkingDays(
        leaveRequest.startDate,
        leaveRequest.endDate
      );
      
      // Update employee leave balance
      setBalances(currentBalances => {        
        const updatedBalances = [...currentBalances];
        const employeeBalanceIndex = updatedBalances.findIndex(
          balance => balance.employeeId === leaveRequest.employeeId
        );
        
        if (employeeBalanceIndex !== -1) {
          const balance = { ...updatedBalances[employeeBalanceIndex] };
          
          // Apply balance updates based on leave type
          switch(leaveRequest.leaveType) {
            case LeaveTypes.Annual:
              if (balance.annual.remaining >= actualLeaveDays) {
                balance.annual.used += actualLeaveDays;
                balance.annual.remaining -= actualLeaveDays;
                toast.success(`Annual leave approved. ${actualLeaveDays} days deducted from balance.`);
              } else if (balance.annual.remaining > 0) {
                const unpaidDays = actualLeaveDays - balance.annual.remaining;
                balance.annual.used += balance.annual.remaining;
                balance.annual.remaining = 0;
                balance.unpaid.days += unpaidDays;
                toast.info(`Partial annual leave approved. ${balance.annual.remaining} days of paid leave and ${unpaidDays} days of unpaid leave.`);
              } else {
                balance.unpaid.days += actualLeaveDays;
                toast.info(`No annual leave balance. Approved as ${actualLeaveDays} days of unpaid leave.`);
              }
              break;
              
            case LeaveTypes.Sick:
              if (balance.sick.remaining >= actualLeaveDays) {
                balance.sick.used += actualLeaveDays;
                balance.sick.remaining -= actualLeaveDays;
                toast.success(`Sick leave approved. ${actualLeaveDays} days deducted from balance.`);
              } else {
                balance.unpaid.days += actualLeaveDays;
                toast.info(`No sick leave balance. Approved as ${actualLeaveDays} days of unpaid leave.`);
              }
              break;
              
            case LeaveTypes.FamilyResponsibility:
              if (balance.familyResponsibility.remaining >= actualLeaveDays) {
                balance.familyResponsibility.used += actualLeaveDays;
                balance.familyResponsibility.remaining -= actualLeaveDays;
                toast.success(`Family responsibility leave approved. ${actualLeaveDays} days deducted from balance.`);
              } else {
                balance.unpaid.days += actualLeaveDays;
                toast.info(`No family responsibility leave balance. Approved as ${actualLeaveDays} days of unpaid leave.`);
              }
              break;
              
            case LeaveTypes.Maternity:
              if (balance.maternity && balance.maternity.remaining >= actualLeaveDays) {
                balance.maternity.used += actualLeaveDays;
                balance.maternity.remaining -= actualLeaveDays;
                toast.success(`Maternity leave approved. ${actualLeaveDays} days deducted from balance.`);
              } else if (balance.maternity && balance.maternity.remaining > 0) {
                const unpaidDays = actualLeaveDays - balance.maternity.remaining;
                balance.maternity.used += balance.maternity.remaining;
                balance.maternity.remaining = 0;
                balance.unpaid.days += unpaidDays;
                toast.info(`Partial maternity leave approved with ${unpaidDays} days as unpaid leave.`);
              } else {
                balance.unpaid.days += actualLeaveDays;
                toast.info(`No maternity leave balance. Approved as ${actualLeaveDays} days of unpaid leave.`);
              }
              break;
              
            case LeaveTypes.Parental:
              if (balance.parental && balance.parental.remaining >= actualLeaveDays) {
                balance.parental.used += actualLeaveDays;
                balance.parental.remaining -= actualLeaveDays;
                toast.success(`Parental leave approved. ${actualLeaveDays} days deducted from balance.`);
              } else if (balance.parental && balance.parental.remaining > 0) {
                const unpaidDays = actualLeaveDays - balance.parental.remaining;
                balance.parental.used += balance.parental.remaining;
                balance.parental.remaining = 0;
                balance.unpaid.days += unpaidDays;
                toast.info(`Partial parental leave approved with ${unpaidDays} days as unpaid leave.`);
              } else {
                balance.unpaid.days += actualLeaveDays;
                toast.info(`No parental leave balance. Approved as ${actualLeaveDays} days of unpaid leave.`);
              }
              break;
              
            case LeaveTypes.Bereavement:
              if (balance.familyResponsibility.remaining >= actualLeaveDays) {
                balance.familyResponsibility.used += actualLeaveDays;
                balance.familyResponsibility.remaining -= actualLeaveDays;
                toast.success(`Bereavement leave approved. ${actualLeaveDays} days deducted from family responsibility leave.`);
              } else {
                balance.unpaid.days += actualLeaveDays;
                toast.info(`No family responsibility leave balance. Approved as ${actualLeaveDays} days of unpaid leave.`);
              }
              break;
              
            // Additional case for other leave types can be added here
              
            case LeaveTypes.Unpaid:
              // Unpaid leave just tracks days
              balance.unpaid.days += actualLeaveDays;
              toast.success(`Unpaid leave approved for ${actualLeaveDays} days.`);
              break;
              
            // Handle other leave types...
            default:
              toast.info(`Leave approved but no balance deduction for ${leaveRequest.leaveType}.`);
              break;
          }
          
          updatedBalances[employeeBalanceIndex] = balance;
        } else {
          toast.error(`Could not find leave balance for employee ID: ${leaveRequest.employeeId}`);
        }
        
        // Save updated balances to localStorage
        localStorage.setItem('leaveBalances', JSON.stringify(updatedBalances));
        return updatedBalances;
      });
    } else if (action === 'reject' && leaveRequest.status === 'approved') {
      // If rejecting a previously approved leave request, restore the leave balance
      const actualLeaveDays = calculateLeaveWorkingDays(
        leaveRequest.startDate,
        leaveRequest.endDate
      );
      
      // Restore employee leave balance
      setBalances(currentBalances => {
        const updatedBalances = [...currentBalances];
        const employeeBalanceIndex = updatedBalances.findIndex(
          balance => balance.employeeId === leaveRequest.employeeId
        );
        
        if (employeeBalanceIndex !== -1) {
          const balance = { ...updatedBalances[employeeBalanceIndex] };
          
          // Restore balance based on leave type
          switch(leaveRequest.leaveType) {
            case LeaveTypes.Annual:
              balance.annual.used -= actualLeaveDays;
              balance.annual.remaining += actualLeaveDays;
              toast.info(`Leave rejected. ${actualLeaveDays} days restored to annual leave balance.`);
              break;
              
            case LeaveTypes.Sick:
              balance.sick.used -= actualLeaveDays;
              balance.sick.remaining += actualLeaveDays;
              toast.info(`Leave rejected. ${actualLeaveDays} days restored to sick leave balance.`);
              break;
              
            case LeaveTypes.FamilyResponsibility:
              balance.familyResponsibility.used -= actualLeaveDays;
              balance.familyResponsibility.remaining += actualLeaveDays;
              toast.info(`Leave rejected. ${actualLeaveDays} days restored to family responsibility leave balance.`);
              break;
              
            case LeaveTypes.Maternity:
              if (balance.maternity) {
                balance.maternity.used -= actualLeaveDays;
                balance.maternity.remaining += actualLeaveDays;
                toast.info(`Leave rejected. ${actualLeaveDays} days restored to maternity leave balance.`);
              }
              break;
              
            case LeaveTypes.Parental:
              if (balance.parental) {
                balance.parental.used -= actualLeaveDays;
                balance.parental.remaining += actualLeaveDays;
                toast.info(`Leave rejected. ${actualLeaveDays} days restored to parental leave balance.`);
              }
              break;
              
            case LeaveTypes.Bereavement:
              if (balance.bereavement) {
                balance.bereavement.used -= actualLeaveDays;
                balance.bereavement.remaining += actualLeaveDays;
                toast.info(`Leave rejected. ${actualLeaveDays} days restored to bereavement leave balance.`);
              } else {
                // If no specific bereavement balance, it might have been from family responsibility
                balance.familyResponsibility.used -= actualLeaveDays;
                balance.familyResponsibility.remaining += actualLeaveDays;
                toast.info(`Leave rejected. ${actualLeaveDays} days restored to family responsibility leave balance.`);
              }
              break;
              
            case LeaveTypes.Unpaid:
              balance.unpaid.days -= actualLeaveDays;
              toast.info(`Unpaid leave rejected.`);
              break;
              
            case LeaveTypes.Study:
            case LeaveTypes.Religious:
              // These typically come from annual leave
              balance.annual.used -= actualLeaveDays;
              balance.annual.remaining += actualLeaveDays;
              toast.info(`Leave rejected. ${actualLeaveDays} days restored to annual leave balance.`);
              break;
          }
          
          // Update the employee's balance in the array
          updatedBalances[employeeBalanceIndex] = balance;
        }
        
        // Save updated balances to localStorage
        localStorage.setItem('leaveBalances', JSON.stringify(updatedBalances));
        return updatedBalances;
      });
      
      toast.info(`Leave request rejected: ${reason || 'No reason provided'}`);
    } else if (action === 'reject') {
      toast.info(`Leave request rejected: ${reason || 'No reason provided'}`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // Handle adding a new leave request
  const handleLeaveAdded = (newLeave: LeaveRequest) => {
    setLeaveRequests(prev => [...prev, newLeave]);
    // Save to localStorage
    const updatedRequests = [...leaveRequests, newLeave];
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
  };
  
  // Handle deleting a leave request
  const handleDeleteLeaveRequest = (requestId: string) => {
    // Find the leave request to be deleted
    const leaveRequest = leaveRequests.find(request => request.id === requestId);
    
    if (leaveRequest && leaveRequest.status === 'approved') {
      // If deleting an approved leave request, restore the leave balance
      const actualLeaveDays = calculateLeaveWorkingDays(
        leaveRequest.startDate,
        leaveRequest.endDate
      );
      
      // Restore employee leave balance similar to rejection
      setBalances(currentBalances => {
        const updatedBalances = [...currentBalances];
        const employeeBalanceIndex = updatedBalances.findIndex(
          balance => balance.employeeId === leaveRequest.employeeId
        );
        
        if (employeeBalanceIndex !== -1) {
          const balance = { ...updatedBalances[employeeBalanceIndex] };
          
          // Restore balance based on leave type (similar to rejection logic)
          switch(leaveRequest.leaveType) {
            case LeaveTypes.Annual:
              balance.annual.used -= actualLeaveDays;
              balance.annual.remaining += actualLeaveDays;
              break;
            case LeaveTypes.Sick:
              balance.sick.used -= actualLeaveDays;
              balance.sick.remaining += actualLeaveDays;
              break;
            case LeaveTypes.FamilyResponsibility:
              balance.familyResponsibility.used -= actualLeaveDays;
              balance.familyResponsibility.remaining += actualLeaveDays;
              break;
            case LeaveTypes.Maternity:
              if (balance.maternity) {
                balance.maternity.used -= actualLeaveDays;
                balance.maternity.remaining += actualLeaveDays;
              }
              break;
            case LeaveTypes.Parental:
              if (balance.parental) {
                balance.parental.used -= actualLeaveDays;
                balance.parental.remaining += actualLeaveDays;
              }
              break;
            case LeaveTypes.Bereavement:
              if (balance.bereavement) {
                balance.bereavement.used -= actualLeaveDays;
                balance.bereavement.remaining += actualLeaveDays;
              } else {
                balance.familyResponsibility.used -= actualLeaveDays;
                balance.familyResponsibility.remaining += actualLeaveDays;
              }
              break;
            case LeaveTypes.Unpaid:
              balance.unpaid.days -= actualLeaveDays;
              break;
            case LeaveTypes.Study:
            case LeaveTypes.Religious:
              balance.annual.used -= actualLeaveDays;
              balance.annual.remaining += actualLeaveDays;
              break;
          }
          
          // Update the employee's balance in the array
          updatedBalances[employeeBalanceIndex] = balance;
        }
        
        // Save updated balances to localStorage
        localStorage.setItem('leaveBalances', JSON.stringify(updatedBalances));
        return updatedBalances;
      });
    }
    
    // Remove the leave request from state and localStorage
    const updatedRequests = leaveRequests.filter(request => request.id !== requestId);
    setLeaveRequests(updatedRequests);
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    toast.success('Leave request deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Leave Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage employee leave requests and balances</p>
        </div>
        
        <Button 
          onClick={() => setIsLeaveModalOpen(true)}
          className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro transition-all hover:scale-105"
        >
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
                            onClick={() => setRejectModalOpen({
                              isOpen: true,
                              requestId: request.id
                            })}
                          >
                            <X className="h-4 w-4 mr-1" />
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
                  {/* Annual Leave */}
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
                  
                  {/* Sick Leave */}
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
                  
                  {/* Family Responsibility Leave */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 font-sf-pro">Family Responsibility</span>
                    <span className="text-sm font-bold text-slate-900 font-sf-pro">
                      {balance.familyResponsibility.remaining}/{balance.familyResponsibility.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(balance.familyResponsibility.remaining / balance.familyResponsibility.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Maternity Leave */}
                  {balance.maternity && balance.maternity.total > 0 && (
                    <>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-slate-700 font-sf-pro">Maternity Leave</span>
                        {balance.maternity.used > 0 ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                            On Maternity Leave
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-slate-900 font-sf-pro">
                            {balance.maternity.remaining}/{balance.maternity.total}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${(balance.maternity.remaining / balance.maternity.total) * 100}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                  
                  {/* Parental Leave */}
                  {balance.parental && balance.parental.total > 0 && (
                    <>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-slate-700 font-sf-pro">Parental Leave</span>
                        <span className="text-sm font-bold text-slate-900 font-sf-pro">
                          {balance.parental.remaining}/{balance.parental.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${(balance.parental.remaining / balance.parental.total) * 100}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                  
                  {/* Other Leave Types - Shown only if used */}
                  {(balance.bereavement?.used > 0 || 
                   balance.unpaid?.days > 0) && (
                    <div className="mt-3">
                      <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer list-none">
                          <span className="text-sm font-medium text-slate-800 font-sf-pro">Other Leave Types</span>
                          <span className="text-sm text-slate-500">
                            <svg className="h-4 w-4 transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </summary>
                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-200">
                          {/* Bereavement Leave */}
                          {balance.bereavement?.used > 0 && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs font-medium text-slate-700 font-sf-pro">Bereavement:</span>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {balance.bereavement.used} days used
                              </span>
                            </div>
                          )}
                          
                          {/* Unpaid Leave */}
                          {balance.unpaid?.days > 0 && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs font-medium text-slate-700 font-sf-pro">Unpaid:</span>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {balance.unpaid.days} days
                              </span>
                            </div>
                          )}
                          
                          {/* Add other leave types here when used */}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Public Holiday */}
      <NextPublicHolidayDisplay />

      {/* Leave Management Actions */}
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
      
      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        employees={employees}
        onLeaveAdded={handleLeaveAdded}
        leaveBalances={leaveBalances}
      />
      
      {/* Reject Modal */}
      <Dialog open={rejectModal.isOpen} onOpenChange={(open) => {
        if (!open) setRejectModalOpen({ isOpen: false, requestId: '' });
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-sf-pro">Reject Leave Request</DialogTitle>
            <DialogDescription className="text-gray-600 font-sf-pro">
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejectReason" className="text-right font-sf-pro">
                Reason
              </Label>
              <Textarea
                id="rejectReason"
                className="col-span-3 font-sf-pro"
                placeholder="Provide rejection reason"
                rows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    handleLeaveAction(rejectModal.requestId, 'reject', target.value);
                    setRejectModalOpen({ isOpen: false, requestId: '' });
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectModalOpen({ isOpen: false, requestId: '' })}
              className="font-sf-pro"
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                const reasonInput = (e.target as HTMLButtonElement)?.form?.querySelector('#rejectReason') as HTMLTextAreaElement;
                const reason = reasonInput?.value || 'No reason provided';
                handleLeaveAction(rejectModal.requestId, 'reject', reason);
                setRejectModalOpen({ isOpen: false, requestId: '' });
              }}
              className="bg-red-600 hover:bg-red-700 font-sf-pro"
            >
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveManagement;
