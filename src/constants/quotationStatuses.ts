// Define valid quotation status options
export const VALID_STATUSES = [
  'draft',
  'saved',
  'sent',
  'viewed',
  'accepted',
  'rejected',
  'expired',
  'cancelled'
] as const;

export type QuotationStatus = typeof VALID_STATUSES[number];

// Get status icon based on status
export const getStatusIcon = (status: string) => {
  // The actual icon components will be imported in the components that need them
  return status;
};

// Get human-readable display status
export const getDisplayStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Get status color based on status
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'sent':
    case 'viewed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'expired':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'draft':
    case 'saved':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};
