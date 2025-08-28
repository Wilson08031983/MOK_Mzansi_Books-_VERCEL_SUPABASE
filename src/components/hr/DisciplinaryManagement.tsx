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
          <Label htmlFor="employee" className="font-sf-pro text-slate-300">Employee *</Label>
          <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
            <SelectTrigger className="bg-slate-900/40 border border-white/10 text-slate-100">
              <SelectValue placeholder="Select employee" className="text-slate-100" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/80 border border-white/10 text-slate-100">
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
          <Label htmlFor="actionType" className="font-sf-pro text-slate-300">Action Type *</Label>
          <Select value={formData.actionType} onValueChange={(value) => setFormData(prev => ({ ...prev, actionType: value as DisciplinaryAction['actionType'] }))}>
            <SelectTrigger className="bg-slate-900/40 border border-white/10 text-slate-100">
              <SelectValue placeholder="Select action type" className="text-slate-100" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/80 border border-white/10 text-slate-100">
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
          <Label htmlFor="misconduct" className="font-sf-pro text-slate-300">Misconduct *</Label>
          <Input
            id="misconduct"
            value={formData.misconduct}
            onChange={(e) => setFormData(prev => ({ ...prev, misconduct: e.target.value }))}
            placeholder="e.g., Tardiness, Insubordination"
            className="font-sf-pro bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <Label htmlFor="severity" className="font-sf-pro text-slate-300">Severity *</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as 'minor' | 'serious' | 'gross' }))}>
            <SelectTrigger className="bg-slate-900/40 border border-white/10 text-slate-100">
              <SelectValue placeholder="Select severity" className="text-slate-100" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/80 border border-white/10 text-slate-100">
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="gross">Gross</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issued By */}
        <div className="space-y-2">
          <Label htmlFor="issuedBy" className="font-sf-pro text-slate-300">Issued By</Label>
          <Input
            id="issuedBy"
            value={formData.issuedBy}
            onChange={(e) => setFormData(prev => ({ ...prev, issuedBy: e.target.value }))}
            placeholder="HR Manager"
            className="font-sf-pro bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="font-sf-pro text-slate-300">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed description of the incident..."
          className="font-sf-pro bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="font-sf-pro text-slate-300">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes or follow-up actions..."
          className="font-sf-pro bg-slate-900/40 border border-white/10 text-slate-100 placeholder:text-slate-400"
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
    // Theme-aware badge variants
    const colors = {
      verbal_warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/40',
      written_warning: 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40',
      final_warning: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40',
      suspension: 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/40',
      dismissal: 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-white/10'
    } as const;
    return colors[type];
  };

  const getSeverityColor = (severity: 'minor' | 'serious' | 'gross'): string => {
    // Theme-aware badge variants
    const colors = {
      minor: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40',
      serious: 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40',
      gross: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40'
    } as const;
    return colors[severity];
  };

  const getStatusIcon = (status: DisciplinaryAction['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-300" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'appealed':
        return <AlertCircle className="h-4 w-4 text-yellow-300" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-red-300" />;
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
          <h2 className="text-2xl font-bold font-sf-pro text-slate-800 dark:text-slate-100">Disciplinary Management</h2>
          <p className="font-sf-pro text-slate-600 dark:text-slate-400">Manage employee disciplinary actions according to South African labor law</p>
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
            <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Active Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-yellow-700 dark:text-yellow-300">
                  {getActiveWarnings().length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-orange-700 dark:text-orange-300">
                  {getExpiringWarnings().length}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Within 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Total Actions</CardTitle>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-blue-700 dark:text-blue-300">
                  {disciplinaryActions.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sf-pro text-slate-800 dark:text-slate-100">Employees Affected</CardTitle>
                <User className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sf-pro text-purple-700 dark:text-purple-300">
                  {new Set(disciplinaryActions.map(a => a.employeeId)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Actions */}
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Recent Disciplinary Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Employee</TableHead>
                      <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Action Type</TableHead>
                      <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Misconduct</TableHead>
                      <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Date</TableHead>
                      <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="font-sf-pro text-slate-700 dark:text-slate-300">Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinaryActions.slice(0, 10).map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium font-sf-pro text-slate-800 dark:text-slate-100">
                          {action.employeeName}
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionTypeColor(action.actionType)}>
                            {getActionTypeLabel(action.actionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-sf-pro text-slate-700 dark:text-slate-300">{action.misconduct}</TableCell>
                        <TableCell className="font-sf-pro text-slate-700 dark:text-slate-300">{action.issueDate}</TableCell>
                        <TableCell className="font-sf-pro text-slate-700 dark:text-slate-300">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(action.status)}
                            <span className="capitalize">{action.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-sf-pro text-slate-700 dark:text-slate-300">{action.expiryDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Action Tab */}
        <TabsContent value="add" className="space-y-6">
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Add Disciplinary Action</CardTitle>
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
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-800 dark:text-slate-100">South African Labor Law Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="font-bold font-sf-pro mb-2 text-slate-800 dark:text-slate-100">Progressive Discipline</h4>
                  <p className="font-sf-pro">Employers should generally follow progressive discipline: verbal warning → written warning → final warning → dismissal</p>
                </div>
                
                <div>
                  <h4 className="font-bold font-sf-pro mb-2 text-slate-800 dark:text-slate-100">Warning Validity Periods</h4>
                  <ul className="list-disc list-inside space-y-1 font-sf-pro text-slate-700 dark:text-slate-300">
                    <li><strong>Verbal Warning:</strong> 3 months</li>
                    <li><strong>Written Warning:</strong> 6 months</li>
                    <li><strong>Final Warning:</strong> 12 months</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold font-sf-pro mb-2 text-slate-800 dark:text-slate-100">Serious Misconduct</h4>
                  <p className="font-sf-pro">Theft, violence, fraud, or gross insubordination may warrant immediate dismissal without prior warnings</p>
                </div>

                <div>
                  <h4 className="font-bold font-sf-pro mb-2 text-slate-800 dark:text-slate-100">Key Principles</h4>
                  <ul className="list-disc list-inside space-y-1 font-sf-pro text-slate-700 dark:text-slate-300">
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
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-business">
            <CardHeader>
              <CardTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Misconduct Categories & Typical Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {misconductCategories.map((category) => (
                  <div key={category.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold font-sf-pro text-slate-800 dark:text-slate-100">{category.name}</h5>
                      <Badge className={getSeverityColor(category.severity)}>
                        {category.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-sf-pro mb-2">{category.description}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sf-pro">
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
        <DialogContent className="max-w-2xl bg-white text-slate-800 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Disciplinary Action Details</DialogTitle>
          </DialogHeader>
          {viewingAction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Employee</Label>
                  <p className="font-sf-pro text-slate-800 dark:text-slate-100">{viewingAction.employeeName}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Action Type</Label>
                  <div className="mt-1">
                    <Badge className={getActionTypeColor(viewingAction.actionType)}>
                      {getActionTypeLabel(viewingAction.actionType)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Misconduct</Label>
                  <p className="font-sf-pro text-slate-800 dark:text-slate-100">{viewingAction.misconduct}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Severity</Label>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(viewingAction.severity)}>
                      {viewingAction.severity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Issue Date</Label>
                  <p className="font-sf-pro text-slate-800 dark:text-slate-100">{new Date(viewingAction.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date</Label>
                  <p className="font-sf-pro text-slate-800 dark:text-slate-100">{new Date(viewingAction.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Issued By</Label>
                  <p className="font-sf-pro text-slate-800 dark:text-slate-100">{viewingAction.issuedBy}</p>
                </div>
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
                  <div className="flex items-center gap-2 mt-1 text-slate-800 dark:text-slate-100">
                    {getStatusIcon(viewingAction.status)}
                    <span className="font-sf-pro text-sm">{viewingAction.status}</span>
                  </div>
                </div>
              </div>
              {viewingAction.description && (
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                  <p className="font-sf-pro mt-1 p-3 bg-white border border-slate-200 rounded-md text-slate-800 dark:bg-slate-900/40 dark:border-white/10 dark:text-slate-100">{viewingAction.description}</p>
                </div>
              )}
              {viewingAction.notes && (
                <div>
                  <Label className="font-sf-pro text-sm font-medium text-slate-700 dark:text-slate-300">Notes</Label>
                  <p className="font-sf-pro mt-1 p-3 bg-white border border-slate-200 rounded-md text-slate-800 dark:bg-slate-900/40 dark:border-white/10 dark:text-slate-100">{viewingAction.notes}</p>
                </div>
              )}
              {viewingAction.followUpRequired && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/30 dark:border-amber-400/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    <span className="font-sf-pro text-sm font-medium text-amber-800 dark:text-amber-200">Follow-up Required</span>
                  </div>
                  {viewingAction.followUpDate && (
                    <p className="font-sf-pro text-sm text-amber-800 dark:text-amber-200 mt-1">
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
        <DialogContent className="max-w-2xl bg-white text-slate-800 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="font-sf-pro text-slate-800 dark:text-slate-100">Edit Disciplinary Action</DialogTitle>
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
