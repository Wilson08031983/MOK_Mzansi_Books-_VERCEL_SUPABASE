import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, Edit } from 'lucide-react';
import { Project, ProjectEmployee } from '@/types/project';
import { Employee } from '@/services/employeeService';
import {
  assignEmployeeToProject,
  removeEmployeeFromProject,
  updateEmployeeAssignment,
  getAvailableEmployeesForProject,
  calculateEmployeeTotalAllocation
} from '@/services/projectEmployeeService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeAssignmentModalProps {
  project: Project;
  allProjects: Project[];
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

const EmployeeAssignmentModal: React.FC<EmployeeAssignmentModalProps> = ({
  project,
  allProjects,
  onClose,
  onUpdate
}) => {
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [employeeRole, setEmployeeRole] = useState<string>('');
  const [employeeAllocation, setEmployeeAllocation] = useState<number>(100);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [editAllocation, setEditAllocation] = useState<number>(100);
  const [updatedProject, setUpdatedProject] = useState<Project>(project);

  useEffect(() => {
    const available = getAvailableEmployeesForProject(updatedProject);
    setAvailableEmployees(available);
  }, [updatedProject]);

  const handleAssignEmployee = () => {
    if (!selectedEmployeeId) return;

    try {
      const updated = assignEmployeeToProject(
        { ...updatedProject },
        selectedEmployeeId,
        employeeRole,
        employeeAllocation
      );
      setUpdatedProject(updated);
      setSelectedEmployeeId('');
      setEmployeeRole('');
      setEmployeeAllocation(100);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to assign employee');
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    try {
      const updated = removeEmployeeFromProject({ ...updatedProject }, employeeId);
      setUpdatedProject(updated);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove employee');
    }
  };

  const handleUpdateEmployee = (employeeId: string) => {
    try {
      const updated = updateEmployeeAssignment(
        { ...updatedProject },
        employeeId,
        { role: editRole, allocation: editAllocation }
      );
      setUpdatedProject(updated);
      setEditingEmployee(null);
      setEditRole('');
      setEditAllocation(100);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update employee assignment');
    }
  };

  const startEditing = (employee: ProjectEmployee) => {
    setEditingEmployee(employee.employeeId);
    setEditRole(employee.role || '');
    setEditAllocation(employee.allocation);
  };

  const cancelEditing = () => {
    setEditingEmployee(null);
    setEditRole('');
    setEditAllocation(100);
  };

  const getTotalAllocation = (employeeId: string) => {
    return calculateEmployeeTotalAllocation(employeeId, allProjects);
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString()}`;
  };

  const handleSave = () => {
    onUpdate(updatedProject);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 pt-6 pb-2">
          <div className="flex flex-col">
            <DialogTitle className="text-2xl font-semibold mb-1">
              Manage Team Assignment
            </DialogTitle>
            <div className="text-sm text-slate-500">{project.name} ({project.code})</div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSave} className="bg-gradient-to-r from-mokm-blue-500 to-mokm-purple-500 hover:from-mokm-blue-600 hover:to-mokm-purple-600">
              Save Changes
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Project Duration</div>
                <div className="font-semibold">
                  {new Date(updatedProject.startDate).toLocaleDateString()} - {new Date(updatedProject.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Salary Expenses</div>
                <div className="font-semibold text-red-600">
                  {formatCurrency(updatedProject.salaryExpenses || 0)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Total Project Cost</div>
                <div className="font-semibold text-blue-600">
                  {formatCurrency(updatedProject.totalProjectExpenses || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assign New Employee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Assign Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="employee-select">Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.surname} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Project Role</Label>
                  <Input
                    id="role"
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value)}
                    placeholder="e.g., Lead Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="allocation">Allocation (%)</Label>
                  <Input
                    id="allocation"
                    type="number"
                    min="1"
                    max="100"
                    value={employeeAllocation}
                    onChange={(e) => setEmployeeAllocation(parseInt(e.target.value) || 100)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAssignEmployee}
                    disabled={!selectedEmployeeId}
                    className="w-full bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500 hover:from-mokm-green-600 hover:to-mokm-blue-600"
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Employees */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {updatedProject.assignedEmployees && updatedProject.assignedEmployees.length > 0 ? (
                <div className="space-y-4">
                  {updatedProject.assignedEmployees.map(employee => (
                    <div key={employee.employeeId} className="p-4 bg-slate-50 rounded-lg">
                      {editingEmployee === employee.employeeId ? (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div>
                            <div className="font-medium">{employee.employeeName}</div>
                            <div className="text-sm text-slate-500">{employee.employeeNumber}</div>
                          </div>
                          <div>
                            <Label htmlFor="edit-role">Role</Label>
                            <Input
                              id="edit-role"
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              placeholder="Project role"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-allocation">Allocation (%)</Label>
                            <Input
                              id="edit-allocation"
                              type="number"
                              min="1"
                              max="100"
                              value={editAllocation}
                              onChange={(e) => setEditAllocation(parseInt(e.target.value) || 100)}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateEmployee(employee.employeeId)}
                              className="bg-gradient-to-r from-mokm-green-500 to-mokm-blue-500 hover:from-mokm-green-600 hover:to-mokm-blue-600"
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white flex items-center justify-center font-medium">
                                {employee.employeeName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium">{employee.employeeName}</div>
                                <div className="text-sm text-slate-500">
                                  {employee.employeeNumber} • {employee.position} • {employee.department}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(employee.monthlySalary)}/month</div>
                              <div className="text-sm text-slate-500">
                                {employee.allocation}% allocation
                                {employee.role && ` • ${employee.role}`}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(employee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveEmployee(employee.employeeId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No employees assigned to this project yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAssignmentModal;
