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
      return 'bg-success/10 text-success border-success/20';
    case 'sent':
    case 'viewed':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'expired':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'rejected':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'cancelled':
      return 'bg-muted text-muted-foreground border-border';
    case 'draft':
    case 'saved':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted/50 text-muted-foreground border-border';
  }
};
