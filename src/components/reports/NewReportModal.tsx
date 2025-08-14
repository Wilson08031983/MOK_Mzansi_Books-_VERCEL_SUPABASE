import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { reportsDataService } from '../../services/reportsDataService';
import type { Report, ReportCategory } from '../../pages/Reports';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: Report) => void;
  selectedCategory?: ReportCategory | null;
}

const reportCategories: { value: ReportCategory; label: string }[] = [
  { value: 'financial', label: 'Financial' },
  { value: 'sales', label: 'Sales' },
  { value: 'client', label: 'Client' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'expense', label: 'Expense' },
  { value: 'project', label: 'Project' },
  { value: 'hr', label: 'HR' },
  { value: 'document', label: 'Document' },
  { value: 'system', label: 'System' },
  { value: 'custom', label: 'Custom' },
];

const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
  selectedCategory
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: selectedCategory || 'custom' as ReportCategory,
    tags: [] as string[],
    createdBy: 'User'
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Report name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Report description is required');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 [NEW REPORT] Creating custom report:', formData);
      
      const newReport = reportsDataService.saveReport({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        createdBy: formData.createdBy,
        isFavorite: false,
        tags: formData.tags
      });

      console.log('✅ [NEW REPORT] Report created successfully:', newReport);
      
      onReportCreated(newReport);
      toast.success('Report created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: selectedCategory || 'custom',
        tags: [],
        createdBy: 'User'
      });
      setNewTag('');
      onClose();
      
    } catch (error) {
      console.error('❌ [NEW REPORT] Error creating report:', error);
      toast.error('Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 bg-clip-text text-transparent">
            Create New Report
          </DialogTitle>
          <DialogDescription>
            Create a custom report to track and analyze your business data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Report Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Sales Report"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="focus:ring-mokm-purple-500 focus:border-mokm-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ReportCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="focus:ring-mokm-purple-500 focus:border-mokm-purple-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {reportCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this report will show and its purpose..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px] focus:ring-mokm-purple-500 focus:border-mokm-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="focus:ring-mokm-purple-500 focus:border-mokm-purple-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-gray-500 hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdBy">Created By</Label>
            <Input
              id="createdBy"
              value={formData.createdBy}
              onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
              className="focus:ring-mokm-purple-500 focus:border-mokm-purple-500"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white shadow-business hover:shadow-business-lg transition-all duration-300"
            >
              {isSubmitting ? 'Creating...' : 'Create Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewReportModal;
