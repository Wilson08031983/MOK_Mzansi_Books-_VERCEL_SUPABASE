/**
 * File Snippet Component
 * Displays uploaded files as clickable thumbnails with actions
 */

import React from 'react';
import { Eye, Download, Trash2, RotateCcw, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReceiptFile, BankStatementFile } from '../../services/fileStorageService';

interface FileSnippetProps {
  file: ReceiptFile | BankStatementFile;
  type: 'receipt' | 'statement';
  onView: () => void;
  onReplace?: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  className?: string;
}

const FileSnippet: React.FC<FileSnippetProps> = ({
  file,
  type,
  onView,
  onReplace,
  onDelete,
  onDownload,
  className = ''
}) => {
  const getFileIcon = () => {
    if (file.fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.fileType === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateFilename = (filename: string, maxLength: number = 20) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...';
    return `${truncatedName}.${extension}`;
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.base64Data;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className={`glass backdrop-blur-sm bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 hover:border-white/20 hover:bg-gradient-to-br hover:from-slate-700/90 hover:to-slate-800/90 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${className}`}>
      <div className="p-4">
        {/* Thumbnail and File Info */}
        <div className="flex items-start space-x-3" onClick={onView}>
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {file.thumbnailData ? (
              <img
                src={file.thumbnailData}
                alt={file.filename}
                className="w-16 h-12 object-cover rounded-lg border border-white/20 shadow-sm"
              />
            ) : (
              <div className="w-16 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-white/20 flex items-center justify-center shadow-sm">
                {getFileIcon()}
              </div>
            )}
          </div>
          
          {/* File Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {getFileIcon()}
              <h4 className="text-sm font-medium text-white font-sf-pro truncate" title={file.filename}>
                {truncateFilename(file.filename)}
              </h4>
            </div>
            
            <div className="text-xs text-slate-300 space-y-1 font-sf-pro">
              <div>{file.fileSize} • {formatDate(file.uploadDate)}</div>
              
              {/* Type-specific info */}
              {type === 'statement' && 'bankName' in file && file.bankName && (
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="text-xs border-white/20 text-slate-200 bg-white/5 font-sf-pro">
                    {file.bankName}
                  </Badge>
                  {file.statementPeriod && (
                    <Badge variant="outline" className="text-xs border-white/20 text-slate-200 bg-white/5 font-sf-pro">
                      {file.statementPeriod}
                    </Badge>
                  )}
                </div>
              )}
              
              {type === 'receipt' && 'status' in file && (
                <Badge 
                  variant={file.status === 'Attached' ? 'default' : file.status === 'Rejected' ? 'destructive' : 'secondary'}
                  className="text-xs font-sf-pro"
                >
                  {file.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="text-mokm-blue-400 hover:text-mokm-blue-300 hover:bg-mokm-blue-500/10 text-xs font-sf-pro transition-all duration-200 rounded-lg"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <div className="flex items-center space-x-1">
            {onReplace && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReplace}
                className="text-mokm-yellow-400 hover:text-mokm-yellow-300 hover:bg-mokm-yellow-500/10 text-xs font-sf-pro transition-all duration-200 rounded-lg"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Replace
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-mokm-green-400 hover:text-mokm-green-300 hover:bg-mokm-green-500/10 text-xs font-sf-pro transition-all duration-200 rounded-lg"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-mokm-red-400 hover:text-mokm-red-300 hover:bg-mokm-red-500/10 text-xs font-sf-pro transition-all duration-200 rounded-lg"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FileSnippet;