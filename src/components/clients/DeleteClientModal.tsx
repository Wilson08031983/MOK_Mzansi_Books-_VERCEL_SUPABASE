
import React from 'react';

interface DeleteClientModalProps {
  isOpen: boolean;
  clientName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  isOpen,
  clientName,
  loading,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="glass backdrop-blur-sm bg-white/90 border border-white/20 shadow-business rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-red-600 mb-4 font-sf-pro">Delete Client</h3>
        <p className="text-slate-700 mb-4 font-sf-pro">
          Are you sure you want to delete <span className="font-medium">{clientName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-sf-pro"
          >
            {loading ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>
    </div>
  );
};
