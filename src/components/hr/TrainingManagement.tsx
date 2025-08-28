import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Calendar,
  Trash2,
  School,
  Loader2
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

import { Employee } from '@/services/employeeService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { logQualificationAdded, logQualificationDeleted } from '@/services/hrAuditService';

// Type for qualification
interface Qualification {
  id: string;
  employeeId: string;
  institute: string;
  startDate: string;
  endDate: string;
  // South African National Qualifications Framework level (1-10)
  nqfLevel: number;
  certificateFile: string;
  certificateType: 'pdf' | 'image';
  dateAdded: string;
}

// Props for TrainingManagement component
interface TrainingManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const TrainingManagement: React.FC<TrainingManagementProps> = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [isAddQualificationOpen, setIsAddQualificationOpen] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: 'active' | 'on-leave' | 'terminated' }>({});
  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewQualification, setPreviewQualification] = useState<Qualification | null>(null);
  
  // State for qualifications storage
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  
  // State for qualification form
  const [qualificationForm, setQualificationForm] = useState({
    institute: '',
    startDate: '',
    endDate: '',
    nqfLevel: '',
    certificateFile: null as File | null,
  });
  
  // Handle status change with audit logging
  const handleStatusChange = useCallback(async (employeeId: string, status: 'active' | 'on-leave' | 'terminated') => {
    try {
      if (!employeeId) {
        throw new Error('Invalid employee ID');
      }

      // Get the employee being updated
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const previousStatus = employee.status;
      
      // Update status in local state
      setSelectedStatus(prev => ({
        ...prev,
        [employeeId]: status
      }));
      
      // Update status in employees array
      const updatedEmployees = employees.map(emp => 
        emp.id === employeeId ? { ...emp, status } : emp
      );
      setEmployees(updatedEmployees);
      
      // Save to localStorage
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));

      // Log the status change to audit log
      try {
        await auditService.logAudit({
          action: 'UPDATE_EMPLOYEE_STATUS',
          category: 'hr',
          targetId: employeeId,
          targetType: 'employee',
          userId: user?.id || 'system',
          userEmail: user?.email || 'system',
          metadata: {
            employeeId,
            previousStatus,
            newStatus: status,
            employeeName: `${employee.firstName} ${employee.surname}`.trim(),
            timestamp: new Date().toISOString()
          },
          severity: 'info'
        });
      } catch (auditError) {
        console.error('Failed to log audit:', auditError);
        // Don't fail the operation if audit logging fails
      }

      toast({
        title: 'Status Updated',
        description: `Employee status updated to ${status}`,
      });
    } catch (err) {
      console.error('Error updating employee status:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update employee status',
        variant: 'destructive',
      });
    }
  }, [employees, setEmployees, user]);

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load qualifications from localStorage on component mount
  useEffect(() => {
    const loadQualifications = async () => {
      try {
        setIsLoading(true);
        const storedQualifications = localStorage.getItem('employeeQualifications');
        if (storedQualifications) {
          const parsed = JSON.parse(storedQualifications);
          // Validate and sanitize the data
          const validQualifications = parsed.filter((q: any) => 
            q && q.id && q.employeeId && q.institute && q.startDate && q.endDate
          );
          setQualifications(validQualifications);
          
          // If we filtered out invalid entries, update localStorage
          if (validQualifications.length !== parsed.length) {
            localStorage.setItem('employeeQualifications', JSON.stringify(validQualifications));
            console.warn('Removed invalid qualification entries from storage');
          }
        }
        
        // Initialize status state based on employees
        const initialStatus = {} as { [key: string]: 'active' | 'on-leave' | 'terminated' };
        employees.forEach(emp => {
          if (emp && emp.id) {
            initialStatus[emp.id] = emp.status || 'active';
          }
        });
        setSelectedStatus(initialStatus);
      } catch (err) {
        console.error('Error loading qualifications:', err);
        setError('Failed to load training data. Please refresh the page.');
        toast({
          title: 'Error',
          description: 'Failed to load training data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQualifications();
  }, [employees]);

  // Filter employees based on search term
  useEffect(() => {
    const filtered = employees.filter(employee => 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  // Function to get qualifications for a specific employee
  const getEmployeeQualifications = (employeeId: string) => {
    return qualifications.filter(qual => qual.employeeId === employeeId);
  };

  // Open add qualification modal for specific employee
  const openAddQualification = (employeeId: string) => {
    setCurrentEmployeeId(employeeId);
    setQualificationForm({
      institute: '',
      startDate: '',
      endDate: '',
      nqfLevel: '',
      certificateFile: null
    });
    setIsAddQualificationOpen(true);
  };

  // Handle qualification form input changes
  const handleQualificationFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, files } = e.target;
    
    if (name === 'certificateFile' && files && files.length > 0) {
      setQualificationForm(prev => ({
        ...prev,
        certificateFile: files[0]
      }));
    } else {
      setQualificationForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle qualification form submission with validation and audit logging
  const handleAddQualification = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { institute, startDate, endDate, nqfLevel, certificateFile } = qualificationForm;
      
      // Validate required fields
      if (!institute?.trim() || !startDate || !endDate || !certificateFile) {
        throw new Error('All fields are required');
      }

      // Validate date format and range
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isValid(start) || !isValid(end)) {
        throw new Error('Invalid date format');
      }
      
      if (end < start) {
        throw new Error('End date cannot be before start date');
      }

      // Validate NQF level (1-10)
      const parsedNqf = parseInt(String(nqfLevel), 10);
      if (isNaN(parsedNqf) || parsedNqf < 1 || parsedNqf > 10) {
        throw new Error('Please provide a valid NQF Level between 1 and 10');
      }

      // Enforce file type restrictions (PDF and images only)
      const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const allowedExt = ['.pdf', '.jpg', '.jpeg', '.png'];
      const fileTypeOk = certificateFile.type && allowedMime.includes(certificateFile.type);
      const nameLower = certificateFile.name?.toLowerCase?.() || '';
      const extOk = allowedExt.some(ext => nameLower.endsWith(ext));
      
      if (!fileTypeOk && !extOk) {
        throw new Error('Invalid file type. Please upload PDF, JPG, JPEG, or PNG.');
      }
      
      // Get employee details for audit log
      const employee = employees.find(emp => emp.id === currentEmployeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      // Convert file to base64 for localStorage storage
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(certificateFile);
      });
      
      const fileType = certificateFile.type?.includes('pdf') ? 'pdf' : 'image';
      
      // Create new qualification
      const newQualification: Qualification = {
        id: `qual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId: currentEmployeeId,
        institute: institute.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        nqfLevel: parsedNqf,
        certificateFile: base64String,
        certificateType: fileType,
        dateAdded: new Date().toISOString()
      };
      
      // Update qualifications state
      const updatedQualifications = [...qualifications, newQualification];
      setQualifications(updatedQualifications);
      
      // Save to localStorage
      localStorage.setItem('employeeQualifications', JSON.stringify(updatedQualifications));
      
      // Log the action to audit log
      try {
        await auditService.logAudit({
          action: 'ADD_QUALIFICATION',
          category: 'hr',
          targetId: newQualification.id,
          targetType: 'qualification',
          userId: user?.id || 'system',
          userEmail: user?.email || 'system',
          metadata: {
            employeeId: currentEmployeeId,
            employeeName: `${employee.firstName} ${employee.surname}`.trim(),
            institute: newQualification.institute,
            nqfLevel: newQualification.nqfLevel,
            startDate: newQualification.startDate,
            endDate: newQualification.endDate,
            timestamp: newQualification.dateAdded
          },
          severity: 'info'
        });
      } catch (auditError) {
        console.error('Failed to log audit:', auditError);
        // Don't fail the operation if audit logging fails
      }
      
      // Show success message
      toast({
        title: 'Qualification Added',
        description: `${employee.firstName}'s qualification has been added successfully`,
      });
      
      // Close modal and reset form
      setIsAddQualificationOpen(false);
      setQualificationForm({
        institute: '',
        startDate: '',
        endDate: '',
        nqfLevel: '',
        certificateFile: null
      });

      // Notify other modules (e.g., Performance) to refresh
      window.dispatchEvent(new Event('employeeQualificationsUpdated'));
    } catch (err) {
      console.error('Error adding qualification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add qualification';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete qualification with confirmation and audit logging
  const handleDeleteQualification = async (qualificationId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this qualification? This action cannot be undone.')) {
        return;
      }
      
      setIsLoading(true);
      
      // Find the qualification to be deleted for audit logging
      const qualificationToDelete = qualifications.find(q => q.id === qualificationId);
      if (!qualificationToDelete) {
        throw new Error('Qualification not found');
      }
      
      // Find the employee for audit logging
      const employee = employees.find(emp => emp.id === qualificationToDelete.employeeId);
      
      // Filter out the qualification to be deleted
      const updatedQualifications = qualifications.filter(
        qual => qual.id !== qualificationId
      );
      
      // Update state
      setQualifications(updatedQualifications);
      
      // Save to localStorage
      localStorage.setItem('employeeQualifications', JSON.stringify(updatedQualifications));
      
      // Log the deletion to audit log
      try {
        await auditService.logAudit({
          action: 'DELETE_QUALIFICATION',
          category: 'hr',
          targetId: qualificationId,
          targetType: 'qualification',
          userId: user?.id || 'system',
          userEmail: user?.email || 'system',
          metadata: {
            employeeId: qualificationToDelete.employeeId,
            employeeName: employee ? `${employee.firstName} ${employee.surname}`.trim() : 'Unknown',
            institute: qualificationToDelete.institute,
            nqfLevel: qualificationToDelete.nqfLevel,
            startDate: qualificationToDelete.startDate,
            endDate: qualificationToDelete.endDate,
            timestamp: new Date().toISOString()
          },
          severity: 'warning'
        });
      } catch (auditError) {
        console.error('Failed to log audit:', auditError);
        // Don't fail the operation if audit logging fails
      }
      
      // Show success message
      toast({
        title: 'Qualification Deleted',
        description: 'The qualification has been removed successfully',
      });
      
      // Close preview if open
      if (previewQualification?.id === qualificationId) {
        setIsPreviewOpen(false);
      }

      // Notify other modules (e.g., Performance) to refresh
      window.dispatchEvent(new Event('employeeQualificationsUpdated'));
    } catch (err) {
      console.error('Error deleting qualification:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete qualification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display with better error handling
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'dd MMM yyyy') : 'Invalid date';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Get employee name initials for avatar fallback with null checks
  const getInitials = (firstName?: string, surname?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = surname?.charAt(0) || first || '?';
    return `${first}${last}`.toUpperCase();
  };

  // Certificate thumbnail component with horizontal scrolling
  const CertificateGallery = ({ employeeId }: { employeeId: string }) => {
    const empQualifications = getEmployeeQualifications(employeeId);
    const [scrollPosition, setScrollPosition] = useState(0);
    
    // Calculate if scroll buttons should be shown
    const shouldShowScrollButtons = empQualifications.length > 4;
    
    // Scroll functions
    const scrollLeft = () => {
      const container = document.getElementById(`certificate-container-${employeeId}`);
      if (container) {
        container.scrollBy({ left: -160, behavior: 'smooth' });
        setScrollPosition(Math.max(0, scrollPosition - 1));
      }
    };
    
    const scrollRight = () => {
      const container = document.getElementById(`certificate-container-${employeeId}`);
      if (container) {
        container.scrollBy({ left: 160, behavior: 'smooth' });
        setScrollPosition(scrollPosition + 1);
      }
    };
    
    if (empQualifications.length === 0) {
      return <div className="text-slate-500 italic text-sm">No qualifications added</div>;
    }
    
    return (
      <div className="relative mt-2">
        {shouldShowScrollButtons && scrollPosition > 0 && (
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        
        <div 
          id={`certificate-container-${employeeId}`}
          className="flex gap-2 overflow-x-auto py-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {empQualifications.map(qual => (
            <div 
              key={qual.id} 
              className="relative flex-shrink-0 w-[40mm] h-[40mm] rounded-md overflow-hidden border border-slate-200 group"
              onClick={() => {
                setPreviewQualification(qual);
                setIsPreviewOpen(true);
              }}
            >
              {qual.certificateType === 'pdf' ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
              ) : (
                <div className="w-full h-full bg-slate-100">
                  <img 
                    src={qual.certificateFile} 
                    alt={`${qual.institute} certificate`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-xs font-medium text-center px-2">
                  {qual.institute}
                </p>
                <p className="text-white text-xs">
                  {formatDate(qual.startDate)} - {formatDate(qual.endDate)}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-6 w-6 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQualification(qual.id);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete qualification</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
        
        {shouldShowScrollButtons && scrollPosition < empQualifications.length - 4 && (
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-mokm-purple-500" />
        <span className="ml-2">Loading training data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h3 className="font-medium">Error Loading Training Data</h3>
        <p className="text-sm mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Preview Qualification Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Qualification Preview</DialogTitle>
            <DialogDescription>View the uploaded qualification. Click Open in new tab to download or view full-screen.</DialogDescription>
          </DialogHeader>
          <div className="w-full max-h-[75vh] overflow-auto">
            {previewQualification && (
              previewQualification.certificateType === 'pdf' ? (
                // Embed PDF data URL
                <iframe
                  title="qualification-pdf"
                  src={previewQualification.certificateFile}
                  className="w-full h-[70vh] rounded-md border"
                />
              ) : (
                <img
                  src={previewQualification?.certificateFile}
                  alt={`${previewQualification?.institute} certificate`}
                  className="max-h-[70vh] w-auto mx-auto rounded-md border"
                />
              )
            )}
          </div>
          <DialogFooter>
            {previewQualification && (
              <a
                href={previewQualification.certificateFile}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-auto text-sm text-slate-600 hover:underline"
              >
                Open in new tab
              </a>
            )}
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Employee Training & Qualifications</h2>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Employees List */}
      <div className="grid gap-4">
        {filteredEmployees.length === 0 ? (
          <Card className="border border-dashed border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <School className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-1">No employees found</h3>
              <p className="text-slate-500">Try adjusting your search</p>
            </CardContent>
          </Card>
        ) : (
          filteredEmployees.map(employee => (
            <Card key={employee.id} className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
                  {/* Employee Info - Takes 2 columns */}
                  <div className="md:col-span-2 flex gap-3">
                    <Avatar className="h-12 w-12">
                      {employee.avatar ? (
                        <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.surname}`} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-mokm-blue-500 to-mokm-purple-500 text-white">
                          {getInitials(employee.firstName, employee.surname)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {employee.firstName} {employee.surname}
                      </h3>
                      <div className="text-sm text-slate-500 mb-1">
                        {employee.employeeNumber}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          Started: {formatDate(employee.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status - Takes 1 column */}
                  <div className="md:col-span-1 flex flex-col justify-center">
                    <label className="text-xs text-slate-500 mb-1">Status</label>
                    <Select 
                      value={selectedStatus[employee.id] || employee.status} 
                      onValueChange={(value) => handleStatusChange(employee.id, value as 'active' | 'on-leave' | 'terminated')}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="on-leave">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Leave</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="terminated">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Terminated</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Add Qualification Button - Takes 1 column */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => openAddQualification(employee.id)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Qualification</span>
                    </Button>
                  </div>
                  
                  {/* Certificates Gallery - Takes 2 columns */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 mb-1 block">Qualifications</label>
                    <div className="min-h-[120px] flex flex-col justify-end">
                      <CertificateGallery employeeId={employee.id} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Qualification Modal */}
      <Dialog open={isAddQualificationOpen} onOpenChange={(open) => {
        if (!open) {
          // Reset form when closing
          setQualificationForm({
            institute: '',
            startDate: '',
            endDate: '',
            nqfLevel: '',
            certificateFile: null
          });
          setError(null);
        }
        setIsAddQualificationOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Qualification</DialogTitle>
            <DialogDescription>Upload a PDF or image and provide institution and date details.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="institute">Institution Name</Label>
              <Input
                id="institute"
                name="institute"
                placeholder="e.g. University of Cape Town"
                value={qualificationForm.institute}
                onChange={handleQualificationFormChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={qualificationForm.startDate}
                  onChange={handleQualificationFormChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={qualificationForm.endDate}
                  onChange={handleQualificationFormChange}
                />
              </div>
            </div>

            {/* NQF Level */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nqfLevel">NQF Level</Label>
                <span className="text-xs text-slate-500">1–10</span>
              </div>
              <Input
                id="nqfLevel"
                name="nqfLevel"
                type="number"
                min={1}
                max={10}
                step={1}
                placeholder="e.g. 7"
                value={qualificationForm.nqfLevel}
                onChange={handleQualificationFormChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="certificateFile">Upload Certificate</Label>
              <div className="flex items-center">
                <Input
                  id="certificateFile"
                  name="certificateFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full"
                  onChange={handleQualificationFormChange}
                />
              </div>
              <p className="text-xs text-slate-500">
                Accepted formats: PDF, JPG, JPEG, PNG
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddQualificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddQualification}>Add Qualification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingManagement;
