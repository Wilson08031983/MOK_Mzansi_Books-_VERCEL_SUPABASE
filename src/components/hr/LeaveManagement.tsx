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
import NewLeaveRequestModal from './NewLeaveRequestModal';
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
  onDownload: (attachmentUrl: string | undefined, attachmentName: string | undefined) => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ isOpen, onClose, leaveRequest, onDownload }) => {
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
          </div>
          
          <div>
            <Label className="text-sm font-medium text-slate-700 font-sf-pro">Reason</Label>
            <p className="mt-1 text-slate-800 font-sf-pro p-2 bg-slate-50 rounded-md">{leaveRequest.reason}</p>
          </div>
          
          {leaveRequest.rejectedReason && (
            <div>
              <Label className="text-sm font-medium text-red-700 font-sf-pro">Rejection Reason</Label>
              <p className="mt-1 text-red-700 font-sf-pro p-2 bg-red-50 rounded-md">{leaveRequest.rejectedReason}</p>
            </div>
          )}
          
          {leaveRequest.attachmentUrl && (
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Attachment</Label>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(leaveRequest.attachmentUrl, leaveRequest.attachmentName)}
                  className="flex items-center space-x-2 font-sf-pro"
                >
                  <Download className="h-4 w-4" />
                  <span>{leaveRequest.attachmentName || 'Download Attachment'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
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
    return name.split(' ').map(n => n[0]).join('');
  };

  // State for various modals and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState({ isOpen: false, requestId: '' });
  const [viewDetailsModal, setViewDetailsModal] = useState<{ isOpen: boolean; leaveRequest: LeaveRequest | null }>({
    isOpen: false,
    leaveRequest: null
  });
  
  // State for upload functionality
  const [uploadModalOpen, setUploadModalOpen] = useState<{ isOpen: boolean; requestId: string }>({
    isOpen: false,
    requestId: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter and search leave requests
  const filteredLeaveRequests = leaveRequests.filter(request => {
    // Apply search filter
    const searchMatch = 
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeePosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    
    // Apply leave type filter
    const leaveTypeMatch = leaveTypeFilter === 'all' || request.leaveType === leaveTypeFilter;
    
    // Apply time filter
    let timeMatch = true;
    if (timeFilter === 'thisMonth') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const requestMonth = new Date(request.startDate).getMonth();
      const requestYear = new Date(request.startDate).getFullYear();
      timeMatch = requestMonth === currentMonth && requestYear === currentYear;
    } else if (timeFilter === 'nextMonth') {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthVal = nextMonth.getMonth();
      const nextMonthYear = nextMonth.getFullYear();
      const requestMonth = new Date(request.startDate).getMonth();
      const requestYear = new Date(request.startDate).getFullYear();
      timeMatch = requestMonth === nextMonthVal && requestYear === nextMonthYear;
    } else if (timeFilter === 'thisWeek') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const requestDate = new Date(request.startDate);
      timeMatch = requestDate >= startOfWeek && requestDate <= endOfWeek;
    }
    
    return searchMatch && statusMatch && leaveTypeMatch && timeMatch;
  });
  
  // Handle leave action (approve/reject)
  const handleLeaveAction = (requestId: string, action: 'approve' | 'reject', rejectReason?: string) => {
    const updatedRequests = leaveRequests.map(request => {
      if (request.id === requestId) {
        const updatedRequest = { 
          ...request, 
          status: action === 'approve' ? 'approved' : 'rejected',
          rejectedReason: action === 'reject' ? rejectReason : request.rejectedReason
        };
        return updatedRequest;
      }
      return request;
    });
    
    setLeaveRequests(updatedRequests);
    
    // Save to localStorage for demo purposes
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    
    // Show toast notification
    if (action === 'approve') {
      toast.success('Leave request approved successfully');
    } else {
      toast.success('Leave request rejected successfully');
    }
  };
  
  // Handle deleting leave request
  const handleDeleteLeaveRequest = (requestId: string) => {
    const updatedRequests = leaveRequests.filter(request => request.id !== requestId);
    setLeaveRequests(updatedRequests);
    
    // Save to localStorage for demo purposes
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    
    toast.success('Leave request deleted successfully');
  };
  
  // Handle downloading attachment
  const handleDownload = (attachmentUrl: string | undefined, attachmentName: string | undefined) => {
    if (!attachmentUrl) {
      toast.error('No attachment available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = attachmentName || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Downloading attachment');
  };
  
  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle upload submission
  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    // Create a URL for the file (in a real app, this would be uploaded to a server)
    const fileUrl = URL.createObjectURL(selectedFile);
    
    // Update the leave request with the attachment
    const updatedRequests = leaveRequests.map(request => {
      if (request.id === uploadModalOpen.requestId) {
        return {
          ...request,
          attachmentUrl: fileUrl,
          attachmentName: selectedFile.name
        };
      }
      return request;
    });
    
    setLeaveRequests(updatedRequests);
    
    // Save to localStorage for demo purposes
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    
    // Reset state and close modal
    setSelectedFile(null);
    setUploadModalOpen({ isOpen: false, requestId: '' });
    
    toast.success('Attachment uploaded successfully');
  };

  // Handle opening upload modal
  const handleUploadOpen = (requestId: string) => {
    setUploadModalOpen({ isOpen: true, requestId });
  };
  
  // Add a new leave request
  const handleAddLeaveRequest = (newRequest: LeaveRequest) => {
    const updatedRequests = [...leaveRequests, newRequest];
    setLeaveRequests(updatedRequests);
    
    // Save to localStorage for demo purposes
    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
    
    toast.success('Leave request added successfully');
  };
  
  return (
    <div className="space-y-6">
      {/* Leave Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-sf-pro">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-4xl font-semibold text-mokm-purple-600 font-sf-pro">{hrMetrics.onLeaveToday}</div>
              <div className="ml-2 text-sm font-medium text-slate-500 font-sf-pro">employees</div>
            </div>
            <div className="mt-3 text-xs text-slate-500 font-sf-pro">
              {hrMetrics.onLeaveToday > 0 ? 'Employees currently on leave' : 'No employees on leave today'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-sf-pro">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <div className="text-4xl font-semibold text-mokm-blue-600 font-sf-pro">
                {leaveRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="ml-2 text-sm font-medium text-slate-500 font-sf-pro">requests</div>
            </div>
            <div className="mt-3 text-xs text-slate-500 font-sf-pro">
              {leaveRequests.filter(r => r.status === 'pending').length > 0 
                ? 'Requires your attention'
                : 'No pending requests'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-sf-pro">Next Holiday</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <NextPublicHolidayDisplay />
          </CardContent>
        </Card>
      </div>
      
      {/* Leave Request Management */}
      <div className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 font-sf-pro">Leave Requests</h2>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-mokm-purple-600 hover:bg-mokm-purple-700 font-sf-pro">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-grow max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by employee or leave type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 font-sf-pro"
              />
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] border-slate-200 font-sf-pro">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-md rounded-lg font-sf-pro">
                <SelectItem value="all" className="font-sf-pro">All Statuses</SelectItem>
                <SelectItem value="pending" className="font-sf-pro">Pending</SelectItem>
                <SelectItem value="approved" className="font-sf-pro">Approved</SelectItem>
                <SelectItem value="rejected" className="font-sf-pro">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger className="w-[150px] border-slate-200 font-sf-pro">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-md rounded-lg font-sf-pro">
                <SelectItem value="all" className="font-sf-pro">All Types</SelectItem>
                <SelectItem value="annual" className="font-sf-pro">Annual Leave</SelectItem>
                <SelectItem value="sick" className="font-sf-pro">Sick Leave</SelectItem>
                <SelectItem value="family" className="font-sf-pro">Family Responsibility</SelectItem>
                <SelectItem value="maternity" className="font-sf-pro">Maternity Leave</SelectItem>
                <SelectItem value="parental" className="font-sf-pro">Parental Leave</SelectItem>
                <SelectItem value="bereavement" className="font-sf-pro">Bereavement Leave</SelectItem>
                <SelectItem value="religious" className="font-sf-pro">Religious Leave</SelectItem>
                <SelectItem value="study" className="font-sf-pro">Study Leave</SelectItem>
                <SelectItem value="unpaid" className="font-sf-pro">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px] border-slate-200 font-sf-pro">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-md rounded-lg font-sf-pro">
                <SelectItem value="all" className="font-sf-pro">All Time</SelectItem>
                <SelectItem value="thisWeek" className="font-sf-pro">This Week</SelectItem>
                <SelectItem value="thisMonth" className="font-sf-pro">This Month</SelectItem>
                <SelectItem value="nextMonth" className="font-sf-pro">Next Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredLeaveRequests.length > 0 ? (
            filteredLeaveRequests.map(request => (
              <div 
                key={request.id} 
                className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                      {getInitials(request.employeeName)}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 font-sf-pro">{request.employeeName}</h3>
                      <p className="text-sm text-slate-500 font-sf-pro">{request.employeePosition}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => handleUploadOpen(request.id)}
                      variant="outline"
                      size="sm"
                      className="text-mokm-purple-600 border-slate-200 hover:border-mokm-purple-600 font-sf-pro"
                      title="Upload document"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>

                    <Button 
                      onClick={() => handleDownload(request.attachmentUrl, request.attachmentName)}
                      variant="outline"
                      size="sm"
                      className={`${request.attachmentUrl ? 'text-mokm-blue-600 border-slate-200 hover:border-mokm-blue-600' : 'text-slate-400 border-slate-200 cursor-not-allowed'} font-sf-pro`}
                      disabled={!request.attachmentUrl}
                      title={request.attachmentUrl ? "Download document" : "No attachment available"}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="font-sf-pro">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="end" className="min-w-[180px] bg-white/90 backdrop-blur-lg border border-slate-200 shadow-md rounded-lg">
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
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {getLeaveTypeIcon(request.leaveType)}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getLeaveTypeColor(request.leaveType)}`}>
                      {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-slate-600 font-sf-pro">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(request.startDate)} to {formatDate(request.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-end md:justify-start">
                    <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
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
      </div>
      
      {/* Create New Request Modal */}
      <NewLeaveRequestModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleAddLeaveRequest}
        employees={employees}
        leaveBalances={leaveBalances}
      />
      
      {/* Reject Leave Request Modal */}
      <Dialog open={rejectModalOpen.isOpen} onOpenChange={(open) => !open && setRejectModalOpen({ isOpen: false, requestId: '' })}>
        <DialogContent className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-business rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">Reject Leave Request</DialogTitle>
            <DialogDescription className="text-slate-600 font-sf-pro">
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-4">
            <div>
              <Label htmlFor="rejectReason" className="text-slate-700 font-sf-pro">Rejection Reason</Label>
              <Textarea 
                id="rejectReason" 
                placeholder="Enter reason for rejecting this leave request..." 
                className="h-32 resize-none mt-2 font-sf-pro"
              />
            </div>
          </form>
          
          <DialogFooter className="flex space-x-2 mt-4">
            <Button 
              type="button" 
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
      
      {/* Upload Modal */}
      <Dialog open={uploadModalOpen.isOpen} onOpenChange={(open) => !open && setUploadModalOpen({ isOpen: false, requestId: '' })}>
        <DialogContent className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-business rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">Upload Document</DialogTitle>
            <DialogDescription className="text-slate-600 font-sf-pro">
              Upload a document to attach to this leave request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="attachment" className="text-slate-700 font-sf-pro">Attachment</Label>
              <Input 
                id="attachment" 
                type="file" 
                className="font-sf-pro"
                onChange={handleFileChange}
              />
            </div>
            
            {selectedFile && (
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="text-sm font-medium text-slate-700 font-sf-pro">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 font-sf-pro">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setUploadModalOpen({ isOpen: false, requestId: '' })}
              className="font-sf-pro"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadSubmit}
              className="bg-mokm-purple-600 hover:bg-mokm-purple-700 font-sf-pro"
              disabled={!selectedFile}
            >
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewDetailsModal.isOpen}
        onClose={() => setViewDetailsModal({ isOpen: false, leaveRequest: null })}
        leaveRequest={viewDetailsModal.leaveRequest}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default LeaveManagement;
