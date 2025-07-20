import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MapPin, 
  Briefcase,
  UserCircle,
  CreditCard,
  Users,
  Clock,
  Home,
  Heart
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Employee {
  id: string;
  employeeNumber?: string;
  firstName?: string;
  surname?: string;
  name?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  position?: string;
  department?: string;
  startDate?: string;
  status?: 'active' | 'on-leave' | 'terminated';
  location?: string;
  employmentType?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  kinName?: string;
  kinSurname?: string;
  kinRelationship?: string;
  kinContactNumber?: string;
  dayShift?: boolean;
  nightShift?: boolean;
  flexibleShift?: boolean;
  accountHolderName?: string;
  salary?: number;
  paymentCycle?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  taxPercentage?: number;
  avatar?: string;
}

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ isOpen, onClose, employee }) => {
  if (!employee) return null;

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get full name from employee
  const getFullName = (employee: Employee) => {
    if (employee.name) return employee.name;
    return [employee.firstName, employee.surname].filter(Boolean).join(' ') || 'Unknown';
  };

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n && n[0] || '').join('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto glass backdrop-blur-sm bg-white/90 border border-white/20 shadow-business">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 font-sf-pro flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium font-sf-pro">
              {employee.avatar ? (
                <img src={employee.avatar} alt={getFullName(employee)} className="h-10 w-10 rounded-full" />
              ) : (
                getInitials(getFullName(employee))
              )}
            </div>
            {getFullName(employee)}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full font-sf-pro ${
                employee.status === 'active' ? 'bg-green-100 text-green-800' :
                employee.status === 'on-leave' ? 'bg-blue-100 text-blue-800' :
                employee.status === 'terminated' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {!employee.status ? 'Unknown' : 
                employee.status === 'on-leave' ? 'On Leave' : 
                employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
              <span className="text-sm text-slate-500 font-sf-pro">
                Employee ID: {employee.employeeNumber || employee.id}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 font-sf-pro mb-3 border-b border-slate-200 pb-2">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <UserCircle className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Full Name</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.firstName || ''} {employee.surname || ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Email</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.email || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Phone</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.phone || employee.contactNumber || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Date of Birth</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {formatDate(employee.dateOfBirth)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Home className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Address</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.addressLine1 && <div>{employee.addressLine1}</div>}
                        {employee.addressLine2 && <div>{employee.addressLine2}</div>}
                        {employee.addressLine3 && <div>{employee.addressLine3}</div>}
                        {employee.addressLine4 && <div>{employee.addressLine4}</div>}
                        {!employee.addressLine1 && !employee.addressLine2 && 
                         !employee.addressLine3 && !employee.addressLine4 && 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 font-sf-pro mb-3 border-b border-slate-200 pb-2">
                  Emergency Contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Heart className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Next of Kin</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.kinName && employee.kinSurname ? 
                          `${employee.kinName} ${employee.kinSurname}` : 'Not provided'}
                        {employee.kinRelationship && ` (${employee.kinRelationship})`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Contact Number</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.kinContactNumber || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 font-sf-pro mb-3 border-b border-slate-200 pb-2">
                  Employment Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Position</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.position || 'Not assigned'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Department</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.department || 'Not assigned'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Location</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.location || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Employment Type</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.employmentType || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Start Date</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {formatDate(employee.startDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Shift Type</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {[
                          employee.dayShift && 'Day Shift',
                          employee.nightShift && 'Night Shift',
                          employee.flexibleShift && 'Flexible Shift'
                        ].filter(Boolean).join(', ') || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 font-sf-pro mb-3 border-b border-slate-200 pb-2">
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Bank Details</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.bankName ? (
                          <>
                            <div>{employee.bankName}</div>
                            {employee.accountNumber && (
                              <div>Account: {employee.accountNumber}</div>
                            )}
                            {employee.branchCode && (
                              <div>Branch Code: {employee.branchCode}</div>
                            )}
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <UserCircle className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-xs text-slate-500 font-sf-pro">Account Holder</div>
                      <div className="text-sm text-slate-900 font-sf-pro">
                        {employee.accountHolderName || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  {employee.salary !== undefined && (
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 font-sf-pro">Salary</div>
                        <div className="text-sm text-slate-900 font-sf-pro">
                          {formatCurrency(employee.salary)} ({employee.paymentCycle || 'Not specified'})
                        </div>
                      </div>
                    </div>
                  )}

                  {employee.taxPercentage !== undefined && (
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 font-sf-pro">Tax Rate</div>
                        <div className="text-sm text-slate-900 font-sf-pro">
                          {employee.taxPercentage}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
          <Button onClick={onClose} className="font-sf-pro">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;
