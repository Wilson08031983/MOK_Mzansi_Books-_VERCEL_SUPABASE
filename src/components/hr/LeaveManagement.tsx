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
  Flower,
  BookOpen,
  Book, // Using Book instead of PrayingHands
  Baby,
  BriefcaseBusiness
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
import { 
  LeaveRequest, 
  LeaveTypes, 
  calculateBusinessDaysExcludingHolidays,
  LeaveBalance
} from './LeaveManagementTypes';
import { LeaveBalanceService } from './LeaveBalanceService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Helper functions for leave management
const getLeaveTypeIcon = (leaveType: LeaveTypes) => {
  switch (leaveType) {
    case LeaveTypes.Annual:
      return <Palmtree className="h-4 w-4 text-blue-600" />;
    case LeaveTypes.Sick:
      return <Stethoscope className="h-4 w-4 text-red-600" />;
    case LeaveTypes.FamilyResponsibility:
      return <Users className="h-4 w-4 text-green-600" />;
    case LeaveTypes.Maternity:
      return <Baby className="h-4 w-4 text-pink-600" />;
    case LeaveTypes.Parental:
      return <Heart className="h-4 w-4 text-purple-600" />;
    case LeaveTypes.Bereavement:
      return <Flower className="h-4 w-4 text-slate-600" />;
    case LeaveTypes.Religious:
      return <Book className="h-4 w-4 text-yellow-600" />;
    case LeaveTypes.Study:
      return <BookOpen className="h-4 w-4 text-orange-600" />;
    case LeaveTypes.Unpaid:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
    default:
      return <Calendar className="h-4 w-4 text-slate-600" />;
  }
};

