import React, { useState, useEffect } from 'react';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Calendar,
  Trash2,
  School
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Employee } from '@/services/employeeService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Type for qualification
interface Qualification {
  id: string;
  employeeId: string;
  institute: string;
  startDate: string;
  endDate: string;
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
  
  // State for qualifications storage
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  
  // State for qualification form
  const [qualificationForm, setQualificationForm] = useState({
    institute: '',
    startDate: '',
    endDate: '',
    certificateFile: null as File | null,
  });
  
  // Handle status change
  const handleStatusChange = (employeeId: string, status: 'active' | 'on-leave' | 'terminated') => {
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
  };

  // Load qualifications from localStorage on component mount
  useEffect(() => {
    const storedQualifications = localStorage.getItem('employeeQualifications');
    if (storedQualifications) {
      setQualifications(JSON.parse(storedQualifications));
    }
    
    // Initialize status state based on employees
    const initialStatus = {} as { [key: string]: 'active' | 'terminated' };
    employees.forEach(emp => {
      initialStatus[emp.id] = emp.status;
    });
    setSelectedStatus(initialStatus);
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

  // Handle qualification form submission
  const handleAddQualification = () => {
    const { institute, startDate, endDate, certificateFile } = qualificationForm;
    
    if (!institute || !startDate || !endDate || !certificateFile) {
      // Handle validation
      alert('All fields are required');
      return;
    }
    
    // Convert file to base64 for localStorage storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const fileType = certificateFile.type.includes('pdf') ? 'pdf' : 'image';
      
      // Create new qualification
      const newQualification: Qualification = {
        id: `qual_${Date.now()}`,
        employeeId: currentEmployeeId,
        institute,
        startDate,
        endDate,
        certificateFile: base64String,
        certificateType: fileType as 'pdf' | 'image',
        dateAdded: new Date().toISOString()
      };
      
      // Update qualifications state
      const updatedQualifications = [...qualifications, newQualification];
      setQualifications(updatedQualifications);
      
      // Save to localStorage
      localStorage.setItem('employeeQualifications', JSON.stringify(updatedQualifications));
      
      // Close modal
      setIsAddQualificationOpen(false);
    };
    
    reader.readAsDataURL(certificateFile);
  };

  // Delete qualification
  const handleDeleteQualification = (qualificationId: string) => {
    // Filter out the qualification to be deleted
    const updatedQualifications = qualifications.filter(
      qual => qual.id !== qualificationId
    );
    
    // Update state
    setQualifications(updatedQualifications);
    
    // Save to localStorage
    localStorage.setItem('employeeQualifications', JSON.stringify(updatedQualifications));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  // Get employee name initials for avatar fallback
  const getInitials = (firstName: string, surname: string) => {
    return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
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
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-6 w-6 mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQualification(qual.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Employee Training & Qualifications</h2>
        
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
                      onValueChange={(value) => handleStatusChange(employee.id, value as 'active' | 'terminated')}
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
                    <CertificateGallery employeeId={employee.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Qualification Modal */}
      <Dialog open={isAddQualificationOpen} onOpenChange={setIsAddQualificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Qualification</DialogTitle>
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
