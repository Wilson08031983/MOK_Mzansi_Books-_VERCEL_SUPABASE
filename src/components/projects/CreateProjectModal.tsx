
import React, { useState } from 'react';
import { X, Calendar, Users, DollarSign, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    client: '',
    manager: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    priority: 'Medium',
    budget: '',
    billingType: 'Fixed Price',
    hourlyRate: '',
    tags: [],
    team: [],
    customFields: {}
  });

  const availableTags = ['Web Development', 'Mobile', 'UI/UX', 'Backend', 'E-commerce', 'React Native', 'API', 'Database'];
  const availableTeam = ['John Smith', 'Sarah Connor', 'Mike Johnson', 'Lisa Anderson', 'Emma Brown', 'James Wilson'];
  const clients = ['ABC Corp', 'XYZ Inc', 'Tech Solutions', 'Digital Agency', 'StartUp Co'];
  const managers = ['John Smith', 'Sarah Connor', 'David Lee', 'Emma Brown'];

  const handleInputChange = (field: string, value: any) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleTeamToggle = (member: string) => {
    setProjectData(prev => ({
      ...prev,
      team: prev.team.includes(member)
        ? prev.team.filter(m => m !== member)
        : [...prev.team, member]
    }));
  };

  const handleSubmit = () => {
    const newProject = {
      ...projectData,
      id: Date.now(),
      code: `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      progress: 0,
      expenses: 0,
      createdAt: new Date().toISOString()
    };
    onSubmit(newProject);
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
                    value={projectData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client *</label>
                  <select
                    value={projectData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={projectData.description}
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
                    value={projectData.status}
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
                    value={projectData.priority}
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
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={projectData.tags.includes(tag) ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        projectData.tags.includes(tag)
                          ? 'bg-mokm-purple-500 text-white'
                          : 'hover:bg-slate-200'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team & Timeline */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Manager *</label>
                  <select
                    value={projectData.manager}
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
                        checked={projectData.team.includes(member)}
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
                    value={projectData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={projectData.endDate}
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
                    value={projectData.billingType}
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
                    value={projectData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="Enter budget amount"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mokm-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {projectData.billingType === 'Hourly' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate</label>
                  <input
                    type="number"
                    value={projectData.hourlyRate}
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
                    <span className="font-medium">{projectData.name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Client:</span>
                    <span className="font-medium">{projectData.client || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Manager:</span>
                    <span className="font-medium">{projectData.manager || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Team Size:</span>
                    <span className="font-medium">{projectData.team.length} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Budget:</span>
                    <span className="font-medium">R{projectData.budget ? parseInt(projectData.budget).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">
                      {projectData.startDate && projectData.endDate 
                        ? `${projectData.startDate} to ${projectData.endDate}`
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
                    (currentStep === 1 && (!projectData.name || !projectData.client)) ||
                    (currentStep === 2 && (!projectData.manager || !projectData.startDate || !projectData.endDate))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-mokm-purple-500 hover:bg-mokm-purple-600 text-white"
                  disabled={!projectData.budget}
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
