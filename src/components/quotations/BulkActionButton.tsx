
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface BulkActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  hoverColor?: string;
}

const BulkActionButton: React.FC<BulkActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  hoverColor = 'hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300'
}) => {
  const baseClasses = "font-sf-pro rounded-lg";
  const variantClasses = variant === 'destructive' 
    ? "text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
    : hoverColor;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default BulkActionButton;
