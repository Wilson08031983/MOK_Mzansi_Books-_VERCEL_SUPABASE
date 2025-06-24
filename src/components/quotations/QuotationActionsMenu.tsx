import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Edit, Send, FileDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuotationActionsMenuProps {
  quotation: {
    id: string;
    number: string;
    clientEmail: string;
  };
  onDelete: (id: string) => void;
}

const QuotationActionsMenu: React.FC<QuotationActionsMenuProps> = ({ quotation, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const handleView = () => {
    toast.info(`Viewing ${quotation.number}`);
    console.log(`View quotation: ${quotation.id}`);
  };

  const handleEdit = () => {
    toast.info(`Editing ${quotation.number}`);
    console.log(`Edit quotation: ${quotation.id}`);
  };

  const handleSend = () => {
    setIsSendDialogOpen(true);
  };

  const confirmSend = () => {
    toast.success(`Quotation sent to ${quotation.clientEmail}`);
    setIsSendDialogOpen(false);
  };

  const handleDownload = () => {
    toast.info(`Preparing PDF download for ${quotation.number}`);
    console.log(`Download PDF for ${quotation.number}`);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(quotation.id);
    toast.success(`Quotation ${quotation.number} deleted`);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-sf-pro">
          <DropdownMenuItem onClick={handleView} className="cursor-pointer">
            <Eye className="h-4 w-4 mr-2" />
            <span>View Quotation</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            <span>Edit Quotation</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSend} className="cursor-pointer">
            <Send className="h-4 w-4 mr-2" />
            <span>Send Quotation</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
            <FileDown className="h-4 w-4 mr-2" />
            <span>Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Delete Quotation</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="font-sf-pro">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete quotation {quotation.number}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <AlertDialogContent className="font-sf-pro">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Send quotation {quotation.number} to {quotation.clientEmail}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSend}
              className="bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600 text-white"
            >
              Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuotationActionsMenu;