const getLeaveTypeColor = (leaveType: LeaveTypes) => {
  switch (leaveType) {
    case LeaveTypes.Annual:
      return 'bg-blue-100 text-blue-800';
    case LeaveTypes.Sick:
      return 'bg-red-100 text-red-800';
    case LeaveTypes.FamilyResponsibility:
      return 'bg-green-100 text-green-800';
    case LeaveTypes.Maternity:
      return 'bg-pink-100 text-pink-800';
    case LeaveTypes.Parental:
      return 'bg-purple-100 text-purple-800';
    case LeaveTypes.Bereavement:
      return 'bg-slate-100 text-slate-800';
    case LeaveTypes.Religious:
      return 'bg-yellow-100 text-yellow-800';
    case LeaveTypes.Study:
      return 'bg-orange-100 text-orange-800';
    case LeaveTypes.Unpaid:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

// Get status color for leave request status badges
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Calculate leave working days (excluding weekends and public holidays)
const calculateLeaveWorkingDays = (startDateString: string, endDateString: string): number => {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  return calculateBusinessDaysExcludingHolidays(startDate, endDate);
};



// View Details Modal Component
interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ isOpen, onClose, leaveRequest }) => {
  if (!leaveRequest) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/90 backdrop-blur-lg border border-white/20 shadow-business rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">Leave Request Details</DialogTitle>
          <DialogDescription className="text-slate-600 font-sf-pro">
            Complete information about this leave request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 font-sf-pro">Employee</Label>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                {leaveRequest.employeeName?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-slate-900 font-sf-pro">{leaveRequest.employeeName}</p>
                <p className="text-sm text-slate-600 font-sf-pro">{leaveRequest.employeePosition}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Leave Type</Label>
              <div className="mt-1 flex items-center space-x-2">
                {getLeaveTypeIcon(leaveRequest.leaveType)}
                <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getLeaveTypeColor(leaveRequest.leaveType)}`}>
                  {leaveRequest.leaveType.charAt(0).toUpperCase() + leaveRequest.leaveType.slice(1)}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Status</Label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusColor(leaveRequest.status)}`}>
                  {leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Start Date</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">{new Date(leaveRequest.startDate).toLocaleDateString()}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">End Date</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">{new Date(leaveRequest.endDate).toLocaleDateString()}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Days Requested</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">{leaveRequest.days} days</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Submission Date</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">{new Date(leaveRequest.requestDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-slate-700 font-sf-pro">Reason for Leave</Label>
            <p className="mt-1 text-slate-800 font-sf-pro p-3 bg-white/50 rounded-md border border-slate-200">{leaveRequest.reason}</p>
          </div>
          
          {leaveRequest.rejectedReason && (
            <div>
              <Label className="text-sm font-medium text-red-700 font-sf-pro">Rejection Reason</Label>
              <p className="mt-1 text-red-600 font-sf-pro p-3 bg-red-50 rounded-md border border-red-100">{leaveRequest.rejectedReason}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-sf-pro">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
}): JSX.Element => {
  // Helper functions inside component scope
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string | LeaveTypes>('all');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  
  // State for reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: '' });
  
  // State for view details modal
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    leaveRequest: LeaveRequest | null;
  }>({ isOpen: false, leaveRequest: null });
  
  // Using the already defined getStatusColor function above
  
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
    return LeaveBalanceService.calculateLeaveWorkingDays(startDate, endDate);
  };

  // Handle leave approval/rejection using LeaveBalanceService
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
    
    // If approving the leave request, update leave balances per South African BCEA rules
    if (action === 'approve') {
      // Calculate actual working days (excluding weekends and public holidays)
      const actualLeaveDays = LeaveBalanceService.calculateLeaveWorkingDays(
        leaveRequest.startDate,
        leaveRequest.endDate
      );
      
      if (actualLeaveDays <= 0) {
        toast.info("No working days in this leave period (all days are weekends or public holidays)");
        return;
      }
      
      // Update employee leave balance
      setBalances(currentBalances => {        
        const updatedBalances = [...currentBalances];
        const employeeBalanceIndex = updatedBalances.findIndex(
          balance => balance.employeeId === leaveRequest.employeeId
        );
        
        if (employeeBalanceIndex === -1) {
          toast.error(`Could not find leave balance for employee ${leaveRequest.employeeName}`);
          return currentBalances;
        }
        
        // First validate if the leave can be approved based on available balance
        const employeeBalance = updatedBalances[employeeBalanceIndex];
        const validation = LeaveBalanceService.validateLeaveBalance(leaveRequest, employeeBalance);
        
        // If there's insufficient balance and strict validation is required, reject the leave
        // For now, we're allowing it to proceed with warnings for user flexibility
        if (!validation.isValid) {
          // Show warning but still process the leave
          toast.warning(validation.message);
        }
        
        // Update the leave balance using the service
        const updatedBalance = LeaveBalanceService.updateLeaveBalances(
          leaveRequest,
          employeeBalance,
          actualLeaveDays
        );
        
        // Also automatically accrue any pending annual leave
        const balanceWithAccrual = LeaveBalanceService.accrueAnnualLeave(updatedBalance);
        
        // Update the employee's balance in the array
        updatedBalances[employeeBalanceIndex] = balanceWithAccrual;
        
        // Save updated balances to localStorage
        localStorage.setItem('leaveBalances', JSON.stringify(updatedBalances));
        return updatedBalances;
      });
    } else if (action === 'reject' && leaveRequest.status === 'approved') {
      // If rejecting a previously approved leave request, restore the leave balance
      setBalances(currentBalances => {
        const updatedBalances = [...currentBalances];
        const employeeBalanceIndex = updatedBalances.findIndex(
          balance => balance.employeeId === leaveRequest.employeeId
        );
        
        if (employeeBalanceIndex !== -1) {
          // Use the service to restore the balance
          const updatedBalance = LeaveBalanceService.restoreLeaveBalance(
            leaveRequest,
            updatedBalances[employeeBalanceIndex]
          );
          
          // Update the employee's balance in the array
          updatedBalances[employeeBalanceIndex] = updatedBalance;
        }
        
        // Save updated balances to localStorage
        localStorage.setItem('leaveBalances', JSON.stringify(updatedBalances));
        return updatedBalances;
      });
      
      toast.info(`Leave request rejected: ${reason || 'No reason provided'}`);
    }
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
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-sf-pro"
                        onClick={() => setViewDetailsModal({ isOpen: true, leaveRequest: request })}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="font-sf-pro">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px] bg-white/90 backdrop-blur-lg border border-slate-200 shadow-md rounded-lg">
                          <DropdownMenuItem
                            onClick={() => setViewDetailsModal({ isOpen: true, leaveRequest: request })}
                            className="flex items-center cursor-pointer hover:bg-slate-100 font-sf-pro text-sm text-slate-700"
                          >
                            <Info className="mr-2 h-4 w-4" />
                            View Full Details
                          </DropdownMenuItem>
                          
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleLeaveAction(request.id, 'approve')}
                                className="flex items-center cursor-pointer hover:bg-slate-100 font-sf-pro text-sm text-green-700"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve Leave
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => setRejectModalOpen({ isOpen: true, requestId: request.id })}
                                className="flex items-center cursor-pointer hover:bg-slate-100 font-sf-pro text-sm text-red-700"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Decline Leave
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => handleDeleteLeaveRequest(request.id)}
                            className="flex items-center cursor-pointer hover:bg-slate-100 font-sf-pro text-sm text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      
      {/* Leave Request Modal - Placeholder component that will be implemented separately */}
      {isLeaveModalOpen && (
        <Dialog open={isLeaveModalOpen} onOpenChange={(open) => {
          if (!open) setIsLeaveModalOpen(false);
        }}>
          <DialogContent className="sm:max-w-[600px] bg-white/90 backdrop-blur-lg border border-white/20 shadow-business rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">New Leave Request</DialogTitle>
              <DialogDescription className="text-slate-600 font-sf-pro">
                Create a new leave request for an employee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Placeholder for leave request form - will be implemented separately */}
              <p className="text-slate-700 font-sf-pro">Leave request form to be implemented separately</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLeaveModalOpen(false)} className="font-sf-pro">Cancel</Button>
              <Button onClick={() => setIsLeaveModalOpen(false)} className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 font-sf-pro">Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Reject Modal */}
      <Dialog open={rejectModalOpen.isOpen} onOpenChange={(open) => {
        if (!open) setRejectModalOpen({ isOpen: false, requestId: '' });
      }}>
        <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-lg border border-white/20 shadow-business rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-sf-pro">Decline Leave Request</DialogTitle>
            <DialogDescription className="text-gray-600 font-sf-pro">
              Please provide a reason for declining this leave request.
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
                    handleLeaveAction(rejectModalOpen.requestId, 'reject', target.value);
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
                handleLeaveAction(rejectModalOpen.requestId, 'reject', reason);
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
