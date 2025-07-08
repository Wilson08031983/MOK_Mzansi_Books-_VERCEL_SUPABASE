import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, ScanLine, X, RefreshCw, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  title?: string;
}

// Define the correct camera device type outside the component
interface CameraDevice {
  id: string;
  label: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  isOpen, 
  onClose, 
  onBarcodeDetected,
  title = "Scan Barcode"
}) => {
  const [activeTab, setActiveTab] = useState<string>('camera');
  const [scannerInitialized, setScannerInitialized] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [scannerMessage, setScannerMessage] = useState<string>('Position barcode within the frame');
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Stop scanning - defined first to avoid reference issues
  const stopScanner = useCallback(() => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().catch(err => {
        console.error('Error stopping scanner:', err);
      }).finally(() => {
        setIsScanning(false);
      });
    }
  }, [isScanning]);
  
  // Refresh devices list
  const loadCameraDevices = useCallback(async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length) {
        setDevices(cameras);
        setSelectedDeviceId(cameras[0].id);
      } else {
        setScannerMessage('No camera devices found');
      }
    } catch (error) {
      console.error('Error getting cameras', error);
      setScannerMessage('Error accessing camera');
    }
  }, []);
  
  // Initialize the scanner
  const initializeScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    
    // Stop any existing scanner
    stopScanner();
    
    try {
      // Load available cameras
      await loadCameraDevices();
      
      // Create new scanner instance
      html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id);
      setScannerInitialized(true);
    } catch (err) {
      console.error('Error initializing scanner:', err);
      setScannerMessage('Failed to initialize camera');
      setScannerInitialized(false);
    }
  }, [loadCameraDevices, stopScanner]);

  // Initialize scanner when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      initializeScanner();
      return () => {
        stopScanner();
      };
    }
  }, [isOpen, activeTab, initializeScanner, stopScanner]);

  // Start scanning with the selected camera
  const startScanner = async () => {
    if (!html5QrCodeRef.current || !selectedDeviceId) return;
    
    try {
      setIsScanning(true);
      setScannerMessage('Scanning...');
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
      };
      
      await html5QrCodeRef.current.start(
        selectedDeviceId,
        config,
        (decodedText) => {
          // On successful scan
          toast({
            title: 'Barcode Detected',
            description: `Scanned: ${decodedText}`,
          });
          handleBarcodeDetected(decodedText);
        },
        (errorMessage) => {
          // On error - but don't show these as they're expected during scanning
          console.debug('QR Code Error:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setScannerMessage('Failed to start camera');
      setIsScanning(false);
    }
  };

  // Switch camera
  const switchCamera = async () => {
    stopScanner();
    await loadCameraDevices();
    if (devices.length > 1) {
      // Find current device index and switch to the next one
      const currentIndex = devices.findIndex(d => d.id === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDeviceId(devices[nextIndex].id);
    }
  };

  // Handle barcode detection
  const handleBarcodeDetected = (barcode: string) => {
    stopScanner();
    onBarcodeDetected(barcode);
    onClose();
  };

  // Handle manual barcode entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current = null;
      }
    };
  }, [stopScanner]);

  return (
    <Dialog open={isOpen} onOpenChange={() => { stopScanner(); onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(tab) => {
          stopScanner();
          setActiveTab(tab);
        }} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" /> Camera Scanner
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500">{scannerMessage}</div>
              
              <div className="flex gap-2">
                {isScanning ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={stopScanner}
                    className="flex items-center gap-1 shadow-business"
                  >
                    <X className="h-3.5 w-3.5" /> Stop
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={startScanner}
                    className="bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg"
                    disabled={!scannerInitialized || !selectedDeviceId}
                  >
                    <Camera className="h-3.5 w-3.5 mr-1" /> Start Scan
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  disabled={isScanning || devices.length <= 1}
                  className="shadow-business"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div 
              id="barcode-scanner-element" 
              ref={scannerRef}
              className={cn(
                "relative w-full h-[280px] mb-4 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border-2",
                isScanning ? "border-mokm-pink-500" : "border-slate-200"
              )}
            >
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80">
                  <Camera className="h-12 w-12 text-slate-300 mb-2" />
                  <span className="text-sm text-slate-500">
                    {scannerInitialized 
                      ? "Click 'Start Scan' to begin" 
                      : "Initializing camera..."}
                  </span>
                </div>
              )}
              
              {isScanning && (
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-mokm-pink-500 animate-[scan_2s_ease-in-out_infinite]" />
              )}
            </div>
            
            <div className="text-sm text-slate-600 mt-2">
              <p>You can also use a USB barcode scanner by connecting it to your device.</p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-barcode">Barcode</Label>
                <Input
                  id="manual-barcode"
                  type="text"
                  placeholder="Enter or scan barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="shadow-business"
                  // Handle input from USB scanner
                  onKeyDown={(e) => {
                    // Most USB scanners send an Enter key after scanning
                    if (e.key === 'Enter' && manualBarcode) {
                      e.preventDefault();
                      handleBarcodeDetected(manualBarcode);
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Connect a USB barcode scanner to scan directly into this field or manually type the barcode.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={!manualBarcode.trim()}
                className="w-full bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg"
              >
                Submit
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => { stopScanner(); onClose(); }} className="w-full sm:w-auto shadow-business">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;

// Add this to global CSS for scanning animation
// @keyframes scan {
//   0%, 100% {
//     transform: translateY(-100px);
//   }
//   50% {
//     transform: translateY(100px);
//   }
// }
