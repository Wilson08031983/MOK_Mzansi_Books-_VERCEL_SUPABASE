import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageUploadProps {
  onImageChange: (images: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageChange, 
  existingImages = [],
  maxImages = 5 
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Check if we would exceed the max number of images
      if (images.length + filesArray.length > maxImages) {
        alert(`You can only upload a maximum of ${maxImages} images`);
        return;
      }
      
      // Process each file
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prevImages => {
              const newImages = [...prevImages, e.target!.result as string];
              onImageChange(newImages); // Notify parent component
              return newImages;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  // Open file selection dialog
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle camera capture
  const openCamera = async () => {
    setIsCameraOpen(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment' // Prefer back camera if available
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
      setIsCameraOpen(false);
    }
  };
  
  // Close camera and clean up
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraOpen(false);
  };
  
  // Take photo from camera
  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // Add to images array
        setImages(prevImages => {
          if (prevImages.length >= maxImages) {
            alert(`You can only upload a maximum of ${maxImages} images`);
            return prevImages;
          }
          
          const newImages = [...prevImages, imageDataUrl];
          onImageChange(newImages); // Notify parent component
          return newImages;
        });
      }
      
      // Close camera after capturing
      closeCamera();
    }
  };
  
  // Remove an image
  const removeImage = (index: number) => {
    setImages(prevImages => {
      const newImages = prevImages.filter((_, i) => i !== index);
      onImageChange(newImages); // Notify parent component
      return newImages;
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Existing images */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Uploaded Images</h3>
          <div className="flex flex-wrap gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img 
                    src={img} 
                    alt={`Product image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 
                             text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload buttons */}
      <div className="flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleBrowseClick} 
          disabled={images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> Upload
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={openCamera} 
          disabled={images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" /> Take Photo
        </Button>
        
        {images.length > 0 && (
          <span className="text-xs text-slate-500">
            {images.length}/{maxImages} images
          </span>
        )}
      </div>
      
      {/* Camera dialog */}
      <Dialog open={isCameraOpen} onOpenChange={open => !open && closeCamera()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take Photo</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeCamera}
              >
                Cancel
              </Button>
              
              <Button 
                type="button" 
                onClick={captureImage}
                className="bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white"
              >
                <Camera className="h-4 w-4 mr-2" /> Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
