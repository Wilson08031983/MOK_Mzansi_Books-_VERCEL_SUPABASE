/**
 * Document Viewer Modal Component
 * Displays uploaded documents (images and PDFs) in a full-screen modal
 */

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: {
    filename: string;
    fileType: string;
    base64Data: string;
    fileSize: string;
  } | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  fileData
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!fileData) return;
    
    const link = document.createElement('a');
    link.href = fileData.base64Data;
    link.download = fileData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFitToWidth = () => {
    setZoom(100);
  };

  if (!fileData) return null;

  const isPDF = fileData.fileType === 'application/pdf';
  const isImage = fileData.fileType.startsWith('image/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95">
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-white font-medium truncate max-w-md">
                {fileData.filename}
              </h3>
              <span className="text-gray-400 text-sm">
                {fileData.fileSize}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isImage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="text-white hover:bg-white/10"
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-white text-sm min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="text-white hover:bg-white/10"
                    disabled={zoom >= 300}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFitToWidth}
                    className="text-white hover:bg-white/10"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotate}
                    className="text-white hover:bg-white/10"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex items-center justify-center w-full h-full pt-20 pb-4 px-4">
          {isPDF ? (
            <iframe
              src={fileData.base64Data}
              className="w-full h-full border-0 rounded-lg"
              title={fileData.filename}
            />
          ) : isImage ? (
            <div className="flex items-center justify-center w-full h-full overflow-auto">
              <img
                src={fileData.base64Data}
                alt={fileData.filename}
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <p className="text-lg mb-2">Preview not available</p>
              <p className="text-gray-400 text-sm mb-4">
                File type {fileData.fileType} is not supported for preview
              </p>
              <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;