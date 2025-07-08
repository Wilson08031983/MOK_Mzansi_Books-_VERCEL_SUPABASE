import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Scan, Smartphone, Usb } from 'lucide-react';
import { getInventoryItemByBarcode } from '@/services/inventoryService';

interface EnhancedBarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  scannerTitle: string;
  scannerDescription?: string;
}

const EnhancedBarcodeScanner: React.FC<EnhancedBarcodeScannerProps> = ({
  onScanSuccess,
  onClose,
  scannerTitle,
  scannerDescription = "Scan a barcode using your camera or enter it manually"
}) => {
  const [activeTab, setActiveTab] = useState('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [lastDetectedBarcode, setLastDetectedBarcode] = useState<string | null>(null);
  const [isItemExists, setIsItemExists] = useState<boolean | null>(null);
  
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // USB Scanner detection - can be used by focusing on the input field
  useEffect(() => {
    // Auto-focus the manual input when USB tab is active
    if (activeTab === 'usb' && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  }, [activeTab]);

  // Initialize camera
  useEffect(() => {
    if (activeTab === 'camera') {
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            setSelectedCamera(devices[0].id);
            setIsCameraAvailable(true);
          } else {
            setIsCameraAvailable(false);
            toast({
              title: "No cameras found",
              description: "Please ensure you have allowed camera access",
              variant: "destructive",
            });
          }
        })
        .catch(err => {
          console.error("Error getting cameras", err);
          setIsCameraAvailable(false);
          toast({
            title: "Camera Error",
            description: "Could not access camera. Check permissions.",
            variant: "destructive",
          });
        });
    }

    // Cleanup function to stop scanning when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop().catch(error => console.error("Error stopping scanner:", error));
      }
    };
  }, [activeTab, toast]);

  // Start/stop camera scanning
  useEffect(() => {
    if (activeTab === 'camera' && isScanning && selectedCamera && scannerContainerRef.current) {
      // Initialize scanner if not already done
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
      }
      
      // Start scanning
      scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        },
        (decodedText) => {
          // On successful scan
          setLastDetectedBarcode(decodedText);
          
          // Check if this barcode exists in inventory
          const existingItem = getInventoryItemByBarcode(decodedText);
          setIsItemExists(!!existingItem);
          
          // Notify with sound and toast
          playBeepSound();
          toast({
            title: "Barcode Detected",
            description: `${decodedText}${existingItem ? " (Item exists)" : " (New item)"}`,
            duration: 3000,
          });
          
          // Stop scanning
          handleStopScanning();
        },
        (errorMessage) => {
          console.log("QR Code scanning error:", errorMessage);
        }
      ).catch((err) => {
        console.error("Error starting scanner:", err);
        setIsScanning(false);
        toast({
          title: "Scanner Error",
          description: "Could not start the barcode scanner",
          variant: "destructive",
        });
      });
    } else if (!isScanning && scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      // Stop scanning if it's running and we're not supposed to be scanning
      handleStopScanning();
    }
  }, [isScanning, activeTab, selectedCamera, toast]);

  // Handle stopping scanner
  const handleStopScanning = () => {
    if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch((err) => {
        console.error("Error stopping scanner:", err);
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  // Handle starting scanner
  const handleStartScanning = () => {
    setIsScanning(true);
  };

  // Handle camera change
  const handleCameraChange = (cameraId: string) => {
    if (isScanning) {
      handleStopScanning();
    }
    setSelectedCamera(cameraId);
  };

  // Handle manual barcode submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      // Check if this barcode exists in inventory
      const existingItem = getInventoryItemByBarcode(manualBarcode);
      setIsItemExists(!!existingItem);
      setLastDetectedBarcode(manualBarcode);

      // Notify with sound and toast
      playBeepSound();
      toast({
        title: "Barcode Entered",
        description: `${manualBarcode}${existingItem ? " (Item exists)" : " (New item)"}`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid barcode",
        variant: "destructive",
      });
    }
  };

  // Play beep sound on successful scan
  const playBeepSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" + Array(300).join("A"));
    audio.play().catch(error => console.error("Error playing audio:", error));
  };

  // Handle barcode confirmation
  const handleConfirmBarcode = useCallback(() => {
    if (lastDetectedBarcode) {
      onScanSuccess(lastDetectedBarcode);
      onClose();
    }
  }, [lastDetectedBarcode, onClose, onScanSuccess]);

  // Handle USB scanner input (real-time detection)
  const handleUsbInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualBarcode(value);
    
    // Detect if input is coming from a barcode scanner (usually ends with enter key or has rapid input)
    // This is a simple heuristic - barcode scanners usually input very quickly
    if (value.length > 5) {
      const existingItem = getInventoryItemByBarcode(value);
      setIsItemExists(!!existingItem);
      setLastDetectedBarcode(value);
      
      playBeepSound();
      toast({
        title: "Barcode Detected",
        description: `${value}${existingItem ? " (Item exists)" : " (New item)"}`,
        duration: 3000,
      });
    }
  };

  // Handle keydown events for barcode scanners that send Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manualBarcode.trim()) {
      e.preventDefault();
      
      const existingItem = getInventoryItemByBarcode(manualBarcode);
      setIsItemExists(!!existingItem);
      setLastDetectedBarcode(manualBarcode);
      
      playBeepSound();
      toast({
        title: "Barcode Detected",
        description: `${manualBarcode}${existingItem ? " (Item exists)" : " (New item)"}`,
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent">
            {scannerTitle}
          </DialogTitle>
          <DialogDescription>{scannerDescription}</DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>Camera</span>
            </TabsTrigger>
            <TabsTrigger value="usb" className="flex items-center gap-2">
              <Usb className="h-4 w-4" />
              <span>USB / Manual</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4 py-4">
            {!isCameraAvailable ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Smartphone className="h-12 w-12 text-slate-400 mb-2" />
                <p className="text-center text-slate-600">Camera not available</p>
                <p className="text-center text-sm text-slate-500">Please ensure you have allowed camera access</p>
                <Button onClick={() => setActiveTab('usb')} variant="outline" className="mt-2">
                  Switch to Manual Entry
                </Button>
              </div>
            ) : (
              <>
                {availableCameras.length > 1 && (
                  <div className="mb-4">
                    <Label htmlFor="camera-select">Select Camera</Label>
                    <select
                      id="camera-select"
                      value={selectedCamera || ''}
                      onChange={(e) => handleCameraChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm"
                      disabled={isScanning}
                    >
                      {availableCameras.map(camera => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="relative h-64 overflow-hidden rounded-lg border border-input">
                  <div 
                    id="scanner-container" 
                    ref={scannerContainerRef} 
                    className="w-full h-full relative"
                  >
                    {!isScanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                        <Scan className="h-12 w-12 text-slate-400 mb-2" />
                        <p className="text-center text-slate-600">Camera preview inactive</p>
                        <Button 
                          onClick={handleStartScanning} 
                          className="mt-4 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white shadow-colored hover:shadow-colored-lg"
                        >
                          Start Scanning
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isScanning && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <Button 
                        onClick={handleStopScanning} 
                        variant="secondary"
                        size="sm"
                        className="bg-white/80 backdrop-blur-sm"
                      >
                        Stop Scanning
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="usb" className="space-y-4 py-4">
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="manual-barcode">Enter Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-barcode"
                      ref={manualInputRef}
                      value={manualBarcode}
                      onChange={handleUsbInput}
                      onKeyDown={handleKeyDown}
                      placeholder="Scan or type barcode..."
                      className="flex-1"
                      autoComplete="off"
                    />
                    <Button type="submit" variant="secondary">Check</Button>
                  </div>
                  <p className="text-xs text-slate-500">USB scanner: Just point scanner at this field and scan</p>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        {lastDetectedBarcode && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Detected Barcode:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLastDetectedBarcode(null);
                    setIsItemExists(null);
                    setManualBarcode('');
                    if (activeTab === 'camera') {
                      handleStartScanning();
                    } else if (manualInputRef.current) {
                      manualInputRef.current.focus();
                    }
                  }}
                >
                  Rescan
                </Button>
              </div>
              <code className="bg-slate-100 p-2 rounded font-mono text-sm overflow-x-auto">
                {lastDetectedBarcode}
              </code>
              <p className={`text-sm ${isItemExists ? 'text-amber-600' : 'text-green-600'}`}>
                {isItemExists 
                  ? '✓ This item exists in inventory. Update stock quantity?' 
                  : '+ This is a new item. Add it to inventory?'}
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBarcode}
            disabled={!lastDetectedBarcode}
            className={lastDetectedBarcode 
              ? (isItemExists
                ? "bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg"
                : "bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white shadow-colored hover:shadow-colored-lg")
              : ""}
          >
            {lastDetectedBarcode
              ? (isItemExists ? "Update Item" : "Add New Item")
              : "Confirm"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBarcodeScanner;
