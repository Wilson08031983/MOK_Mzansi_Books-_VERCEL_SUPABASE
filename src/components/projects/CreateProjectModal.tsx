
import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, DollarSign, Tag, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClients, Client } from '@/services/clientService';
import { getAllEmployees, Employee } from '@/services/employeeService';
import { getAllTeamMembers } from '@/services/localAuthService';
import { Project } from '@/types/project';
import { updateProjectWithAttendanceExpenses } from '@/services/projectAttendanceExpenseService';
import { activityService } from '@/services/activityService';

// Using a specialized version of Project for creating new projects
interface ProjectData extends Omit<Project, 'budget' | 'expenses' | 'status' | 'priority'> {
  budget: string; // String for form input, converted to number on save
  expenses?: number;
  status: string; // String for form input, converted to Project['status'] on save
  priority: string; // String for form input, converted to Project['priority'] on save
  billingType: string;
  hourlyRate: string;
  customFields: Record<string, unknown>;
  createdAt?: string;
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (formState: ProjectData) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    client: '',
    clientId: '',
    manager: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    priority: 'Medium',
    budget: '',
    billingType: 'Fixed Price',
    hourlyRate: '',
    tags: [] as string[],
    team: [] as string[],
    customFields: {} as Record<string, unknown>
  });

  const availableTags = [
    'Web Development',
    'Mobile App',
    'UI/UX Design',
    'Backend Development',
    'E-commerce',
    'API Integration',
    'Database',
    'Retail / Shop Setup',
    'Inventory Management',
    'Sales Campaign',
    'Social Media Marketing',
    'Accounting & Tax',
    'Branding / Design',
    'Office Renovation',
    'Construction Project',
    'Building Maintenance',
    'Logistics & Delivery',
    'Event Planning',
    'Electrical Work',
    'Plumbing',
    'Landscaping',
    'General Admin Tasks',
    'Legal & Compliance',
    'HR / Payroll',
    'IT Support',
    'Security Services',
    'Cleaning Services',
    'Catering Services',
    'Municipal Services',
    'Government Supplier',
    'Tender Response',
    'NGO / Non-Profit Project',
    'Public Works',
    'Consulting',
    'Agriculture & Farming',
    'Real Estate',
    'Insurance Claims',
    'Transport & Fleet',
    'Education / Training',
    'Healthcare / Medical'
  ];
  // Management positions that can be project managers
  const managementPositions = [
    'CEO', 'Manager', 'General Manager', 'Site Manager', 'Bookkeeper', 'Director', 'Founder',
    'Project Manager', 'Senior Manager', 'Team Lead', 'Team Leader', 'Department Head',
    'Finance Manager', 'HR Manager', 'Operations Manager'
  ];
  
  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<string[]>([]);
  const [availableTeam, setAvailableTeam] = useState<string[]>([]);
  
  // State for storing clients from localStorage
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  
  // State for tag filtering
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState<string[]>(availableTags);

  const handleInputChange = (field: string, value: string | string[] | Record<string, unknown>) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  // Special handler for client selection to store both name and ID
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      // Determine the best display name for the client
      const clientDisplayName = selectedClient.companyName || 
        (selectedClient.contactPerson ? `${selectedClient.contactPerson} (Individual)` : 'Client');
      
      // Update project data with client information
      setFormState(prev => ({ 
        ...prev, 
        client: clientDisplayName, // Set display name as client field
        clientId: selectedClient.id 
      }));
      
      // Close the search dropdown by clearing the search term
      setClientSearchTerm('');
    }
  };
  
  // Handle client search
  const handleClientSearch = (searchTerm: string) => {
    setClientSearchTerm(searchTerm);
    if (!searchTerm) {
      setFilteredClients(clients);
    } else {
      setFilteredClients(
        clients.filter(client => 
          (client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  };
  
  // Handle tag search
  const handleTagSearch = (searchTerm: string) => {
    setTagSearchTerm(searchTerm);
    if (!searchTerm) {
      setFilteredTags(availableTags);
    } else {
      setFilteredTags(
        availableTags.filter(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormState(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleTeamToggle = (member: string) => {
    setFormState(prev => ({
      ...prev,
      team: prev.team.includes(member)
        ? prev.team.filter(m => m !== member)
        : [...prev.team, member]
    }));
  };

  // Load clients and employees from localStorage when component mounts
  useEffect(() => {
    const loadEmployees = () => {
      // Load HR employees
      const loadedEmployees = getAllEmployees();
      setEmployees(loadedEmployees);

      const managerList: string[] = [];
      const teamList: string[] = [];

      // Process HR employees
      loadedEmployees.forEach(employee => {
        // Only include active employees
        if (employee.status === 'active') {
          const fullName = `${employee.firstName} ${employee.surname}`;
          
          if (managementPositions.includes(employee.position)) {
            managerList.push(fullName);
          } else {
            teamList.push(fullName);
          }
        }
      });
      
      // Also include team members from Team Management
      const teamMembers = getAllTeamMembers();
      teamMembers.forEach(member => {
        // Create full name from email if fullName is not available
        const memberName = member.fullName || member.email.split('@')[0];
        
        // Determine if the team member should be a manager based on role
        if (managementPositions.includes(member.role)) {
          if (!managerList.includes(memberName)) {
            managerList.push(memberName);
          }
        } else {
          if (!teamList.includes(memberName)) {
            teamList.push(memberName);
          }
        }
      });
      
      setManagers(managerList);
      setAvailableTeam(teamList);
    };

    loadEmployees();
    
    // Also load clients
    const loadedClients = getClients();
    setClients(loadedClients);
    setFilteredClients(loadedClients);
  }, []);

  const handleSubmit = () => {
    // Convert budget from string to number
    const budget = parseFloat(formState.budget) || 0;
    
    // Create a properly formatted Project object
    const newProject: ProjectData = {
      ...formState,
      id: Date.now(),
      code: `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      progress: 0,
      expenses: 0,
      budget: formState.budget, // Keep as string for the ProjectData interface
      status: formState.status as 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' | 'Not Started' | 'Overdue', 
      priority: formState.priority as 'High' | 'Medium' | 'Low',
      tasks: [], // Initialize with empty tasks array
      createdAt: new Date().toISOString(),
      customFields: formState.customFields
    };
    
    // Log project creation activity
    try {
      activityService.logProjectAction(
        'Project created',
        `New project '${newProject.name}' created for ${newProject.client || 'Unknown Client'}`,
        newProject.id.toString(),
        {
          projectCode: newProject.code,
          client: newProject.client,
          budget: newProject.budget,
          status: newProject.status,
          priority: newProject.priority,
          tags: newProject.tags,
          team: newProject.team
        }
      );
    } catch (err) {
      console.warn('Activity logging failed (project create):', err);
    }
    
    onSubmit(newProject);
    onClose();
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText },
    { id: 2, title: 'Team & Timeline', icon: Users },
    { id: 3, title: 'Budget & Settings', icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass backdrop-blur-xl bg-white/95 border-white/20 shadow-business">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent">
              Create New Project
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center space-x-4 mt-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center space-x-2 ${currentStep >= step.id ? 'text-mokm-purple-600' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-mokm-purple-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 ${currentStep > step.id ? 'bg-mokm-purple-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client *</label>
                  
                  {/* Selected client indicator */}
                  {formState.clientId && !clientSearchTerm && (
                    <div className="mb-2 p-3 border border-mokm-purple-300 bg-mokm-purple-50 rounded-lg">
                      <div className="font-medium text-mokm-purple-800">{formState.client}</div>
                      <div className="text-xs text-mokm-purple-600 mt-1">Selected client</div>
                    </div>
                  )}
                  
                  {/* Only show search if no client is selected or search is active */}
                  {(!formState.clientId || clientSearchTerm) && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={clientSearchTerm}
                        onChange={(e) => handleClientSearch(e.target.value)}
                        className="w-full pl-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent mb-2"
                      />
                      {formState.clientId && (
                        <button 
                          onClick={() => setClientSearchTerm('')}
                          className="absolute inset-y-0 right-0 px-3 text-mokm-blue-500 hover:text-mokm-blue-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Change client button when client is selected */}
                  {formState.clientId && !clientSearchTerm && (
                    <button 
                      onClick={() => setClientSearchTerm(' ')} 
                      className="text-sm text-mokm-blue-600 hover:text-mokm-blue-800 mt-1"
                    >
                      Change client
                    </button>
                  )}
                  
                  {/* Client search results */}
                  {clientSearchTerm && (
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                      {filteredClients.length === 0 ? (
                        <div className="p-3 text-center text-slate-500 text-sm">No clients found</div>
                      ) : (
                        filteredClients.map(client => (
                          <div
                            key={client.id}
                            className={`p-3 cursor-pointer hover:bg-slate-50 ${formState.clientId === client.id ? 'bg-mokm-purple-50 border-l-4 border-mokm-purple-500' : ''}`}
                            onClick={() => handleClientChange(client.id)}
                          >
                            <div className="font-medium">
                              {/* Display client name with fallbacks */}
                              {client.companyName ? client.companyName : client.contactPerson ? `${client.contactPerson} (Individual)` : 'Unnamed Client'}
                            </div>
                            <div className="flex flex-col">
                              {client.companyName && client.contactPerson && (
                                <div className="text-sm text-slate-500">Contact: {client.contactPerson}</div>
                              )}
                              {client.email && (
                                <div className="text-xs text-slate-400">{client.email}</div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={formState.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={formState.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Tags</label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearchTerm}
                    onChange={(e) => handleTagSearch(e.target.value)}
                    className="w-full pl-10 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pb-2 pr-1">
                  {filteredTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={formState.tags.includes(tag) ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        formState.tags.includes(tag)
                          ? 'bg-mokm-purple-500 text-white'
                          : 'hover:bg-slate-200'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {filteredTags.length === 0 && (
                    <p className="text-sm text-gray-500">No matching tags found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team & Timeline */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Team Leader *</label>
                  <select
                    value={formState.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a manager</option>
                    {managers.map(manager => (
                      <option key={manager} value={manager}>{manager}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Team Members</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTeam.map(member => (
                    <label key={member} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formState.team.includes(member)}
                        onChange={() => handleTeamToggle(member)}
                        className="rounded border-slate-300 text-mokm-purple-600 focus:ring-mokm-purple-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-slate-700">{member}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formState.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formState.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Billing Type</label>
                  <select
                    value={formState.billingType}
                    onChange={(e) => handleInputChange('billingType', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                  >
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Time & Materials">Time & Materials</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget *</label>
                  <input
                    type="number"
                    value={formState.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="Enter budget amount"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {formState.billingType === 'Hourly' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate</label>
                  <input
                    type="number"
                    value={formState.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    placeholder="Enter hourly rate"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-3">Project Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Project Name:</span>
                    <span className="font-medium">{formState.name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Client:</span>
                    <span className="font-medium">{formState.client || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Manager:</span>
                    <span className="font-medium">{formState.manager || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Team Size:</span>
                    <span className="font-medium">{formState.team.length} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Budget:</span>
                    <span className="font-medium">R{formState.budget ? parseInt(formState.budget).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">
                      {formState.startDate && formState.endDate 
                        ? `${formState.startDate} to ${formState.endDate}`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-mokm-purple-500 hover:bg-mokm-purple-600 text-white"
                  disabled={
                    (currentStep === 1 && (!formState.name || !formState.client)) ||
                    (currentStep === 2 && (!formState.manager || !formState.startDate || !formState.endDate))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-mokm-purple-500 hover:bg-mokm-purple-600 text-white"
                  disabled={!formState.budget}
                >
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProjectModal;
