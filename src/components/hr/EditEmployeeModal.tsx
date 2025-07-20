import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, Save, User, CalendarDays, Briefcase, CreditCard, Clock, UserPlus, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { updateEmployee, Employee, EmployeeFormData } from '@/services/employeeService';
import { companyEmployeeSyncService } from '@/services/companyEmployeeSyncService';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdated?: (employee: Employee) => void;
}

const EditEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated }: EditEmployeeModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Helper function to check if this is the synced admin user
  const isSyncedAdminUser = (emp: Employee | null): boolean => {
    if (!emp) return false;
    return emp.email === 'admin@mokmzansibooks.com' || 
           (emp.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(emp.position));
  };
  
  const isAdminUser = isSyncedAdminUser(employee);
  const [formData, setFormData] = useState<EmployeeFormData>({
    // Basic Information
    firstName: '',
    surname: '',
    contactNumber: '',
    email: '',
    idType: 'ID Number',
    idValue: '',
    dateOfBirth: '',
    employmentType: 'Full Time',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentCycle: 'Monthly',
    salary: 0,
    taxPercentage: 15,
    department: 'General',
    position: '',
    location: 'Johannesburg',
    
    // Address fields
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: '',
    
    // Next of kin
    kinRelationship: '',
    kinName: '',
    kinSurname: '',
    kinContactNumber: '',
    
    // Bank details
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    branchCode: '',
    
    // Shifts
    dayShift: true,
    nightShift: false,
    flexibleShift: false,
  });

  // Populate form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        surname: employee.surname || '',
        contactNumber: employee.contactNumber || '',
        email: employee.email || '',
        idType: employee.idType || 'ID Number',
        idValue: employee.idValue || '',
        dateOfBirth: employee.dateOfBirth || '',
        employmentType: employee.employmentType || 'Full Time',
        startDate: employee.startDate || new Date().toISOString().split('T')[0],
        endDate: employee.endDate || '',
        paymentCycle: employee.paymentCycle || 'Monthly',
        salary: employee.salary || 0,
        taxPercentage: employee.taxPercentage || 15,
        department: employee.department || 'General',
        position: employee.position || '',
        location: employee.location || 'Johannesburg',
        
        // Address fields
        addressLine1: employee.addressLine1 || '',
        addressLine2: employee.addressLine2 || '',
        addressLine3: employee.addressLine3 || '',
        addressLine4: employee.addressLine4 || '',
        
        // Next of kin
        kinRelationship: employee.kinRelationship || '',
        kinName: employee.kinName || '',
        kinSurname: employee.kinSurname || '',
        kinContactNumber: employee.kinContactNumber || '',
        
        // Bank details
        bankName: employee.bankName || '',
        accountHolderName: employee.accountHolderName || '',
        accountNumber: employee.accountNumber || '',
        branchCode: employee.branchCode || '',
        
        // Shifts
        dayShift: employee.dayShift || false,
        nightShift: employee.nightShift || false,
        flexibleShift: employee.flexibleShift || false,
      });
      setSelectedImage(employee.avatar || null);
    }
  }, [employee]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) {
      toast.error('No employee selected for editing.');
      return;
    }
    
    // Validation
    if (!formData.firstName || !formData.surname || !formData.idValue) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    try {
      // Update employee with avatar if selected
      let dataToUpdate = {
        ...formData,
        avatar: selectedImage || undefined
      };
      
      // For synced admin users, preserve the original synced fields
      if (isAdminUser && employee) {
        dataToUpdate = {
          ...dataToUpdate,
          firstName: employee.firstName,
          surname: employee.surname,
          email: employee.email,
          contactNumber: employee.contactNumber,
          position: employee.position,
          addressLine1: employee.addressLine1,
          addressLine2: employee.addressLine2,
          addressLine3: employee.addressLine3,
          addressLine4: employee.addressLine4
        };
      }
      
      const updatedEmployee = updateEmployee(employee.id, dataToUpdate);
      
      if (updatedEmployee) {
        toast.success('Employee updated successfully!');
        
        // Check if this is the admin/owner employee and sync back to company details
        if (updatedEmployee.email === 'admin@mokmzansibooks.com' || 
            (updatedEmployee.position && ['CEO', 'Founder', 'Director', 'Manager'].includes(updatedEmployee.position))) {
          try {
            const syncResult = companyEmployeeSyncService.syncEmployeeToCompanyDetails(updatedEmployee);
            if (syncResult.success) {
              toast.info('Company details updated to match employee information.');
            }
          } catch (syncError) {
            console.warn('Could not sync employee changes to company details:', syncError);
          }
        }
        
        if (onEmployeeUpdated) {
          onEmployeeUpdated(updatedEmployee);
        }
        
        onClose();
      } else {
        toast.error('Failed to update employee.');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('An error occurred while updating the employee.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass backdrop-blur-sm bg-white/95 border border-white/20 shadow-business">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-slate-900 font-sf-pro">
            Edit Employee - {employee.firstName} {employee.surname}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-white/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass backdrop-blur-sm bg-white/50 border border-white/20">
              <TabsTrigger value="basic" className="flex items-center gap-2 font-sf-pro">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-2 font-sf-pro">
                <Briefcase className="h-4 w-4" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2 font-sf-pro">
                <CalendarDays className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center gap-2 font-sf-pro">
                <CreditCard className="h-4 w-4" />
                Banking
              </TabsTrigger>
              <TabsTrigger value="shifts" className="flex items-center gap-2 font-sf-pro">
                <Clock className="h-4 w-4" />
                Shifts
              </TabsTrigger>
            </TabsList>

            {/* Admin User Warning */}
            {isAdminUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 font-sf-pro">Company Owner/Admin Account</h4>
                    <p className="text-sm text-blue-700 font-sf-pro mt-1">
                      This employee record is synchronized with Company Details. 
                      To edit Name, Email, Phone, Position, or Address information, 
                      please update them in <strong>Company Page → Company Details</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-sf-pro flex items-center gap-2">
                    First Name *
                    {isAdminUser && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Synced from Company Details
                      </span>
                    )}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    readOnly={isAdminUser}
                    className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="surname" className="font-sf-pro flex items-center gap-2">
                    Surname *
                    {isAdminUser && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Synced from Company Details
                      </span>
                    )}
                  </Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    readOnly={isAdminUser}
                    className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-sf-pro flex items-center gap-2">
                    Email Address
                    {isAdminUser && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Synced from Company Details
                      </span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={isAdminUser}
                    className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="font-sf-pro flex items-center gap-2">
                    Contact Number
                    {isAdminUser && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Synced from Company Details
                      </span>
                    )}
                  </Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    readOnly={isAdminUser}
                    className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                  />
                </div>
              </div>

              {/* Profile Picture */}
              <div className="space-y-2">
                <Label className="font-sf-pro">Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  {selectedImage && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-sf-pro"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {selectedImage ? 'Change Picture' : 'Upload Picture'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="font-sf-pro flex items-center gap-2">
                    Position
                    {isAdminUser && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Synced from Company Details
                      </span>
                    )}
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    readOnly={isAdminUser}
                    className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department" className="font-sf-pro">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                    <SelectTrigger className="font-sf-pro">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="IT">Information Technology</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="font-sf-pro">Employment Type</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleSelectChange('employmentType', value)}>
                    <SelectTrigger className="font-sf-pro">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-sf-pro">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary" className="font-sf-pro">Monthly Salary (R)</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxPercentage" className="font-sf-pro">Tax Percentage (%)</Label>
                  <Input
                    id="taxPercentage"
                    name="taxPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxPercentage}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idType" className="font-sf-pro">ID Type</Label>
                  <Select value={formData.idType} onValueChange={(value) => handleSelectChange('idType', value)}>
                    <SelectTrigger className="font-sf-pro">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ID Number">ID Number</SelectItem>
                      <SelectItem value="Passport Number">Passport Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idValue" className="font-sf-pro">ID/Passport Number *</Label>
                  <Input
                    id="idValue"
                    name="idValue"
                    value={formData.idValue}
                    onChange={handleChange}
                    required
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="font-sf-pro">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-sf-pro">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 font-sf-pro">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1" className="font-sf-pro flex items-center gap-2">
                      Address Line 1
                      {isAdminUser && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Synced from Company Details
                        </span>
                      )}
                    </Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      readOnly={isAdminUser}
                      className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2" className="font-sf-pro flex items-center gap-2">
                      Address Line 2
                      {isAdminUser && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Synced from Company Details
                        </span>
                      )}
                    </Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      readOnly={isAdminUser}
                      className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine3" className="font-sf-pro flex items-center gap-2">
                      Address Line 3
                      {isAdminUser && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Synced from Company Details
                        </span>
                      )}
                    </Label>
                    <Input
                      id="addressLine3"
                      name="addressLine3"
                      value={formData.addressLine3}
                      onChange={handleChange}
                      readOnly={isAdminUser}
                      className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine4" className="font-sf-pro flex items-center gap-2">
                      Address Line 4
                      {isAdminUser && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Synced from Company Details
                        </span>
                      )}
                    </Label>
                    <Input
                      id="addressLine4"
                      name="addressLine4"
                      value={formData.addressLine4}
                      onChange={handleChange}
                      readOnly={isAdminUser}
                      className={`font-sf-pro ${isAdminUser ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      title={isAdminUser ? 'This field is synced from Company Details and cannot be edited here' : ''}
                    />
                  </div>
                </div>
              </div>

              {/* Next of Kin Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 font-sf-pro">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kinRelationship" className="font-sf-pro">Relationship</Label>
                    <Input
                      id="kinRelationship"
                      name="kinRelationship"
                      value={formData.kinRelationship}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="kinName" className="font-sf-pro">First Name</Label>
                    <Input
                      id="kinName"
                      name="kinName"
                      value={formData.kinName}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="kinSurname" className="font-sf-pro">Surname</Label>
                    <Input
                      id="kinSurname"
                      name="kinSurname"
                      value={formData.kinSurname}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="kinContactNumber" className="font-sf-pro">Contact Number</Label>
                    <Input
                      id="kinContactNumber"
                      name="kinContactNumber"
                      value={formData.kinContactNumber}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Banking Information Tab */}
            <TabsContent value="banking" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="font-sf-pro">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName" className="font-sf-pro">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="font-sf-pro">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branchCode" className="font-sf-pro">Branch Code</Label>
                  <Input
                    id="branchCode"
                    name="branchCode"
                    value={formData.branchCode}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Shifts Tab */}
            <TabsContent value="shifts" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label className="font-sf-pro">Shift Type</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div key="dayShift" className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="dayShift"
                      name="dayShift"
                      checked={formData.dayShift}
                      onChange={(e) => handleCheckboxChange('dayShift', e.target.checked)}
                      className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="dayShift" className="font-sf-pro">Day Shift</Label>
                  </div>
                  <div key="nightShift" className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="nightShift"
                      name="nightShift"
                      checked={formData.nightShift}
                      onChange={(e) => handleCheckboxChange('nightShift', e.target.checked)}
                      className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="nightShift" className="font-sf-pro">Night Shift</Label>
                  </div>
                  <div key="flexibleShift" className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="flexibleShift"
                      name="flexibleShift"
                      checked={formData.flexibleShift}
                      onChange={(e) => handleCheckboxChange('flexibleShift', e.target.checked)}
                      className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="flexibleShift" className="font-sf-pro">Flexible Shifts</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="font-sf-pro">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="font-sf-pro"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/20">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="font-sf-pro"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white font-sf-pro"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
