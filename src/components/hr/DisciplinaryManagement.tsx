import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  FileText, 
  Calendar, 
  User, 
  Shield, 
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Employee } from '@/services/employeeService';
import { toast } from 'sonner';

// Types for Disciplinary Management
export interface DisciplinaryAction {
  id: string;
  employeeId: string;
  employeeName: string;
  actionType: 'verbal_warning' | 'written_warning' | 'final_warning' | 'suspension' | 'dismissal';
  misconduct: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
  status: 'active' | 'expired' | 'appealed' | 'withdrawn';
  severity: 'minor' | 'serious' | 'gross';
  followUpRequired: boolean;
  followUpDate?: string;
  documents: string[];
  notes: string;
}

export interface MisconductCategory {
  id: string;
  name: string;
  severity: 'minor' | 'serious' | 'gross';
  description: string;
  typicalAction: string;
}

interface DisciplinaryManagementProps {
  employees: Employee[];
}

// Add Disciplinary Action Form Component
interface AddDisciplinaryActionFormProps {
  employees: Employee[];
  onActionAdded: (action: DisciplinaryAction) => void;
}

const AddDisciplinaryActionForm: React.FC<AddDisciplinaryActionFormProps> = ({ employees, onActionAdded }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    actionType: '' as DisciplinaryAction['actionType'],
    misconduct: '',
    description: '',
    severity: '' as 'minor' | 'serious' | 'gross',
    issuedBy: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.actionType || !formData.misconduct || !formData.severity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
    if (!selectedEmployee) {
      toast.error('Selected employee not found');
      return;
    }

    const issueDate = new Date();
    const expiryDate = new Date();
    
    // Set expiry dates based on action type
    switch (formData.actionType) {
      case 'verbal_warning':
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case 'written_warning':
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        break;
      case 'final_warning':
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
      case 'suspension':
      case 'dismissal':
        // No expiry for suspension and dismissal
        expiryDate.setFullYear(expiryDate.getFullYear() + 10);
        break;
    }

    const newAction: DisciplinaryAction = {
      id: Date.now().toString(),
      employeeId: formData.employeeId,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.surname}`,
      actionType: formData.actionType,
      misconduct: formData.misconduct,
      description: formData.description,
      issueDate: issueDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      issuedBy: formData.issuedBy || 'HR Manager',
      status: 'active',
      severity: formData.severity,
      followUpRequired: formData.actionType === 'final_warning',
      followUpDate: formData.actionType === 'final_warning' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      documents: [],
      notes: formData.notes
    };

    // Save to localStorage
    const existingActions = JSON.parse(localStorage.getItem('disciplinaryActions') || '[]');
    const updatedActions = [...existingActions, newAction];
    localStorage.setItem('disciplinaryActions', JSON.stringify(updatedActions));

    onActionAdded(newAction);
    
    // Reset form
    setFormData({
      employeeId: '',
      actionType: '' as DisciplinaryAction['actionType'],
      misconduct: '',
      description: '',
      severity: '' as 'minor' | 'serious' | 'gross',
      issuedBy: '',
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Selection */}
        <div className="space-y-2">
          <Label htmlFor="employee" className="font-sf-pro">Employee *</Label>
          <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.surname} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Type */}
        <div className="space-y-2">
          <Label htmlFor="actionType" className="font-sf-pro">Action Type *</Label>
          <Select value={formData.actionType} onValueChange={(value) => setFormData(prev => ({ ...prev, actionType: value as DisciplinaryAction['actionType'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verbal_warning">Verbal Warning</SelectItem>
              <SelectItem value="written_warning">Written Warning</SelectItem>
              <SelectItem value="final_warning">Final Warning</SelectItem>
              <SelectItem value="suspension">Suspension</SelectItem>
              <SelectItem value="dismissal">Dismissal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Misconduct */}
        <div className="space-y-2">
          <Label htmlFor="misconduct" className="font-sf-pro">Misconduct *</Label>
          <Input
            id="misconduct"
            value={formData.misconduct}
            onChange={(e) => setFormData(prev => ({ ...prev, misconduct: e.target.value }))}
            placeholder="e.g., Tardiness, Insubordination"
            className="font-sf-pro"
          />
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <Label htmlFor="severity" className="font-sf-pro">Severity *</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as 'minor' | 'serious' | 'gross' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="gross">Gross</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issued By */}
        <div className="space-y-2">
          <Label htmlFor="issuedBy" className="font-sf-pro">Issued By</Label>
          <Input
            id="issuedBy"
            value={formData.issuedBy}
            onChange={(e) => setFormData(prev => ({ ...prev, issuedBy: e.target.value }))}
            placeholder="HR Manager"
            className="font-sf-pro"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-sf-pro">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the incident..."
          className="font-sf-pro"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="font-sf-pro">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes or follow-up actions..."
          className="font-sf-pro"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Disciplinary Action
        </Button>
      </div>
    </form>
  );
};

// Edit Disciplinary Action Form Component
interface EditDisciplinaryActionFormProps {
  action: DisciplinaryAction;
  employees: Employee[];
  onActionUpdated: (action: DisciplinaryAction) => void;
  onCancel: () => void;
}

const EditDisciplinaryActionForm: React.FC<EditDisciplinaryActionFormProps> = ({ action, employees, onActionUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: action.employeeId,
    actionType: action.actionType,
    misconduct: action.misconduct,
    description: action.description,
    severity: action.severity,
    issuedBy: action.issuedBy,
    notes: action.notes,
    status: action.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.actionType || !formData.misconduct || !formData.severity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
    if (!selectedEmployee) {
      toast.error('Selected employee not found');
      return;
    }

    const updatedAction: DisciplinaryAction = {
      ...action,
      employeeId: formData.employeeId,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.surname}`,
      actionType: formData.actionType,
      misconduct: formData.misconduct,
      description: formData.description,
      severity: formData.severity,
      issuedBy: formData.issuedBy,
      notes: formData.notes,
      status: formData.status
    };

    onActionUpdated(updatedAction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Selection */}
        <div className="space-y-2">
          <Label htmlFor="employee" className="font-sf-pro">Employee *</Label>
          <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.surname} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Type */}
        <div className="space-y-2">
          <Label htmlFor="actionType" className="font-sf-pro">Action Type *</Label>
          <Select value={formData.actionType} onValueChange={(value) => setFormData(prev => ({ ...prev, actionType: value as DisciplinaryAction['actionType'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verbal_warning">Verbal Warning</SelectItem>
              <SelectItem value="written_warning">Written Warning</SelectItem>
              <SelectItem value="final_warning">Final Warning</SelectItem>
              <SelectItem value="suspension">Suspension</SelectItem>
              <SelectItem value="dismissal">Dismissal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Misconduct */}
        <div className="space-y-2">
          <Label htmlFor="misconduct" className="font-sf-pro">Misconduct *</Label>
          <Input
            id="misconduct"
            value={formData.misconduct}
            onChange={(e) => setFormData(prev => ({ ...prev, misconduct: e.target.value }))}
            placeholder="e.g., Tardiness, Insubordination"
            className="font-sf-pro"
          />
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <Label htmlFor="severity" className="font-sf-pro">Severity *</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as 'minor' | 'serious' | 'gross' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="gross">Gross</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="font-sf-pro">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as DisciplinaryAction['status'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="appealed">Appealed</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issued By */}
        <div className="space-y-2">
          <Label htmlFor="issuedBy" className="font-sf-pro">Issued By</Label>
          <Input
            id="issuedBy"
            value={formData.issuedBy}
            onChange={(e) => setFormData(prev => ({ ...prev, issuedBy: e.target.value }))}
            placeholder="HR Manager"
            className="font-sf-pro"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-sf-pro">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the incident..."
          className="font-sf-pro"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="font-sf-pro">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes or follow-up actions..."
          className="font-sf-pro"
          rows={2}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white">
          <Edit className="h-4 w-4 mr-2" />
          Update Action
        </Button>
      </div>
    </form>
  );
};

const DisciplinaryManagement: React.FC<DisciplinaryManagementProps> = ({ employees }) => {
  const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'add' | 'guidelines'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewingAction, setViewingAction] = useState<DisciplinaryAction | null>(null);
  const [editingAction, setEditingAction] = useState<DisciplinaryAction | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load disciplinary actions from localStorage on component mount
  useEffect(() => {
    const loadDisciplinaryActions = () => {
      try {
        const actionsRaw = localStorage.getItem('disciplinaryActions');
        if (actionsRaw) {
          const actions = JSON.parse(actionsRaw);
          setDisciplinaryActions(actions);
        }
      } catch (error) {
        console.error('Error loading disciplinary actions:', error);
        toast.error('Failed to load disciplinary actions');
      }
    };

    loadDisciplinaryActions();
  }, []);

  // Predefined misconduct categories based on South African labor law
  const misconductCategories: MisconductCategory[] = [
    {
      id: '1',
      name: 'Tardiness/Absenteeism',
      severity: 'minor',
      description: 'Late arrival, unauthorized absence',
      typicalAction: 'Verbal warning → Written warning'
    },
    {
      id: '2',
      name: 'Insubordination',
      severity: 'serious',
      description: 'Refusal to follow reasonable instructions',
      typicalAction: 'Written warning → Final warning'
    },
    {
      id: '3',
      name: 'Theft',
      severity: 'gross',
      description: 'Stealing company or colleague property',
      typicalAction: 'Immediate dismissal'
    },
    {
      id: '4',
      name: 'Violence/Assault',
      severity: 'gross',
      description: 'Physical violence or threats',
      typicalAction: 'Immediate dismissal'
    },
    {
      id: '5',
      name: 'Harassment',
      severity: 'serious',
      description: 'Sexual or other forms of harassment',
      typicalAction: 'Final warning or dismissal'
    },
    {
      id: '6',
      name: 'Poor Performance',
      severity: 'minor',
      description: 'Consistently below standard work',
      typicalAction: 'Performance improvement plan'
    },
    {
      id: '7',
      name: 'Dishonesty',
      severity: 'gross',
      description: 'Fraud, falsification of records',
      typicalAction: 'Immediate dismissal'
    },
    {
      id: '8',
      name: 'Substance Abuse',
      severity: 'serious',
      description: 'Under influence of alcohol/drugs at work',
      typicalAction: 'Suspension → Final warning'
    }
  ];

  useEffect(() => {
    loadDisciplinaryActions();
  }, []);

  const loadDisciplinaryActions = () => {
    try {
      const actionsRaw = localStorage.getItem('disciplinaryActions');
      if (actionsRaw) {
        const actions: DisciplinaryAction[] = JSON.parse(actionsRaw);
        // Update expired warnings
        const updatedActions = actions.map(action => ({
          ...action,
          status: new Date(action.expiryDate) < new Date() ? 'expired' : action.status
        }));
        setDisciplinaryActions(updatedActions);
        localStorage.setItem('disciplinaryActions', JSON.stringify(updatedActions));
      }
    } catch (error) {
      console.error('Error loading disciplinary actions:', error);
    }
  };

  const getActionTypeLabel = (type: DisciplinaryAction['actionType']): string => {
    const labels = {
      verbal_warning: 'Verbal Warning',
      written_warning: 'Written Warning',
      final_warning: 'Final Warning',
      suspension: 'Suspension',
      dismissal: 'Dismissal'
    };
    return labels[type];
  };

  const getActionTypeColor = (type: DisciplinaryAction['actionType']): string => {
    const colors = {
      verbal_warning: 'bg-yellow-100 text-yellow-800',
      written_warning: 'bg-orange-100 text-orange-800',
      final_warning: 'bg-red-100 text-red-800',
      suspension: 'bg-purple-100 text-purple-800',
      dismissal: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getSeverityColor = (severity: 'minor' | 'serious' | 'gross'): string => {
    const colors = {
      minor: 'bg-blue-100 text-blue-800',
      serious: 'bg-orange-100 text-orange-800',
      gross: 'bg-red-100 text-red-800'
    };
    return colors[severity];
  };

  const getStatusIcon = (status: DisciplinaryAction['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'appealed':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getEmployeeDisciplinaryHistory = (employeeId: string) => {
    return disciplinaryActions.filter(action => action.employeeId === employeeId)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  };

  // Handler functions for actions
  const handleViewAction = (action: DisciplinaryAction) => {
    setViewingAction(action);
    setShowViewModal(true);
  };

  const handleEditAction = (action: DisciplinaryAction) => {
    setEditingAction(action);
    setShowEditModal(true);
  };

  const handleUpdateAction = (updatedAction: DisciplinaryAction) => {
    const updatedActions = disciplinaryActions.map(action => 
      action.id === updatedAction.id ? updatedAction : action
    );
    setDisciplinaryActions(updatedActions);
    localStorage.setItem('disciplinaryActions', JSON.stringify(updatedActions));
    setShowEditModal(false);
    setEditingAction(null);
    toast.success('Disciplinary action updated successfully');
  };

  const handleDeleteAction = (actionId: string) => {
    const updatedActions = disciplinaryActions.filter(action => action.id !== actionId);
    setDisciplinaryActions(updatedActions);
    localStorage.setItem('disciplinaryActions', JSON.stringify(updatedActions));
    toast.success('Disciplinary action deleted successfully');
  };

  const getActiveWarnings = () => {
    return disciplinaryActions.filter(action => 
      action.status === 'active' && 
      ['verbal_warning', 'written_warning', 'final_warning'].includes(action.actionType)
    );
  };

  const getExpiringWarnings = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return disciplinaryActions.filter(action => 
      action.status === 'active' && 
      new Date(action.expiryDate) <= thirtyDaysFromNow
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sf-pro">Disciplinary Management</h2>
          <p className="text-slate-600 font-sf-pro">Manage employee disciplinary actions according to South African labor law</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Disciplinary Actions</TabsTrigger>
          <TabsTrigger value="add">Add Action</TabsTrigger>
          <TabsTrigger value="guidelines">SA Labor Guidelines</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Active Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-yellow-600">
                  {getActiveWarnings().length}
                </div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-orange-600">
                  {getExpiringWarnings().length}
                </div>
                <p className="text-xs text-muted-foreground">Within 30 days</p>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Total Actions</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-blue-600">
                  {disciplinaryActions.length}
                </div>
              </CardContent>
            </Card>

            <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro">Employees Affected</CardTitle>
                <User className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-purple-600">
                  {new Set(disciplinaryActions.map(a => a.employeeId)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Actions */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Recent Disciplinary Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sf-pro">Employee</TableHead>
                      <TableHead className="font-sf-pro">Action Type</TableHead>
                      <TableHead className="font-sf-pro">Misconduct</TableHead>
                      <TableHead className="font-sf-pro">Date</TableHead>
                      <TableHead className="font-sf-pro">Status</TableHead>
                      <TableHead className="font-sf-pro">Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinaryActions.slice(0, 10).map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium font-sf-pro">
                          {action.employeeName}
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionTypeColor(action.actionType)}>
                            {getActionTypeLabel(action.actionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-sf-pro">{action.misconduct}</TableCell>
                        <TableCell className="font-sf-pro">{action.issueDate}</TableCell>
                        <TableCell className="font-sf-pro">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(action.status)}
                            <span className="capitalize">{action.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-sf-pro">{action.expiryDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disciplinary Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">All Disciplinary Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4">
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Misconduct</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinaryActions
                      .filter(action => selectedEmployee === 'all' || selectedEmployee === '' || action.employeeId === selectedEmployee)
                      .map((action) => (
                        <TableRow key={action.id}>
                          <TableCell className="font-sf-pro">{action.employeeName}</TableCell>
                          <TableCell>
                            <Badge className={getActionTypeColor(action.actionType)}>
                              {getActionTypeLabel(action.actionType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-sf-pro">{action.misconduct}</TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(action.severity)}>
                              {action.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-sf-pro">{new Date(action.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(action.status)}
                              <span className="font-sf-pro text-sm">{action.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewAction(action)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditAction(action)}
                                title="Edit Action"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {disciplinaryActions.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-sf-pro">No disciplinary actions recorded yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Action Tab */}
        <TabsContent value="add" className="space-y-6">
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Add Disciplinary Action</CardTitle>
            </CardHeader>
            <CardContent>
              <AddDisciplinaryActionForm 
                employees={employees}
                onActionAdded={(action) => {
                  setDisciplinaryActions(prev => [...prev, action]);
                  toast.success('Disciplinary action added successfully');
                  setActiveTab('actions');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SA Labor Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card className="glass backdrop-blur-sm bg-blue-50/50 border border-blue-200/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-blue-800">South African Labor Law Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-blue-700">
                <div>
                  <h4 className="font-bold font-sf-pro mb-2">Progressive Discipline</h4>
                  <p className="font-sf-pro">Employers should generally follow progressive discipline: verbal warning → written warning → final warning → dismissal</p>
                </div>
                
                <div>
                  <h4 className="font-bold font-sf-pro mb-2">Warning Validity Periods</h4>
                  <ul className="list-disc list-inside space-y-1 font-sf-pro">
                    <li><strong>Verbal Warning:</strong> 3 months</li>
                    <li><strong>Written Warning:</strong> 6 months</li>
                    <li><strong>Final Warning:</strong> 12 months</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold font-sf-pro mb-2">Serious Misconduct</h4>
                  <p className="font-sf-pro">Theft, violence, fraud, or gross insubordination may warrant immediate dismissal without prior warnings</p>
                </div>

                <div>
                  <h4 className="font-bold font-sf-pro mb-2">Key Principles</h4>
                  <ul className="list-disc list-inside space-y-1 font-sf-pro">
                    <li>No fixed number of warnings required</li>
                    <li>Consider severity and employee's record</li>
                    <li>Expired warnings can be aggravating factors</li>
                    <li>Final warnings must clearly state dismissal consequences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Misconduct Categories */}
          <Card className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro">Misconduct Categories & Typical Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {misconductCategories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold font-sf-pro">{category.name}</h5>
                      <Badge className={getSeverityColor(category.severity)}>
                        {category.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 font-sf-pro mb-2">{category.description}</p>
                    <p className="text-xs text-slate-500 font-sf-pro">
                      <strong>Typical Action:</strong> {category.typicalAction}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Action Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-sf-pro">Disciplinary Action Details</DialogTitle>
          </DialogHeader>
          {viewingAction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Employee</Label>
                  <p className="font-sf-pro">{viewingAction.employeeName}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Action Type</Label>
                  <div className="mt-1">
                    <Badge className={getActionTypeColor(viewingAction.actionType)}>
                      {getActionTypeLabel(viewingAction.actionType)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Misconduct</Label>
                  <p className="font-sf-pro">{viewingAction.misconduct}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Severity</Label>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(viewingAction.severity)}>
                      {viewingAction.severity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Issue Date</Label>
                  <p className="font-sf-pro">{new Date(viewingAction.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Expiry Date</Label>
                  <p className="font-sf-pro">{new Date(viewingAction.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Issued By</Label>
                  <p className="font-sf-pro">{viewingAction.issuedBy}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(viewingAction.status)}
                    <span className="font-sf-pro text-sm">{viewingAction.status}</span>
                  </div>
                </div>
              </div>
              {viewingAction.description && (
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Description</Label>
                  <p className="font-sf-pro mt-1 p-3 bg-gray-50 rounded-md">{viewingAction.description}</p>
                </div>
              )}
              {viewingAction.notes && (
                <div>
                  <Label className="font-sf-pro text-sm font-medium">Notes</Label>
                  <p className="font-sf-pro mt-1 p-3 bg-gray-50 rounded-md">{viewingAction.notes}</p>
                </div>
              )}
              {viewingAction.followUpRequired && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-sf-pro text-sm font-medium text-yellow-800">Follow-up Required</span>
                  </div>
                  {viewingAction.followUpDate && (
                    <p className="font-sf-pro text-sm text-yellow-700 mt-1">
                      Follow-up Date: {new Date(viewingAction.followUpDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Action Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-sf-pro">Edit Disciplinary Action</DialogTitle>
          </DialogHeader>
          {editingAction && (
            <EditDisciplinaryActionForm 
              action={editingAction}
              employees={employees}
              onActionUpdated={handleUpdateAction}
              onCancel={() => {
                setShowEditModal(false);
                setEditingAction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisciplinaryManagement;
