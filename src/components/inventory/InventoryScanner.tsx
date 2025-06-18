import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Scan, Smartphone, Keyboard, AlertCircle, Loader2 } from 'lucide-react';
import Quagga from 'quagga';

// Define types for Quagga result
interface QuaggaBox {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface QuaggaCodeResult {
  code: string;
  format: string;
}

interface QuaggaResult {
  boxes?: QuaggaBox[];
  box?: QuaggaBox;
  codeResult?: QuaggaCodeResult;
  line?: {x: number; y: number}[];
}

interface InventoryScannerProps {
  onClose: () => void;
  onResult: (barcode: string) => void;
}

const InventoryScanner: React.FC<InventoryScannerProps> = ({ onClose, onResult }) => {
  const [activeTab, setActiveTab] = useState('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissions, setPermissions] = useState<{camera: boolean}>({
    camera: false
  });
  const [scanning, setScanning] = useState(false);

  // Process each frame
  const handleProcessed = useCallback((result: QuaggaResult | null) => {
    if (!result) return;
    
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;

    if (result.boxes) {
      drawingCtx.clearRect(
        0, 0, parseInt(drawingCanvas.getAttribute("width")), 
        parseInt(drawingCanvas.getAttribute("height"))
      );
      result.boxes.filter((box: QuaggaBox) => box !== result.box).forEach((box: QuaggaBox) => {
        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
          color: "green",
          lineWidth: 2
        });
      });
    }

    if (result.box) {
      Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
        color: "#00F",
        lineWidth: 2
      });
    }

    if (result.codeResult && result.codeResult.code) {
      Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
        color: 'red',
        lineWidth: 3
      });
    }
  }, []);

  // Handle successful barcode detection
  const handleBarcodeDetected = useCallback((data: { codeResult: QuaggaCodeResult }) => {
    // Play beep sound for success
    const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
    beep.play().catch(e => console.log('Audio play failed:', e));
    
    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    console.log('Barcode detected:', data.codeResult.code);
    setIsCameraActive(false);
    Quagga.stop();
    onResult(data.codeResult.code);
  }, [onResult]);

  // Stop Quagga scanner
  const stopCamera = useCallback(() => {
    // Stop Quagga if it's running
    Quagga.stop();
    
    // Also stop direct video if we have access to it
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream?.getTracks() || [];
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setScanning(false);
  }, []);

  // Initialize Quagga for barcode detection
  const initQuagga = useCallback(() => {
    if (!document.getElementById('interactive')) {
      return;
    }
    
    setScanning(true);
    
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.getElementById('interactive'),
        constraints: {
          width: 480,
          height: 320,
          facingMode: 'environment', // or 'user' for front camera
        },
      },
      decoder: {
        readers: [
          'ean_reader',
          'ean_8_reader',
          'code_128_reader',
          'code_39_reader',
          'code_39_vin_reader',
          'codabar_reader',
          'upc_reader',
          'upc_e_reader',
          'i2of5_reader'
        ],
        multiple: false,
      },
      locate: true,
      frequency: 10,
    }, (err: Error | null) => {
      if (err) {
        console.error('Error initializing Quagga:', err);
        setError('Failed to initialize barcode scanner');
        setScanning(false);
        return;
      }
      
      console.log('Quagga initialized successfully');
      setIsCameraActive(true);
      setScanning(false);
      
      // Start Quagga
      Quagga.start();
      
      // Set up detection callback
      Quagga.onDetected(handleBarcodeDetected);
      Quagga.onProcessed(handleProcessed);
    });
  }, [handleBarcodeDetected, handleProcessed]);
  
  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return;
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser does not support camera access');
        return;
      }

      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer back camera on mobile
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      });

      setPermissions({...permissions, camera: true });
      setError(null);
      
      // Start Quagga instead of setting video source directly
      initQuagga();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
    }
  }, [permissions, setPermissions, setError, initQuagga]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    onResult(manualBarcode);
  };
  
  // Start/stop camera based on active tab
  useEffect(() => {
    if (activeTab === 'camera' && !isCameraActive) {
      startCamera();
    } else if (activeTab !== 'camera' && isCameraActive) {
      stopCamera();
    }
  }, [activeTab, isCameraActive, startCamera, stopCamera]);

  const captureFrame = () => {
    if (!canvasRef.current || !document.getElementById('interactive')) return;
    
    const video = document.querySelector('#interactive video') as HTMLVideoElement;
    if (!video) return;
    
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Process the frame for barcodes
    const imageData = canvas.toDataURL('image/png');
    
    // We could use Quagga.decodeSingle here, but for simplicity,
    // we'll rely on the continuous scanning already happening
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" /> Barcode Scanner
          </DialogTitle>
          <DialogDescription>
            Scan a barcode using your camera, mobile device, or barcode scanner.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="camera" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" /> Camera
            </TabsTrigger>
            <TabsTrigger value="hardware" className="flex items-center gap-2">
              <Scan className="h-4 w-4" /> Hardware Scanner
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" /> Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              {!permissions.camera ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={startCamera} className="gap-2">
                    <Camera className="h-4 w-4" /> Start Camera
                  </Button>
                </div>
              ) : scanning ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-mokm-orange-500" />
                  <span className="ml-2">Initializing scanner...</span>
                </div>
              ) : null}
              
              <div id="interactive" className="viewport w-full h-full">
                {/* Quagga will insert the video here */}
              </div>
              
              {isCameraActive && (
                <>
                  <div className="absolute inset-0 border-2 border-yellow-400 rounded-md opacity-50 pointer-events-none" />
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="outline" onClick={captureFrame}>
                      Capture Frame
                    </Button>
                  </div>
                </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <p className="text-center text-sm text-slate-500">
              Position the barcode within the frame and hold steady
            </p>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "mokmzansibooks://scan"}
                className="flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4" /> Open in Mobile App
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="hardware" className="space-y-4">
            <div className="border rounded-md p-4">
              <Label htmlFor="hardware-input">Hardware Scanner Input</Label>
              <Input 
                id="hardware-input" 
                placeholder="Scanner will input here automatically"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                Connect your barcode scanner device and scan any item. Input will be captured automatically.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manual-barcode">Barcode Number</Label>
                  <Input 
                    id="manual-barcode" 
                    value={manualBarcode} 
                    onChange={(e) => setManualBarcode(e.target.value)} 
                    placeholder="Enter barcode number..."
                  />
                </div>
                <Button type="submit" className="w-full">Submit</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryScanner;
