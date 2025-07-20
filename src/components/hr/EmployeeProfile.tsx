import React from 'react';
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  CreditCard,
  Building,
  User,
  DollarSign,
  Heart,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Employee } from '@/services/employeeService';
import { format } from 'date-fns';

interface EmployeeProfileProps {
  employee: Employee | null;
  onBack: () => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employee, onBack }) => {
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-slate-600 mb-4">No employee selected</p>
        <Button onClick={onBack} className="font-sf-pro">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEmploymentTypeColor = (employmentType: Employee['employmentType']) => {
    switch (employmentType) {
      case 'Full Time':
        return 'bg-blue-100 text-blue-800';
      case 'Part Time':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="font-sf-pro"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
        </Button>
        <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Employee Profile</h2>
      </div>

      {/* Profile Overview */}
      <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-200">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center text-2xl font-medium font-sf-pro shadow-colored">
              {employee.avatar ? (
                <img src={employee.avatar} alt={`${employee.firstName} ${employee.surname}`} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                `${employee.firstName[0]}${employee.surname[0]}`
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900 font-sf-pro">
                {employee.firstName} {employee.surname}
              </h1>
              <p className="text-lg text-slate-600 font-sf-pro mb-2">{employee.position}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getStatusColor(employee.status)}`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('-', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${getEmploymentTypeColor(employee.employmentType)}`}>
                  {employee.employmentType}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-mokm-purple-100 text-mokm-purple-800 font-sf-pro">
                  {employee.department}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-600 font-sf-pro">
                <span className="font-medium">Employee ID:</span> {employee.employeeNumber}
              </p>
              <p className="text-sm text-slate-600 font-sf-pro">
                <span className="font-medium">Started:</span> {format(new Date(employee.startDate), 'PP')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Contact Information */}
            <Card className="glass backdrop-blur-sm bg-white/40 border border-white/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 font-sf-pro mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">{employee.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">{employee.contactNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">DOB: {format(new Date(employee.dateOfBirth), 'PP')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                    <div>
                      <p className="text-slate-700">{employee.addressLine1}</p>
                      {employee.addressLine2 && <p className="text-slate-700">{employee.addressLine2}</p>}
                      {employee.addressLine3 && <p className="text-slate-700">{employee.addressLine3}</p>}
                      {employee.addressLine4 && <p className="text-slate-700">{employee.addressLine4}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="glass backdrop-blur-sm bg-white/40 border border-white/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 font-sf-pro mb-4">Employment Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">Position: {employee.position}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">Department: {employee.department}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">Location: {employee.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">
                      Shift: {employee.dayShift && 'Day'} {employee.nightShift && 'Night'} {employee.flexibleShift && 'Flexible'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="glass backdrop-blur-sm bg-white/40 border border-white/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 font-sf-pro mb-4">Financial Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">Salary: R {employee.salary.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-700">Payment: {employee.paymentCycle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-slate-700">Bank: {employee.bankName}</p>
                      <p className="text-slate-700">Account: {employee.accountNumber}</p>
                      <p className="text-slate-700">Branch: {employee.branchCode}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <div className="mt-6">
            <Card className="glass backdrop-blur-sm bg-white/40 border border-white/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 font-sf-pro mb-4">Emergency Contact</h3>
                <div className="flex items-start gap-3">
                  <Heart className="h-4 w-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-slate-700">
                      <span className="font-medium">Name:</span> {employee.kinName} {employee.kinSurname}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium">Relationship:</span> {employee.kinRelationship}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium">Contact:</span> {employee.kinContactNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
