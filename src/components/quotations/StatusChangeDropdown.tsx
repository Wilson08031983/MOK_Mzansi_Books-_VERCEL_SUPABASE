import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  CheckCircle,
  XCircle,
  FileText,
  Send,
  Eye,
  Clock,
  AlertTriangle,
  LoaderCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VALID_STATUSES } from '@/constants/quotationStatuses';

interface StatusChangeDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusChangeDropdown: React.FC<StatusChangeDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = '',
  isLoading = false,
  showIcon = true,
  size = 'md'
}) => {
  const [open, setOpen] = useState(false);

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-400" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'draft':
      case 'saved':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Get human-readable display status
  const getDisplayStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status color based on status
  const getStatusColor = (status: string) => {
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

  // Button sizing classes based on size prop
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      case 'md':
      default:
        return 'px-2.5 py-1 text-xs';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled || isLoading}>
        <button
          className={cn(
            `inline-flex items-center rounded-full font-medium border transition-all
            ${getStatusColor(currentStatus)} ${getSizeClasses()}
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`,
            className
          )}
        >
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 mr-1.5 animate-spin" />
          ) : showIcon ? (
            <span className="mr-1.5 flex-shrink-0">
              {getStatusIcon(currentStatus)}
            </span>
          ) : null}
          <span className="truncate">
            {getDisplayStatus(currentStatus)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52" align="start">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {VALID_STATUSES.map((status) => (
                <CommandItem
                  key={status}
                  value={status}
                  onSelect={() => {
                    onStatusChange(status);
                    setOpen(false);
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <span className="mr-2">{getStatusIcon(status)}</span>
                  <span>{getDisplayStatus(status)}</span>
                  {currentStatus === status && (
                    <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StatusChangeDropdown;
