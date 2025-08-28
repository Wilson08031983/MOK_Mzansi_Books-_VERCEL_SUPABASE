import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Camera, Scan, Smartphone, Keyboard, AlertCircle, Loader2, Package2, History, ShoppingCart } from 'lucide-react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '@/components/ui/table';
import BarcodeScanner from './BarcodeScanner';
import { 
  getAllInventoryItems,
  getInventoryItemByBarcode, 
  getAllStockHistory 
} from '@/services/inventoryService';
import { getInvoices } from '@/services/invoiceService';
import { getQuotations } from '@/services/quotationService';
import { InventoryItem, StockHistoryEntry } from '@/types/inventory';
import { useLocalization } from '@/hooks/useLocalization';
import { Invoice, InvoiceItem } from '@/types/invoice';

// Helper function to get the status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in stock':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'low stock':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'out of stock':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'damaged':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
  }
};

interface ProductScanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductSalesEntry {
  type: 'Invoice' | 'Quotation';
  id: string;
  date: string;
  clientName: string;
  quantity: number;
  amount: number;
}

const ProductScanDetailModal: React.FC<ProductScanDetailModalProps> = ({
  isOpen,
  onClose
}) => {
  const { formatCurrency, getCurrencySymbol } = useLocalization();
  const [activeTab, setActiveTab] = useState('scan');
  const [manualBarcode, setManualBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [salesHistory, setSalesHistory] = useState<ProductSalesEntry[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && activeTab === 'manual' && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeTab]);
  
  const fetchProductDetails = (barcode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find product by barcode
      const foundProduct = getInventoryItemByBarcode(barcode);
      
      if (!foundProduct) {
        setError(`No product found with barcode ${barcode}`);
        setProduct(null);
        setStockHistory([]);
        setSalesHistory([]);
        setIsLoading(false);
        return;
      }
      
      setProduct(foundProduct);
      
      // Get stock history for this product
      const allStockHistory = getAllStockHistory();
      const productStockHistory = allStockHistory.filter(
        entry => entry.inventoryItemId === foundProduct.id
      );
      setStockHistory(productStockHistory);
      
      // Get sales history from invoices and quotations
      const allInvoices = getInvoices();
      const allQuotations = getQuotations();
      
      // Process invoice sales data
      const invoiceSales = allInvoices.flatMap(invoice => {
        return invoice.items
          .filter(item => {
            // Check for product ID match
            return item.id === foundProduct.id || 
              // Some invoice items might have a description that contains the barcode
              (item.description && item.description.includes(foundProduct.barcode));
          })
          .map(item => ({
            type: 'Invoice' as const,
            id: invoice.id,
            date: invoice.date,
            clientName: invoice.clientName || 'Unknown Client',
            quantity: item.quantity,
            amount: item.amount
          }));
      });
      
      // Process quotation sales data
      const quotationSales = allQuotations.flatMap(quotation => {
        return quotation.items
          .filter(item => {
            // Check for product ID match
            return item.id === foundProduct.id || 
              // Some quotation items might have a description that contains the barcode
              (item.description && item.description.includes(foundProduct.barcode));
          })
          .map(item => ({
            type: 'Quotation' as const,
            id: quotation.id,
            date: quotation.date,
            clientName: quotation.clientEmail || quotation.clientContact || quotation.client || 'Unknown Client',
            quantity: item.quantity,
            amount: item.amount
          }));
      });
      
      const combinedSalesHistory = [...invoiceSales, ...quotationSales]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setSalesHistory(combinedSalesHistory);
      
      // Switch to product details tab
      setActiveTab('details');
      
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('An error occurred while fetching product details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBarcodeDetected = (barcode: string) => {
    setManualBarcode(barcode);
    fetchProductDetails(barcode);
    setShowScanner(false);
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    fetchProductDetails(manualBarcode.trim());
  };
  
  const getHistoryTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'damage':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
    }
  };
  
  const getItemImageUrl = (item: InventoryItem | null) => {
    if (!item) return '/placeholder-product.png';
    
    if (item.images && item.images.length > 0) {
      return item.images[0];
    } else if (item.image) {
      return item.image;
    } else {
      return '/placeholder-product.png';
    }
  };
  
  const resetScan = () => {
    setManualBarcode('');
    setProduct(null);
    setStockHistory([]);
    setSalesHistory([]);
    setActiveTab('scan');
    setError(null);
  };
  
  const totalSold = salesHistory.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalSalesValue = salesHistory.reduce((sum, entry) => sum + entry.amount, 0);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'details' && product ? 'Product Details' : 'Scan Product Barcode'}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'details' && product ? 
              `${product.name} (${product.barcode})` : 
              'Scan or enter a barcode to view product information'
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading product information...</p>
          </div>
        )}
        
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {!product && (
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Scan Barcode
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" /> Manual Entry
                </TabsTrigger>
              </TabsList>
            )}
            
            {/* Scan Tab */}
            <TabsContent value="scan" className="mt-0">
              <div className="flex flex-col items-center justify-center py-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowScanner(true)}
                  className="mb-4 flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" /> Open Camera Scanner
                </Button>
                
                <p className="text-sm text-muted-foreground text-center mb-4">
                  You can also use a USB barcode scanner or manually enter the barcode
                </p>
                
                <Button 
                  variant="secondary" 
                  onClick={() => setActiveTab('manual')}
                  className="flex items-center gap-2"
                >
                  <Keyboard className="h-4 w-4" /> Enter Barcode Manually
                </Button>
              </div>
              
              {showScanner && (
                <BarcodeScanner 
                  isOpen={showScanner}
                  onClose={() => setShowScanner(false)}
                  onBarcodeDetected={handleBarcodeDetected}
                />
              )}
            </TabsContent>
            
            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="mt-0">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Input
                    id="barcode"
                    ref={barcodeInputRef}
                    placeholder="Enter barcode..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="w-full"
                    autoComplete="off"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={!manualBarcode.trim() || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Scan className="mr-2 h-4 w-4" />
                        Find Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* Product Details Tab */}
            {product && (
              <TabsContent value="details" className="space-y-4 mt-0">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center justify-center md:w-1/3">
                    <div className="rounded-md overflow-hidden border w-full h-48 flex items-center justify-center bg-slate-100">
                      <img 
                        src={getItemImageUrl(product)} 
                        alt={product.name}
                        className="object-contain max-h-full max-w-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 space-y-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Category:</div>
                      <div>{product.category || 'Uncategorized'}</div>
                      
                      <div className="font-medium">Barcode:</div>
                      <div>{product.barcode}</div>
                      
                      <div className="font-medium">In Stock:</div>
                      <div>
                        <Badge className={
                          product.stockLevel > 0 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }>
                          {product.stockLevel} units
                        </Badge>
                      </div>
                      
                      <div className="font-medium">Price:</div>
                      <div>{typeof product.price === 'number' ? formatCurrency(product.price) : formatCurrency(0)}</div>
                      
                      <div className="font-medium">Status:</div>
                      <div>
                        <Badge className={getStatusColor(product.status || 'In Stock')}>
                          {product.status || 'In Stock'}
                        </Badge>
                      </div>
                      
                      <div className="font-medium">Location:</div>
                      <div>{product.location || 'Not specified'}</div>
                      
                      <div className="font-medium">Last Updated:</div>
                      <div>{product.lastUpdated ? new Date(product.lastUpdated).toLocaleDateString() : 'Never'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Tabs for Stock History and Sales History */}
                <Tabs defaultValue="stock-history" className="w-full">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="stock-history" className="flex items-center gap-2">
                      <History className="h-4 w-4" /> Stock History
                    </TabsTrigger>
                    <TabsTrigger value="sales-history" className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Sales History
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Stock History Tab */}
                  <TabsContent value="stock-history">
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Updated By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockHistory.length > 0 ? (
                            stockHistory
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((entry, index) => (
                                <TableRow key={`stock-history-${index}`}>
                                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Badge className={getHistoryTypeBadgeClass(entry.type)}>
                                      {entry.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{entry.quantity}</TableCell>
                                  <TableCell>{entry.notes || '-'}</TableCell>
                                  <TableCell>{entry.performedBy || 'System'}</TableCell>
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                No stock history available for this product
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  {/* Sales History Tab */}
                  <TabsContent value="sales-history">
                    <div className="border rounded-md mb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Amount ({getCurrencySymbol()})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesHistory.length > 0 ? (
                            salesHistory.map((entry, index) => (
                              <TableRow key={`sales-history-${index}`}>
                                <TableCell>
                                  <Badge className={
                                    entry.type === 'Invoice' 
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                  }>
                                    {entry.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                <TableCell>{entry.clientName}</TableCell>
                                <TableCell>{entry.quantity}</TableCell>
                                <TableCell>{formatCurrency(entry.amount)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                No sales history available for this product
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {salesHistory.length > 0 && (
                      <div className="text-sm flex justify-end gap-8">
                        <div>
                          <span className="font-medium">Total Qty Sold: </span>
                          <span>{totalSold}</span>
                        </div>
                        <div>
                          <span className="font-medium">Total Value: </span>
                          <span>{formatCurrency(totalSalesValue)}</span>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            )}
          </Tabs>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          {product && (
            <Button 
              variant="secondary" 
              onClick={resetScan}
              className="flex-1 sm:flex-none"
            >
              Scan Another
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductScanDetailModal;
