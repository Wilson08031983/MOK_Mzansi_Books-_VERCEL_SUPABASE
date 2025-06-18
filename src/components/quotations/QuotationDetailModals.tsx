
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trash2,
  Loader2
} from 'lucide-react';

interface QuotationDetailModalsProps {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  handleDelete: () => void;
  actionLoading: boolean;
}

const QuotationDetailModals: React.FC<QuotationDetailModalsProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  handleDelete,
  actionLoading
}) => {
  if (!showDeleteModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="text-slate-900 font-sf-pro">Delete Quotation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-6 font-sf-pro">
            Are you sure you want to delete this quotation? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="font-sf-pro rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-sf-pro rounded-xl"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationDetailModals;
