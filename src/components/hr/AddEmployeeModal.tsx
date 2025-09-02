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
import { addEmployee, EmployeeFormData, Employee } from '@/services/employeeService';
import AuthVerificationModal from '@/components/company/AuthVerificationModal';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded?: (employee: Employee) => void;
}

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }: AddEmployeeModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<EmployeeFormData & { avatar?: string } | null>(null);

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
    
    // Validation
    if (!formData.firstName || !formData.surname || !formData.idValue) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    // Defer actual save until admin verification succeeds
    setPendingData({
      ...formData,
      avatar: selectedImage || undefined
    });
    setIsAuthModalOpen(true);
  };

  const handleVerifiedSave = () => {
    if (!pendingData) return;
    try {
      const newEmployee = addEmployee(pendingData);
      toast.success('Employee added successfully!');
      if (onEmployeeAdded) {
        onEmployeeAdded(newEmployee);
      }
      setPendingData(null);
      setIsAuthModalOpen(false);
      onClose();
    } catch (error) {
      toast.error('Error adding employee. Please try again.');
      console.error('Error adding employee:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-sf-pro">Add New Employee</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="personal" className="font-sf-pro">
                  <User className="w-4 h-4 mr-2" />
                  Personal Details
                </TabsTrigger>
                <TabsTrigger value="employment" className="font-sf-pro">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Employment
                </TabsTrigger>
                <TabsTrigger value="address" className="font-sf-pro">
                  <Building2 className="w-4 h-4 mr-2" />
                  Address
                </TabsTrigger>
                <TabsTrigger value="kin" className="font-sf-pro">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Next of Kin
                </TabsTrigger>
                <TabsTrigger value="banking" className="font-sf-pro">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Banking Details
                </TabsTrigger>
              </TabsList>
              
              {/* Personal Details Tab */}
              <TabsContent value="personal" className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer relative overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedImage ? (
                        <img src={selectedImage} alt="Employee" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                        Upload Photo
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-sf-pro">First Name(s) *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="font-sf-pro"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surname" className="font-sf-pro">Surname *</Label>
                        <Input
                          id="surname"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                          className="font-sf-pro"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="font-sf-pro">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          placeholder="+27 71 234 5678"
                          className="font-sf-pro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-sf-pro">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="font-sf-pro"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sf-pro">ID Type *</Label>
                    <Select
                      value={formData.idType}
                      onValueChange={(value) => handleSelectChange('idType', value)}
                    >
                      <SelectTrigger className="font-sf-pro">
                        <SelectValue placeholder="Select ID Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ID Number">ID Number</SelectItem>
                        <SelectItem value="Passport Number">Passport Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idValue" className="font-sf-pro">{formData.idType} *</Label>
                    <Input
                      id="idValue"
                      name="idValue"
                      value={formData.idValue}
                      onChange={handleChange}
                      className="font-sf-pro"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="font-sf-pro">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="font-sf-pro"
                    required
                  />
                </div>
              </TabsContent>
              
              {/* Employment Tab */}
              <TabsContent value="employment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-sf-pro">Employment Type *</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) => handleSelectChange('employmentType', value as 'Full Time' | 'Part Time')}
                    >
                      <SelectTrigger className="font-sf-pro">
                        <SelectValue placeholder="Select Employment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sf-pro">Payment Cycle *</Label>
                    <Select
                      value={formData.paymentCycle}
                      onValueChange={(value) => handleSelectChange('paymentCycle', value as 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly')}
                    >
                      <SelectTrigger className="font-sf-pro">
                        <SelectValue placeholder="Select Payment Cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="font-sf-pro">Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="font-sf-pro"
                      required
                    />
                  </div>
                  {formData.employmentType === 'Part Time' && (
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="font-sf-pro">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate || ''}
                        onChange={handleChange}
                        className="font-sf-pro"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="font-sf-pro">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="font-sf-pro">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="font-sf-pro">Salary (ZAR)</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="text"
                      inputMode="decimal"
                      value={formData.salary.toString()}
                      onChange={handleChange}
                      className="font-sf-pro"
                    />
                  </div>
                </div>
                
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
              
              {/* Address Tab */}
              <TabsContent value="address" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="font-sf-pro">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2" className="font-sf-pro">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine3" className="font-sf-pro">Address Line 3</Label>
                  <Input
                    id="addressLine3"
                    name="addressLine3"
                    value={formData.addressLine3}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine4" className="font-sf-pro">Address Line 4</Label>
                  <Input
                    id="addressLine4"
                    name="addressLine4"
                    value={formData.addressLine4}
                    onChange={handleChange}
                    className="font-sf-pro"
                  />
                </div>
              </TabsContent>
              
              {/* Next of Kin Tab */}
              <TabsContent value="kin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kinRelationship" className="font-sf-pro">Relationship</Label>
                  <Input
                    id="kinRelationship"
                    name="kinRelationship"
                    value={formData.kinRelationship}
                    onChange={handleChange}
                    placeholder="e.g. Spouse, Parent, Child"
                    className="font-sf-pro"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kinName" className="font-sf-pro">Name</Label>
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
              </TabsContent>
              
              {/* Banking Details Tab */}
              <TabsContent value="banking" className="space-y-4">
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
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
              <Button variant="outline" type="button" onClick={onClose} className="font-sf-pro">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600 font-sf-pro">
                <Save className="w-4 h-4 mr-2" />
                Save Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingData(null);
        }}
        onVerified={handleVerifiedSave}
        actionType="update"
        targetEntityName="employee"
        adminScope="extended"
      />
    </>
  );
};

export default AddEmployeeModal;
