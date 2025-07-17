// This is a temporary fixed version of LeaveManagement.tsx
// After confirming it works, you can replace the original file with this one

import React, { useState, useEffect, useMemo } from 'react';
import { format, addMonths, isWithinInterval, parseISO, isSameDay, addDays, isAfter, isToday as isDateToday } from 'date-fns';
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
  BriefcaseBusiness,
  Eye,
  Image,
  File
} from 'lucide-react';
import NextPublicHolidayDisplay from './NextPublicHolidayDisplay';
import NewLeaveRequestModal from './NewLeaveRequestModal';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

// View Details Modal Component
interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
  onDownload: (url: string, filename?: string) => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ isOpen, onClose, leaveRequest, onDownload }) => {
  if (!leaveRequest) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">Leave Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Employee</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">{leaveRequest.employeeName}</p>
              <p className="text-xs text-slate-500 font-sf-pro">{leaveRequest.employeePosition}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Status</Label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leaveRequest.status)} font-sf-pro`}>
                  {leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Leave Type</Label>
              <div className="mt-1 flex items-center space-x-1">
                {getLeaveTypeIcon(leaveRequest.leaveType)}
                <span className="text-slate-800 font-sf-pro">{leaveRequest.leaveType}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Request Date</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">{format(new Date(leaveRequest.requestDate), 'MMM dd, yyyy')}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 font-sf-pro">Leave Period</Label>
              <p className="mt-1 text-slate-800 font-sf-pro">
                {format(new Date(leaveRequest.startDate), 'MMM dd')} - {format(new Date(leaveRequest.endDate), 'MMM dd, yyyy')}
              </p>
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
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const calculateLeaveWorkingDays = (startDateStr: string, endDateStr: string): number => {
    try {
      const startDate = parseISO(startDateStr);
      const endDate = parseISO(endDateStr);
      
      let workingDays = 0;
      let currentDate = startDate;
      
      while (currentDate <= endDate) {
        // 0 is Sunday, 6 is Saturday - only count weekdays
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        currentDate = addDays(currentDate, 1);
      }
      
      return workingDays;
    } catch (error) {
      return 0;
    }
  };

  const getLeaveTypeColor = (leaveType: string): string => {
    const colors: Record<string, string> = {
      'annual': 'bg-mokm-blue-50 text-mokm-blue-600',
      'sick': 'bg-mokm-red-50 text-mokm-red-600',
      'family': 'bg-mokm-purple-50 text-mokm-purple-600',
      'maternity': 'bg-mokm-pink-50 text-mokm-pink-600',
      'parental': 'bg-mokm-pink-50 text-mokm-pink-600',
      'bereavement': 'bg-slate-100 text-slate-600',
      'religious': 'bg-mokm-green-50 text-mokm-green-600',
      'study': 'bg-mokm-orange-50 text-mokm-orange-600',
      'unpaid': 'bg-slate-100 text-slate-600',
    };
    
    // Convert to lowercase and find the matching color
    const key = leaveType.toLowerCase();
    return colors[key] || 'bg-slate-100 text-slate-600';
  };

  // State for leave management
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState<{ isOpen: boolean; leaveRequest: LeaveRequest | null }>({ 
    isOpen: false, 
    leaveRequest: null 
  });
  const [uploadModalOpen, setUploadModalOpen] = useState<{ isOpen: boolean; requestId: string; currentAttachment?: string }>({ 
    isOpen: false, 
    requestId: '' 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileValidationError, setFileValidationError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filtered and sorted leave requests
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests
      .filter(request => {
        // Filter by status
        if (filterStatus !== 'all' && request.status !== filterStatus) {
          return false;
        }
        
        // Filter by leave type
        if (filterLeaveType !== 'all' && request.leaveType !== filterLeaveType) {
          return false;
        }
        
        // Search by employee name or reason
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            request.employeeName.toLowerCase().includes(query) ||
            request.reason.toLowerCase().includes(query) ||
            request.employeePosition.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        let valueA, valueB;
        
        // Determine which field to sort by
        switch (sortBy) {
          case 'employeeName':
            valueA = a.employeeName.toLowerCase();
            valueB = b.employeeName.toLowerCase();
            break;
          case 'leaveType':
            valueA = a.leaveType;
            valueB = b.leaveType;
            break;
          case 'startDate':
            valueA = new Date(a.startDate).getTime();
            valueB = new Date(b.startDate).getTime();
            break;
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          case 'requestDate':
          default:
            valueA = new Date(a.requestDate).getTime();
            valueB = new Date(b.requestDate).getTime();
        }
        
        // Apply sort direction
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
  }, [leaveRequests, filterStatus, filterLeaveType, searchQuery, sortBy, sortDirection]);
  
  // Calculate upcoming leave events (next 7 days)
  const upcomingLeaveEvents = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return leaveRequests.filter(request => {
      if (request.status !== 'approved') return false;
      
      const startDate = parseISO(request.startDate);
      const endDate = parseISO(request.endDate);
      
      // Check if the leave period overlaps with the next 7 days
      return (
        (isWithinInterval(startDate, { start: today, end: nextWeek }) ||
         isWithinInterval(endDate, { start: today, end: nextWeek }) ||
         (startDate <= today && endDate >= nextWeek))
      );
    });
  }, [leaveRequests]);
  
  // Handle file selection for attachment upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileValidationError('File size exceeds 5MB limit');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFileValidationError('File type not supported. Please upload a PDF, JPG, PNG, or WEBP file.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    
    setFileValidationError('');
    setSelectedFile(file);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };
  
  // Handle attachment upload submission
  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadModalOpen.requestId) return;
    
    try {
      // Convert file to data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
      
      // Update the leave request with the attachment
      setLeaveRequests(prev => prev.map(request => {
        if (request.id === uploadModalOpen.requestId) {
          return {
            ...request,
            attachmentUrl: dataUrl,
            attachmentName: selectedFile.name,
            attachmentType: selectedFile.type
          };
        }
        return request;
      }));
      
      // Show success message and close modal
      toast.success('Attachment uploaded successfully');
      setUploadModalOpen({ isOpen: false, requestId: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Failed to upload attachment');
    }
  };
  
  // Handle leave request submission
  const handleLeaveRequestSubmit = (request: LeaveRequest) => {
    // Check if the employee has sufficient leave balance
    const employeeBalance = leaveBalances.find(balance => balance.employeeId === request.employeeId);
    
    if (!employeeBalance) {
      toast.error('Employee leave balance not found');
      return;
    }
    
    const validationResult = LeaveBalanceService.validateLeaveBalance(
      employeeBalance,
      request.leaveType,
      request.days
    );
    
    if (!validationResult.isValid) {
      toast.error(validationResult.message);
      return;
    }
    
    // Add the request to the list
    setLeaveRequests(prev => [request, ...prev]);
    
    // Update the employee's leave balance
    const updatedBalance = LeaveBalanceService.updateLeaveBalances(
      employeeBalance,
      request.leaveType,
      request.days
    );
    
    // Show success message
    toast.success('Leave request submitted successfully');
    
    // Close the modal
    setIsCreateModalOpen(false);
  };
  
  // Handle leave request approval
  const handleApproveRequest = (id: string) => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === id) {
        return { ...request, status: 'approved' };
      }
      return request;
    }));
    
    toast.success('Leave request approved');
  };
  
  // Handle leave request rejection
  const handleRejectRequest = (id: string, reason: string) => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === id) {
        return { 
          ...request, 
          status: 'rejected',
          rejectedReason: reason
        };
      }
      return request;
    }));
    
    toast.success('Leave request rejected');
  };
  
  // Handle leave request cancellation
  const handleCancelRequest = (id: string) => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === id) {
        return { ...request, status: 'cancelled' };
      }
      return request;
    }));
    
    toast.success('Leave request cancelled');
  };
  
  // Handle attachment download
  const handleDownload = (url: string, filename?: string) => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'attachment';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle attachment view
  const handleViewAttachment = (url: string, fileType?: string) => {
    if (fileType?.startsWith('image/')) {
      // For images, open in a new tab
      window.open(url, '_blank');
    } else {
      // For PDFs and other files, try to open or download
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  // Toggle sort direction when clicking on the same sort field
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Leave Management Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Leave Balance Card */}
        <Card className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-900 font-sf-pro">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaveBalances.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-sf-pro">Annual Leave</span>
                    <span className="text-sm font-medium text-slate-900 font-sf-pro">
                      {leaveBalances[0].annual.remaining} / {leaveBalances[0].annual.total} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-sf-pro">Sick Leave</span>
                    <span className="text-sm font-medium text-slate-900 font-sf-pro">
                      {leaveBalances[0].sick.remaining} / {leaveBalances[0].sick.total} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-sf-pro">Family Responsibility</span>
                    <span className="text-sm font-medium text-slate-900 font-sf-pro">
                      {leaveBalances[0].familyResponsibility.remaining} / {leaveBalances[0].familyResponsibility.total} days
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-sf-pro">No leave balance data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* On Leave Today Card */}
        <Card className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-900 font-sf-pro">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-mokm-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-mokm-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 font-sf-pro">{hrMetrics.onLeaveToday}</p>
                  <p className="text-sm text-slate-500 font-sf-pro">Employees</p>
                </div>
              </div>
              
              <div>
                {hrMetrics.onLeaveToday > 0 ? (
                  <Button variant="outline" size="sm" className="text-mokm-purple-600 border-mokm-purple-200 hover:bg-mokm-purple-50 font-sf-pro">
                    View Details
                  </Button>
                ) : (
                  <span className="text-sm text-slate-500 font-sf-pro">No one on leave today</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Next Public Holiday Card */}
        <NextPublicHolidayDisplay />
      </div>
      
      {/* Leave Requests Table */}
      <div className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900 font-sf-pro">Recent Leave Requests</h2>
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="bg-mokm-purple-600 hover:bg-mokm-purple-700 font-sf-pro"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                {filteredLeaveRequests.length > 0 ? (
                  filteredLeaveRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="p-4 border-b border-slate-200 last:border-b-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                            {getInitials(request.employeeName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{request.employeeName}</p>
                            <p className="text-xs text-slate-500">{request.employeePosition}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getLeaveTypeColor(request.leaveType)}`}>
                            {request.leaveType}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-600 font-sf-pro">
                          {format(parseISO(request.startDate), 'MMM dd')} - {format(parseISO(request.endDate), 'MMM dd, yyyy')}
                          <span className="text-xs text-slate-500 ml-2">({request.days} days)</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  onClick={() => setViewDetailsModal({ isOpen: true, leaveRequest: request })}
                                  variant="outline"
                                  size="sm"
                                  className="text-mokm-purple-600 border-slate-200 hover:border-mokm-purple-600 font-sf-pro"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 text-white text-xs">
                                View Details
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  onClick={() => handleDownload(request.attachmentUrl, request.attachmentName)}
                                  variant="outline"
                                  size="sm"
                                  className={`${request.attachmentUrl ? 'text-mokm-blue-600 border-slate-200 hover:border-mokm-blue-600' : 'text-slate-400 border-slate-200 cursor-not-allowed'} font-sf-pro`}
                                  disabled={!request.attachmentUrl}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 text-white text-xs">
                                {request.attachmentUrl ? 'Download Attachment' : 'No attachment available'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {request.attachmentUrl && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    onClick={() => handleViewAttachment(request.attachmentUrl, request.attachmentType)}
                                    variant="outline"
                                    size="sm"
                                    className="text-mokm-green-600 border-slate-200 hover:border-mokm-green-600 font-sf-pro"
                                  >
                                    {request.attachmentType?.startsWith('image/') ? (
                                      <Image className="h-4 w-4" />
                                    ) : request.attachmentType === 'application/pdf' ? (
                                      <File className="h-4 w-4" />
                                    ) : (
                                      <FileText className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-xs">
                                  {request.attachmentType?.startsWith('image/') ? 'View Image' : 'View Attachment'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 font-sf-pro">No leave requests found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Leave Events (7 Days) */}
      {upcomingLeaveEvents.length > 0 && (
        <div className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 font-sf-pro">Upcoming Leave (Next 7 Days)</h2>
          </div>
          
          <div className="space-y-3">
            {upcomingLeaveEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
                    {getInitials(event.employeeName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{event.employeeName}</p>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(event.startDate), 'MMM dd')} - {format(parseISO(event.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getLeaveTypeColor(event.leaveType)}`}>
                    {event.leaveType.charAt(0).toUpperCase() + event.leaveType.slice(1)}
                  </span>
                  <span className="text-xs text-slate-500 font-sf-pro">
                    {calculateLeaveWorkingDays(event.startDate, event.endDate)} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Leave Request Management */}
      <div id="leave-requests-section" className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-sm rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 font-sf-pro">Leave Requests</h2>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-mokm-purple-600 hover:bg-mokm-purple-700 font-sf-pro">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="Search by name or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl"
              prefix={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>
          
          <div className="w-[150px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-[180px]">
            <Select value={filterLeaveType} onValueChange={setFilterLeaveType}>
              <SelectTrigger className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leave Types</SelectItem>
                <SelectItem value="Annual">Annual Leave</SelectItem>
                <SelectItem value="Sick">Sick Leave</SelectItem>
                <SelectItem value="FamilyResponsibility">Family Responsibility</SelectItem>
                <SelectItem value="Maternity">Maternity Leave</SelectItem>
                <SelectItem value="Parental">Parental Leave</SelectItem>
                <SelectItem value="Bereavement">Bereavement Leave</SelectItem>
                <SelectItem value="Religious">Religious Leave</SelectItem>
                <SelectItem value="Study">Study Leave</SelectItem>
                <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Leave Requests Table */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer font-sf-pro"
                        onClick={() => handleSortChange('employeeName')}
                      >
                        Employee
                        {sortBy === 'employeeName' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer font-sf-pro"
                        onClick={() => handleSortChange('leaveType')}
                      >
                        Leave Type
                        {sortBy === 'leaveType' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer font-sf-pro"
                        onClick={() => handleSortChange('startDate')}
                      >
                        Period
                        {sortBy === 'startDate' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer font-sf-pro"
                        onClick={() => handleSortChange('status')}
                      >
                        Status
                        {sortBy === 'status' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer font-sf-pro"
                        onClick={() => handleSortChange('requestDate')}
                      >
                        Request Date
                        {sortBy === 'requestDate' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredLeaveRequests.length > 0 ? (
                      filteredLeaveRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center text-xs font-medium font-sf-pro">
                                {getInitials(request.employeeName)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-slate-900 font-sf-pro">{request.employeeName}</div>
                                <div className="text-xs text-slate-500 font-sf-pro">{request.employeePosition}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getLeaveTypeIcon(request.leaveType as LeaveTypes)}
                              <span className="ml-1.5 text-sm text-slate-900 font-sf-pro">{request.leaveType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-sf-pro">
                              {format(parseISO(request.startDate), 'MMM dd')} - {format(parseISO(request.endDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs text-slate-500 font-sf-pro">
                              {request.days} working days
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(request.status)} font-sf-pro`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-sf-pro">
                            {format(parseISO(request.requestDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      onClick={() => setViewDetailsModal({ isOpen: true, leaveRequest: request })}
                                      variant="outline"
                                      size="sm"
                                      className="text-mokm-purple-600 border-slate-200 hover:border-mokm-purple-600 font-sf-pro"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white text-xs">
                                    View Details
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-slate-200 font-sf-pro">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel className="font-sf-pro">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {request.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => handleApproveRequest(request.id)}
                                        className="text-green-600 font-sf-pro"
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          const reason = prompt('Please provide a reason for rejection:');
                                          if (reason) {
                                            handleRejectRequest(request.id, reason);
                                          }
                                        }}
                                        className="text-red-600 font-sf-pro"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  {(request.status === 'pending' || request.status === 'approved') && (
                                    <DropdownMenuItem 
                                      onClick={() => handleCancelRequest(request.id)}
                                      className="text-slate-600 font-sf-pro"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem 
                                    onClick={() => setUploadModalOpen({ 
                                      isOpen: true, 
                                      requestId: request.id,
                                      currentAttachment: request.attachmentUrl
                                    })}
                                    className="text-mokm-blue-600 font-sf-pro"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {request.attachmentUrl ? 'Replace Attachment' : 'Upload Attachment'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500 font-sf-pro">
                          No leave requests found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Leave Request Modal */}
      <NewLeaveRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleLeaveRequestSubmit}
        employees={employees}
      />
      
      {/* Upload Attachment Modal */}
      <Dialog open={uploadModalOpen.isOpen} onOpenChange={(open) => !open && setUploadModalOpen({ isOpen: false, requestId: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 font-sf-pro">
              {uploadModalOpen.currentAttachment ? 'Replace Attachment' : 'Upload Attachment'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-sf-pro">
              Upload supporting documents for your leave request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="attachment" className="text-sm font-medium text-slate-700 font-sf-pro">
                Select File
              </Label>
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl mt-1 cursor-pointer file:bg-mokm-purple-50 file:text-mokm-purple-600 file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 file:cursor-pointer font-sf-pro"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
              />
              <p className="text-xs text-slate-500 mt-1 font-sf-pro">
                Supported formats: PDF, JPG, JPEG, PNG, WEBP (max 5MB)
              </p>
              
              {fileValidationError && (
                <p className="text-xs text-red-500 mt-1 font-sf-pro">{fileValidationError}</p>
              )}
              
              {selectedFile && (
                <div className="mt-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {selectedFile.type.startsWith('image/') ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                          {previewUrl && (
                            <img 
                              src={previewUrl} 
                              alt="Preview thumbnail" 
                              className="h-full w-full object-cover" 
                            />
                          )}
                        </div>
                      ) : selectedFile.type === 'application/pdf' ? (
                        <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center">
                          <File className="h-5 w-5 text-red-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800 font-sf-pro">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 font-sf-pro">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Preview for image files */}
              {previewUrl && selectedFile.type.startsWith('image/') && (
                <div className="mt-3 border border-slate-200 rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[200px] object-contain bg-slate-100" 
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setUploadModalOpen({ isOpen: false, requestId: '' });
              }}
              className="font-sf-pro"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadSubmit}
              className="bg-mokm-purple-600 hover:bg-mokm-purple-700 font-sf-pro"
              disabled={!selectedFile || !!fileValidationError}
            >
              {uploadModalOpen.currentAttachment ? 'Replace' : 'Upload'} Document
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