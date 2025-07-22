import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { 
  Calendar, 
  Upload, 
  FileText, 
  Clock, 
  AlertCircle, 
  Check, 
  X,
  CalendarDays,
  User,
  Briefcase,
  Palmtree,
  Stethoscope,
  Baby,
  Heart,
  Users,
  Book,
  BookOpen,
  AlertTriangle,
  Flower,
  Info,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/services/employeeService';
import { LeaveRequest, LeaveTypes, calculateBusinessDaysExcludingHolidays, formatDate } from './LeaveManagementTypes';

interface NewLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: LeaveRequest) => void;
  employees: Employee[];
}

const NewLeaveRequestModal: React.FC<NewLeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees
}) => {
  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaveType, setLeaveType] = useState<LeaveTypes | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [totalDays, setTotalDays] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form fields
      setSelectedEmployee(null);
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setAttachment(null);
      setTotalDays(0);
      setFormErrors({});
      
      // Simulate loading employees
      if (employees.length > 0) {
        setIsLoadingEmployees(true);
        // Simulate API call delay
        const timer = setTimeout(() => {
          setIsLoadingEmployees(false);
        }, 800);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, employees.length]);
  
  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Ensure end date is not before start date
      if (end < start) {
        setFormErrors({
          ...formErrors, 
          endDate: 'End date cannot be before start date'
        });
        setTotalDays(0);
        return;
      } else {
        // Clear any previous end date error
        const { endDate: _, ...restErrors } = formErrors;
        setFormErrors(restErrors);
      }
      
      // Calculate business days excluding holidays
      const days = calculateBusinessDaysExcludingHolidays(start, end);
      setTotalDays(days);
    }
  }, [startDate, endDate, formErrors]);
  
  // getLeaveTypeIcon function is defined below
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file type (allow only images and PDFs)
      const fileType = file.type;
      if (!fileType.match('image.*') && !fileType.match('application/pdf')) {
        toast.error('Only image and PDF files are allowed');
        return;
      }
      
      // Check file size (max 5MB)
      const fileSize = file.size / 1024 / 1024; // in MB
      if (fileSize > 5) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      
      setAttachment(file);
    }
  };
  
  // Remove the uploaded attachment
  const handleRemoveAttachment = () => {
    setAttachment(null);
    // Reset the file input
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Handle form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedEmployee) {
      errors.employee = 'Please select an employee';
    }
    
    if (!leaveType) {
      errors.leaveType = 'Please select a leave type';
    }
    
    if (!startDate) {
      errors.startDate = 'Please select a start date';
    } else {
      const selectedStartDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedStartDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    
    if (!endDate) {
      errors.endDate = 'Please select an end date';
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        errors.endDate = 'End date cannot be before start date';
      }
      
      // Check if the leave period is reasonable (e.g., not too long)
      const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (daysDifference > 90) {
        errors.endDate = 'Leave period exceeds 90 days. For extended leave, please submit multiple requests or contact HR.';
      }
    }
    
    if (!reason.trim()) {
      errors.reason = 'Please provide a reason for the leave';
    } else if (reason.trim().length < 5) {
      errors.reason = 'Please provide a more detailed reason for the leave';
    }
    
    // Check if required attachments are missing based on leave type
    if (leaveType === LeaveTypes.Sick && !attachment) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (daysDifference > 2) {
        errors.attachment = 'Medical certificate is required for sick leave exceeding 2 days';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [leaveRequestToSubmit, setLeaveRequestToSubmit] = useState<LeaveRequest | null>(null);

  // Prepare form submission
  const prepareSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      let attachmentUrl = '';
      let attachmentName = '';
      
      // In a real app, you'd upload the file to a server and get a URL back
      // For our localStorage implementation, we'll convert the file to a data URL
      if (attachment) {
        attachmentName = attachment.name;
        attachmentUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(attachment);
        });
      }
      
      if (!selectedEmployee) {
        toast.error('Please select an employee');
        return;
      }
      
      // Create the leave request object
      const newLeaveRequest: LeaveRequest = {
        id: uuidv4(),
        employeeId: selectedEmployee.id,
        employeeName: `${selectedEmployee.firstName} ${selectedEmployee.surname}`,
        employeeNumber: selectedEmployee.employeeNumber,
        employeePosition: selectedEmployee.position,
        leaveType: leaveType as LeaveTypes,
        startDate,
        endDate,
        days: totalDays,
        calendarDays: Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        reason,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
        attachmentUrl,
        attachmentName
      };
      
      // Store the request and show confirmation dialog
      setLeaveRequestToSubmit(newLeaveRequest);
      setShowConfirmation(true);
      
    } catch (error) {
      console.error('Error preparing leave request:', error);
      toast.error('An error occurred while preparing your request');
    }
  };
  
  // Handle actual form submission after confirmation
  const handleSubmit = async () => {
    if (!leaveRequestToSubmit) return;
    
    setIsSubmitting(true);
    setShowConfirmation(false);
    
    try {
      // Call the onSubmit prop with the new request
      onSubmit(leaveRequestToSubmit);
      
      // Show success message
      toast.success('Leave request submitted successfully');
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setLeaveRequestToSubmit(null);
  };
  
  // Function to get the leave type icon
  const getLeaveTypeIcon = (leaveType: LeaveTypes, className: string = "h-4 w-4") => {
    switch (leaveType) {
      case LeaveTypes.Annual:
        return <Palmtree className={`${className} text-blue-600`} />;
      case LeaveTypes.Sick:
        return <Stethoscope className={`${className} text-red-600`} />;
      case LeaveTypes.FamilyResponsibility:
        return <Users className={`${className} text-green-600`} />;
      case LeaveTypes.Maternity:
        return <Baby className={`${className} text-pink-600`} />;
      case LeaveTypes.Parental:
        return <Heart className={`${className} text-purple-600`} />;
      case LeaveTypes.Bereavement:
        return <Flower className={`${className} text-slate-600`} />;
      case LeaveTypes.Religious:
        return <Book className={`${className} text-yellow-600`} />;
      case LeaveTypes.Study:
        return <BookOpen className={`${className} text-orange-600`} />;
      case LeaveTypes.Unpaid:
        return <AlertCircle className={`${className} text-gray-600`} />;
      default:
        return <CalendarDays className={`${className} text-slate-600`} />;
    }
  };
  
  // Function to get the required document description based on leave type
  const getAttachmentHint = (type: LeaveTypes | '') => {
    switch (type) {
      case LeaveTypes.Sick:
        return "Please attach a medical certificate for sick leave exceeding 2 days";
      case LeaveTypes.Maternity:
        return "Please attach a medical certificate stating expected date of delivery";
      case LeaveTypes.Bereavement:
        return "Proof of relationship and/or death certificate may be required";
      case LeaveTypes.Religious:
        return "Optional: documentation of religious observance";
      case LeaveTypes.Study:
        return "Please attach proof of examination dates or course enrollment";
      case LeaveTypes.Jury:
        return "Please attach your jury duty summons";
      default:
        return "Optional: You may attach any relevant documentation";
    }
  };
  
  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>  
      <DialogContent className="sm:max-w-[500px] glass backdrop-blur-sm bg-white/90 border border-white/20 shadow-business rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-sf-pro">New Leave Request</DialogTitle>
          <DialogDescription className="text-slate-600 font-sf-pro">
            Create a new leave request for an employee
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-sm font-medium text-slate-700">
              Employee <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={selectedEmployee?.id || ''}
              onValueChange={(value) => {
                const employee = employees.find(emp => emp.id === value);
                setSelectedEmployee(employee || null);
                
                // Clear error when value is selected
                if (value) {
                  const { employee: _, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              disabled={isLoadingEmployees}
            >
              <SelectTrigger className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl">
                <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Select an employee"} />
              </SelectTrigger>
              <SelectContent className="glass backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl">
                <SelectGroup>
                  <SelectLabel>Employees</SelectLabel>
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-mokm-blue-500 border-t-transparent"></div>
                      <span className="ml-2 text-sm text-slate-600">Loading...</span>
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-slate-600">No employees found</div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.surname}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formErrors.employee && (
              <p className="text-sm text-red-500">{formErrors.employee}</p>
            )}
          </div>
          
          {/* Employee Number (auto-filled) */}
          {selectedEmployee && (
            <div className="space-y-2">
              <Label htmlFor="employeeNumber" className="text-sm font-medium text-slate-700">
                Employee Number
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="employeeNumber"
                  value={selectedEmployee.employeeNumber}
                  readOnly
                  className="pl-10 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl"
                />
              </div>
            </div>
          )}
          
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType" className="text-sm font-medium text-slate-700">
              Leave Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={leaveType}
              onValueChange={(value) => {
                setLeaveType(value as LeaveTypes);
                
                // Clear error when value is selected
                if (value) {
                  const { leaveType: _, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
            >
              <SelectTrigger className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent className="glass backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl max-h-[300px]">
                <SelectGroup>
                  <SelectLabel>Leave Types</SelectLabel>
                  <SelectItem value={LeaveTypes.Annual}>
                    <div className="flex items-center">
                      <Palmtree className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Annual Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Sick}>
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-red-600" />
                      <span>Sick Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.FamilyResponsibility}>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      <span>Family Responsibility</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Maternity}>
                    <div className="flex items-center">
                      <Baby className="h-4 w-4 mr-2 text-pink-600" />
                      <span>Maternity Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Parental}>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Parental Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Bereavement}>
                    <div className="flex items-center">
                      <Flower className="h-4 w-4 mr-2 text-slate-600" />
                      <span>Bereavement Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Religious}>
                    <div className="flex items-center">
                      <Book className="h-4 w-4 mr-2 text-yellow-600" />
                      <span>Religious Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Study}>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-orange-600" />
                      <span>Study Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Unpaid}>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-gray-600" />
                      <span>Unpaid Leave</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Jury}>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>Jury Duty</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={LeaveTypes.Compensatory}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>Compensatory Leave</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {formErrors.leaveType && (
              <p className="text-sm text-red-500">{formErrors.leaveType}</p>
            )}
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    
                    // Clear error when value is selected
                    if (e.target.value) {
                      const { startDate: _, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]} // Cannot be in the past
                  className="pl-10 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl"
                />
              </div>
              {formErrors.startDate && (
                <p className="text-sm text-red-500">{formErrors.startDate}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                End Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    
                    // Clear error when value is selected
                    if (e.target.value) {
                      const { endDate: _, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  min={startDate || new Date().toISOString().split('T')[0]} // Cannot be before start date
                  className="pl-10 glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl"
                />
              </div>
              {formErrors.endDate && (
                <p className="text-sm text-red-500">{formErrors.endDate}</p>
              )}
            </div>
          </div>
          
          {/* Total Days (auto-calculated) */}
          {startDate && endDate && totalDays > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start">
              <CalendarDays className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {totalDays} working day{totalDays !== 1 ? 's' : ''} 
                  <span className="text-blue-600 ml-1">
                    (excluding weekends and public holidays)
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {format(new Date(startDate), 'EEEE, MMMM d, yyyy')} to {format(new Date(endDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
          
          {/* Reason for Leave */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-slate-700">
              Reason for Leave <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                
                // Clear error when value is entered
                if (e.target.value.trim()) {
                  const { reason: _, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Please provide details about your leave request"
              className="glass backdrop-blur-sm bg-white/50 border border-white/20 rounded-xl min-h-24"
            />
            {formErrors.reason && (
              <p className="text-sm text-red-500">{formErrors.reason}</p>
            )}
          </div>
          
          {/* Attachment Upload */}
          <div className="space-y-2">
            <Label htmlFor="attachment" className="text-sm font-medium text-slate-700">
              Leave Letter / Attachment 
              {leaveType === LeaveTypes.Sick && startDate && endDate && 
               calculateBusinessDaysExcludingHolidays(new Date(startDate), new Date(endDate)) > 2 ? 
                <span className="text-red-500">*</span> : 
                <span className="text-slate-500">(Optional)</span>
              }
            </Label>
            {!attachment ? (
              <div className="relative">
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className={`glass backdrop-blur-sm bg-white/50 border ${formErrors.attachment ? 'border-red-300' : 'border-white/20'} rounded-xl cursor-pointer file:bg-blue-50 file:text-blue-600 file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 file:cursor-pointer`}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supported formats: PDF, JPG, JPEG, PNG, WEBP (max 5MB)
                </p>
              </div>
            ) : (
              <div className="p-3 bg-white/50 border border-white/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {attachment.type.includes('image') ? (
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img 
                          src={URL.createObjectURL(attachment)} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{attachment.name}</p>
                      <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAttachment}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
            {formErrors.attachment && (
              <p className="text-sm text-red-500">{formErrors.attachment}</p>
            )}
            {leaveType && (
              <p className={`text-xs ${leaveType === LeaveTypes.Sick ? 'text-amber-600 font-medium' : 'text-slate-600'} flex items-center`}>
                <Info className={`h-3.5 w-3.5 mr-1 ${leaveType === LeaveTypes.Sick ? 'text-amber-500' : 'text-slate-400'}`} />
                {getAttachmentHint(leaveType as LeaveTypes)}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border border-white/20 hover:bg-white/10"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={prepareSubmit}
            className="w-full sm:w-auto bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
        

      </DialogContent>
    </Dialog>
    
    {/* Separate Confirmation Dialog */}
    <Dialog open={showConfirmation} onOpenChange={cancelConfirmation}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Leave Request</DialogTitle>
          <DialogDescription>
            Please review your leave request details:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium">Employee:</span>
            <span>{selectedEmployee?.firstName} {selectedEmployee?.surname}</span>
            
            <span className="font-medium">Leave Type:</span>
            <span className="flex items-center">
              {getLeaveTypeIcon(leaveType as LeaveTypes, "h-4 w-4 mr-1")}
              {leaveType}
            </span>
            
            <span className="font-medium">Period:</span>
            <span>{formatDate(new Date(startDate))} to {formatDate(new Date(endDate))}</span>
            
            <span className="font-medium">Working Days:</span>
            <span>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={cancelConfirmation}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 text-white"
          >
            <Check className="mr-2 h-4 w-4" />
            Confirm Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default NewLeaveRequestModal;
