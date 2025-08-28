import React, { useState, useEffect, useCallback } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  PlusCircle,
  Pencil,
  X,
  AlertTriangle,
  Search,
  Filter,
  Map,
  Package,
  Warehouse,
  QrCode,
  Loader2,
  PackageOpen,
  ArrowLeft,
  ChevronLeft,
  Plus,
  Download,
  FileBarChart,
  Printer,
  Scan,
  Store,
  Truck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Component imports
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryScanner from '@/components/inventory/InventoryScanner';
import ProductScanDetailModal from '@/components/inventory/ProductScanDetailModal';
import NewStockForm from '@/components/inventory/NewStockForm';
import UpdateStockForm from '@/components/inventory/UpdateStockForm';
import ReceiveStockForm from '@/components/inventory/ReceiveStockForm';
import DamageStockForm from '@/components/inventory/DamageStockForm';
import AddSupplierModal from '@/components/inventory/AddSupplierModal';
import AddStorageModal from '@/components/inventory/AddStorageModal';
import UpdateStockWithBarcodeModal from '@/components/inventory/UpdateStockWithBarcodeModal';
import SalesModal from '@/components/inventory/SalesModal';
import DashboardBackground from '@/components/dashboard/DashboardBackground';

// Notifications
import { addNotification, getNotifications } from '@/services/notificationService';

// Service imports
import { 
  getAllInventoryItems, 
  getItemStockHistory, 
  getAllStockHistory, 
  initializeInventoryData,
  deleteInventoryItem
} from '@/services/inventoryService';
import { initializeSuppliers } from '@/services/supplierService';
import { initializeStorageLocations } from '@/services/storageLocationService';

// Helper function for history type badges
const getHistoryTypeBadgeClass = (type: string): string => {
  switch (type) {
    case 'received':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'damaged':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'adjusted':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'sold':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'returned':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'expired':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
  }
};

// Types
import { InventoryItem, StockHistoryEntry, STOCK_STATUS } from '@/types/inventory';



const Inventory = () => {
  const { t, formatDateTime, getTimezoneDisplayName, formatCurrency, settings, formatNumber: localizeNumber, formatDate: localizeDate } = useLocalization();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all-stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showProductScanModal, setShowProductScanModal] = useState(false);
  const [showNewStockForm, setShowNewStockForm] = useState(false);
  const [showUpdateStockForm, setShowUpdateStockForm] = useState(false);
  const [showReceiveStockForm, setShowReceiveStockForm] = useState(false);
  const [showDamageStockForm, setShowDamageStockForm] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUpdateWithBarcodeModal, setShowUpdateWithBarcodeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  // Filter out any empty values from STOCK_STATUS
  const [statuses] = useState<string[]>(Object.values(STOCK_STATUS).filter(status => !!status));
  
  // Define loadInventoryData with useCallback to avoid dependency issues
  const loadInventoryData = useCallback((forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      // Clear localStorage cache for testing purposes if forceRefresh is true
      if (forceRefresh) {
        // Force the browser to re-read from localStorage
        localStorage.removeItem('__temp_cache_clear');
        localStorage.setItem('__temp_cache_clear', Date.now().toString());
      }
      
      // Get all inventory items with a cache-busting approach
      const items = getAllInventoryItems();
      setItems(items);
      
      // Extract unique categories and filter out empty/undefined values
      const uniqueCategories = Array.from(new Set(items.map(item => item.category)))
        .filter(category => !!category && category.trim() !== '');
      setCategories(uniqueCategories);
      
      // Get stock history
      const history = getAllStockHistory();
      setStockHistory(history);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast({
        title: t('inventory.error'),
        description: t('inventory.failedToLoadInventoryData'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [toast]);
  
  // Initialize data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // Initialize sample data if needed
        initializeSuppliers();
        initializeStorageLocations();
        initializeInventoryData();
        
        // Load actual data
        loadInventoryData();
      } catch (error) {
        toast({
          title: t('inventory.error'),
          description: t('inventory.failedToLoadInventoryData'),
          variant: 'destructive',
        });
        console.error('Failed to load inventory data:', error);
      }
    };
    
    initData();
  }, [loadInventoryData, toast]);

  // Refresh data when forms close or when any modal is closed
  useEffect(() => {
    if (!showNewStockForm && !showUpdateStockForm && !showReceiveStockForm && !showDamageStockForm && 
        !showEditModal && !showHistoryModal && !showDeleteConfirm && !showSalesModal) {
      // Force refresh when modals close to ensure we get the latest data
      loadInventoryData(true);
    }
  }, [showNewStockForm, showUpdateStockForm, showReceiveStockForm, showDamageStockForm, 
      showEditModal, showHistoryModal, showDeleteConfirm, showSalesModal, loadInventoryData]);
      
  // Ensure we refresh data on component mount
  useEffect(() => {
    // Force a refresh on initial load
    loadInventoryData(true);
  }, [loadInventoryData]);

  // Listen for inventory updates and create de-duplicated notifications
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent;
      const detail = (custom && custom.detail) || {};
      const { entity, action, item, storage, itemId, storageId, quantity, reason } = detail;

      // Build a user-friendly title and message
      let title = '';
      let message = '';

      if (entity === 'item') {
        const name = item?.name || itemId || 'Inventory Item';
        switch (action) {
          case 'created':
            title = 'Inventory: Item Added';
            message = `${name} was added to inventory.`;
            break;
          case 'updated':
            title = 'Inventory: Item Updated';
            message = `${name} details were updated.`;
            break;
          case 'deleted':
            title = 'Inventory: Item Deleted';
            message = `Item ${name} was removed from inventory.`;
            break;
          case 'damaged':
            title = 'Inventory: Damaged Stock';
            message = `${quantity || ''} unit(s) of ${name} marked damaged${reason ? `: ${reason}` : ''}.`;
            break;
          case 'expired':
            title = 'Inventory: Expired Stock';
            message = `${quantity || ''} unit(s) of ${name} marked expired${reason ? `: ${reason}` : ''}.`;
            break;
          case 'low-stock':
            title = 'Inventory: Low Stock';
            message = `${name} is running low.`;
            break;
          case 'out-of-stock':
            title = 'Inventory: Out of Stock';
            message = `${name} is out of stock.`;
            break;
          default:
            break;
        }
      } else if (entity === 'storage') {
        const name = storage?.name || storageId || 'Storage Location';
        switch (action) {
          case 'created':
            title = 'Inventory: Storage Added';
            message = `New storage '${name}' was added.`;
            break;
          case 'updated':
            title = 'Inventory: Storage Updated';
            message = `Storage '${name}' was updated.`;
            break;
          case 'deleted':
            title = 'Inventory: Storage Deleted';
            message = `Storage '${name}' was deleted.`;
            break;
          default:
            break;
        }
      }

      // Only proceed if we recognized an actionable event
      if (!title || !message) return;

      // De-duplicate within 5 minutes by matching exact title+message
      try {
        const now = Date.now();
        const recent = getNotifications().find(n => n.title === title && n.message === message && (now - new Date(n.date).getTime()) < 5 * 60 * 1000);
        if (!recent) {
          addNotification({ title, message, type: 'system' });
        }
      } catch (e) {
        // Non-fatal if notifications unavailable
      }

      // Refresh data and history to reflect changes immediately
      loadInventoryData(true);
      setStockHistory(getAllStockHistory());
    };

    window.addEventListener('inventory-updated', handler as EventListener);
    return () => {
      window.removeEventListener('inventory-updated', handler as EventListener);
    };
  }, [loadInventoryData]);

  const handleBarcodeResult = (result: string) => {
    // Check if barcode exists in inventory
    const item = items.find(item => item.barcode === result);
    if (item) {
      setSelectedItem(item);
      setShowUpdateStockForm(true);
    } else {
      // Display form to add new item with this barcode
      setShowNewStockForm(true);
    }
    setShowScanner(false);
  };

  // Helper function to add an item to an invoice or quotation
  const addItemToCart = (item: InventoryItem, type: 'invoice' | 'quotation') => {
    if (!item) return;
    
    // Get existing cart from localStorage or initialize empty one
    const cartKey = type === 'invoice' ? 'invoiceCart' : 'quotationCart';
    const existingCart = localStorage.getItem(cartKey);
    const cart = existingCart ? JSON.parse(existingCart) : [];
    
    // Define cart item interface
    interface CartItem {
      id: string;
      name: string;
      price: number;
      quantity: number;
      barcode: string;
      category: string;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((cartItem: CartItem) => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // If item exists, increment quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // If item doesn't exist, add it with quantity 1
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        barcode: item.barcode,
        category: item.category
      });
    }
    
    // Save updated cart back to localStorage
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Show toast notification
    toast({
      title: type === 'invoice' ? t('inventory.addedToInvoice') : t('inventory.addedToQuotation'),
      description: t('inventory.hasBeenAddedTo', { itemName: item.name, type: t(type === 'invoice' ? 'invoices.title' : 'quotations.title') }),
    });
  };

  const handleActionClick = (action: string, item: InventoryItem | null = null) => {
    if (item) {
      setSelectedItem(item);
    }

    switch(action) {
      case 'new':
        setShowNewStockForm(true);
        break;
      case 'update':
        setShowUpdateWithBarcodeModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'invoice':
        if (item) {
          addItemToCart(item, 'invoice');
        }
        break;
      case 'quotation':
        if (item) {
          addItemToCart(item, 'quotation');
        }
        break;
      case 'damage':
        setShowDamageStockForm(true);
        break;
      case 'scan':
        setShowProductScanModal(true);
        break;
      case 'supplier':
        setShowSupplierModal(true);
        break;
      case 'storage':
        setShowStorageModal(true);
        break;
      case 'sales':
        setShowSalesModal(true);
        break;
      case 'history':
        setShowHistoryModal(true);
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
      case 'refresh':
        // Force a complete refresh of the data from localStorage
        loadInventoryData(true);
        toast({
          title: t('inventory.refreshed'),
          description: t('inventory.inventoryDataRefreshed'),
          variant: 'default',
        });
        break;
      default:
        break;
    }
  };

  const handleFormClose = () => {
    setShowNewStockForm(false);
    setShowUpdateStockForm(false);
    setShowReceiveStockForm(false);
    setShowDamageStockForm(false);
    setShowSupplierModal(false);
    setShowStorageModal(false);
    setShowEditModal(false);
    setShowHistoryModal(false);
    setShowDeleteConfirm(false);
    setShowScanner(false);
    setSelectedItem(null);
  };
  
  const handleDeleteItem = () => {
    if (selectedItem) {
      try {
        const success = deleteInventoryItem(selectedItem.id);
        if (success) {
          toast({
            title: t('inventory.itemDeleted'),
            description: t('inventory.hasBeenRemovedFromInventory', { itemName: selectedItem.name }),
            variant: 'default',
          });
          loadInventoryData(); // Refresh the inventory list
        } else {
          toast({
            title: t('inventory.error'),
            description: t('inventory.failedToDeleteItem'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast({
          title: t('inventory.error'),
          description: t('inventory.errorOccurredWhileDeleting'),
          variant: 'destructive',
        });
      }
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    }
  };

  // Filter inventory based on search term, category, and status
  const filteredInventory = items.filter(item => {
    // Apply search filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTermLower) ||
      item.barcode.toLowerCase().includes(searchTermLower) ||
      item.id.toLowerCase().includes(searchTermLower) ||
      (item.notes || '').toLowerCase().includes(searchTermLower) ||
      item.supplier.toLowerCase().includes(searchTermLower) ||
      item.category.toLowerCase().includes(searchTermLower) ||
      item.batchNo.toLowerCase().includes(searchTermLower);
    
    // Apply category filter
    const matchesCategory = categoryFilter === 'all' ? true : item.category === categoryFilter;
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // For expiring soon tab - items expiring in the next 30 days
  const expiringItems = filteredInventory.filter(item => {
    if (!item.expiryDate) return false;
    
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  });
  
  // For low stock tab
  const lowStockItems = filteredInventory.filter(item => item.status === STOCK_STATUS.LOW_STOCK);
  
  // For damaged tab
  const damagedItems = filteredInventory.filter(item => item.status === STOCK_STATUS.DAMAGED);

  return (
    <div className="min-h-screen bg-background relative">
      <DashboardBackground />
      <div className="container mx-auto p-6 sm:p-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 mb-4 glass backdrop-blur-md bg-white/10 dark:bg-black/30 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/10 shadow-business hover:bg-white/15 dark:hover:bg-white/10 transition-colors animate-fade-in"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.backToDashboard')}
              </Link>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
              {t('inventory.title')}
            </h1>
            <p className="text-xl text-slate-600 mt-2 font-sf-pro">
              {t('inventory.trackManageOptimize')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-6 lg:mt-0">
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white shadow-colored hover:shadow-colored-lg hover-lift"
              onClick={() => handleActionClick('new')}
            >
              <Plus className="h-4 w-4" /> {t('inventory.newStock')}
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg hover-lift"
              onClick={() => handleActionClick('update')}
            >
              <RefreshCw className="h-4 w-4" /> {t('inventory.updateStock')}
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 shadow-business hover:shadow-business-lg hover-lift"
              onClick={() => handleActionClick('scan')}
            >
              <Scan className="h-4 w-4" /> {t('inventory.scanBarcode')}
            </Button>
            
            {/* Damage/Expired button hidden as requested */}
            
            <Button 
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-200 shadow-business hover:shadow-business-lg hover-lift"
              onClick={() => handleActionClick('supplier')}
            >
              <Truck className="h-4 w-4" /> {t('inventory.addSupplier')}
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2 text-blue-600 border-blue-200 shadow-business hover:shadow-business-lg hover-lift"
              onClick={() => handleActionClick('storage')}
            >
              <Store className="h-4 w-4" /> {t('inventory.addStorage')}
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-mokm-purple-500 to-mokm-blue-500 text-white shadow-colored hover:shadow-colored-lg hover-lift"
              onClick={() => handleActionClick('sales')}
            >
              <Package className="h-4 w-4" /> {t('inventory.sales')}
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in delay-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t('inventory.searchByName')} 
              className="pl-10 shadow-business"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="shadow-business">
              <SelectValue placeholder={t('inventory.filterByCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
              {categories
                .filter(category => !!category && category.trim() !== '')
                .map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="shadow-business">
              <SelectValue placeholder={t('inventory.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('inventory.allStatuses')}</SelectItem>
              {statuses
                .filter(status => !!status && status.trim() !== '')
                .map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Link to="/reports/inventory" className="flex-1">
              <Button variant="outline" className="w-full flex items-center gap-2 shadow-business hover:shadow-business-lg">
                <FileBarChart className="h-4 w-4" />
                <span className="hidden sm:inline">{t('inventory.generateReports')}</span>
                <span className="sm:hidden">{t('inventory.reports')}</span>
              </Button>
            </Link>
            {/* Download and Print buttons removed as requested */}
          </div>
        </div>

        {/* Main Content Section */}
        <Card className="shadow-business animate-fade-in delay-200">
          <CardHeader className="pb-3">
            <CardTitle>{t('inventory.inventoryItems')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 flex justify-between items-center">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all-stock">{t('inventory.allStock')}</TabsTrigger>
                  <TabsTrigger value="low-stock">{t('inventory.lowStock')}</TabsTrigger>
                  <TabsTrigger value="expiring-soon">{t('inventory.expiringSoon')}</TabsTrigger>
                  <TabsTrigger value="damaged">{t('inventory.damaged')}</TabsTrigger>
                  <TabsTrigger value="history">{t('inventory.history')}</TabsTrigger>
                </TabsList>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 px-2 hover:bg-slate-100"
                  onClick={() => handleActionClick('refresh')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                   )}
                   <span className="hidden md:inline">{t('inventory.refresh')}</span>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-mokm-purple-500" />
                  <p className="text-slate-500">{t('inventory.loadingInventoryData')}</p>
                </div>
              ) : (
                <>
                  <TabsContent value="all-stock" className="m-0">
                    <InventoryTable 
                      data={filteredInventory}
                      onAction={handleActionClick}
                    />
                  </TabsContent>
                  
                  <TabsContent value="low-stock" className="m-0">
                    <InventoryTable 
                      data={lowStockItems}
                      onAction={handleActionClick}
                    />
                  </TabsContent>
                  
                  <TabsContent value="expiring-soon" className="m-0">
                    <InventoryTable 
                      data={expiringItems}
                      onAction={handleActionClick}
                    />
                  </TabsContent>
                  
                  <TabsContent value="damaged" className="m-0">
                    <InventoryTable 
                      data={damagedItems}
                      onAction={handleActionClick}
                    />
                  </TabsContent>
                  
                  <TabsContent value="history" className="m-0">
                    <div className="p-6">
                      {stockHistory.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-slate-500">{t('inventory.noStockHistoryAvailable')}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('inventory.date')}</TableHead>
                                <TableHead>{t('inventory.itemId')}</TableHead>
                                <TableHead>{t('inventory.type')}</TableHead>
                                <TableHead>{t('inventory.quantity')}</TableHead>
                                <TableHead>{t('inventory.notes')}</TableHead>
                                <TableHead>{t('inventory.performedBy')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stockHistory.map((entry) => (
                                <TableRow key={entry.id}>
                                  <TableCell>
                                    {localizeDate(new Date(entry.date))}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{entry.inventoryItemId}</div>
                                    {(() => {
                                      const item = items.find(i => i.id === entry.inventoryItemId);
                                      return item ? <div className="text-xs text-slate-500">{item.name}</div> : null;
                                    })()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={getHistoryTypeBadgeClass(entry.type)}>
                                      {entry.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{entry.quantity}</TableCell>
                                  <TableCell>{entry.notes}</TableCell>
                                  <TableCell>{entry.performedBy}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Forms and Modals */}
        {showNewStockForm && (
          <NewStockForm 
            onClose={handleFormClose}
            initialBarcode={selectedItem?.barcode || ''}
          />
        )}
        
        {showUpdateStockForm && selectedItem && (
          <UpdateStockForm 
            item={selectedItem} 
            onClose={handleFormClose}
          />
        )}
        
        {showReceiveStockForm && selectedItem && (
          <ReceiveStockForm 
            item={selectedItem} 
            onClose={handleFormClose}
          />
        )}
        
        {showDamageStockForm && (
          <DamageStockForm 
            item={selectedItem}
            onClose={handleFormClose}
            onSubmitSuccess={() => {
              // Refresh inventory data to update UI immediately
              loadInventoryData();
              
              // Also refresh stock history to show new damage/expiry records
              setStockHistory(getAllStockHistory());
            }}
          />
        )}
        
        {showProductScanModal && (
          <ProductScanDetailModal
            isOpen={showProductScanModal}
            onClose={() => setShowProductScanModal(false)}
          />
        )}
        
        <AddSupplierModal 
          isOpen={showSupplierModal}
          onClose={handleFormClose}
          onSuccess={() => {
            // Optionally refresh data or show a success message
          }}
        />

        <AddStorageModal 
          isOpen={showStorageModal}
          onClose={handleFormClose}
          onSuccess={() => {
            // Optionally refresh data or show a success message
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('inventory.deleteConfirmation')}</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedItem && (
                  <div className="space-y-2">
                    <p>{t('inventory.youAreAboutToDelete')}</p>
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                      <p className="font-medium">{selectedItem.name}</p>
                      <p className="text-sm text-slate-500">{t('inventory.itemIdHeader')}: {selectedItem.id}</p>
                      <p className="text-sm text-slate-500">{t('inventory.barcode')}: {selectedItem.barcode}</p>
                    </div>
                    <p className="text-red-500">{t('inventory.thisActionCannotBeUndone')}</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('inventory.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteItem}
                className="bg-red-500 hover:bg-red-600"
              >
                {t('inventory.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View History Modal */}
        {showHistoryModal && selectedItem && (
          <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{t('inventory.itemHistory')}</DialogTitle>
                <DialogDescription>
                  {t('inventory.viewingHistoryFor', { name: selectedItem.name, id: selectedItem.id })}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory.date')}</TableHead>
                      <TableHead>{t('inventory.type')}</TableHead>
                      <TableHead>{t('inventory.quantity')}</TableHead>
                      <TableHead>{t('inventory.notes')}</TableHead>
                      <TableHead>{t('inventory.performedBy')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockHistory
                      .filter(entry => entry.inventoryItemId === selectedItem.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry, index) => (
                        <TableRow key={`history-${index}`}>
                          <TableCell>{localizeDate(new Date(entry.date))}</TableCell>
                          <TableCell>
                            <Badge className={getHistoryTypeBadgeClass(entry.type)}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.quantity}</TableCell>
                          <TableCell>{entry.notes}</TableCell>
                          <TableCell>{entry.performedBy}</TableCell>
                        </TableRow>
                      ))
                    }
                    {stockHistory.filter(entry => entry.inventoryItemId === selectedItem.id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          {t('inventory.noHistoryRecords')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowHistoryModal(false)} variant="outline">
                  {t('inventory.close')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Update Stock with Barcode Modal */}
        <UpdateStockWithBarcodeModal
          isOpen={showUpdateWithBarcodeModal}
          onClose={() => setShowUpdateWithBarcodeModal(false)}
          onSuccess={(updatedItem) => {
            // Update the local state with the updated item
            setItems(prev => 
              prev.map(item => item.id === updatedItem.id ? updatedItem : item)
            );
            setShowUpdateWithBarcodeModal(false);
            toast({
              title: t('inventory.stockUpdated'),
              description: t('inventory.stockUpdatedSuccessfully', { itemName: updatedItem.name }),
            });
          }}
        />

        {/* Edit Details Modal - reusing the same form as Update Stock with a different heading */}
        {showEditModal && selectedItem && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('inventory.editItemDetails')}</DialogTitle>
                <DialogDescription>
                  {t('inventory.updateDetailsFor', { name: selectedItem.name })}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {/* In a real implementation, we would have a dedicated edit form here */}
                {/* For now, reusing the UpdateStockForm component */}
                <UpdateStockForm 
                  item={selectedItem}
                  onClose={() => setShowEditModal(false)}
                  isEditMode={true}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Sales Modal */}
        <SalesModal
          isOpen={showSalesModal}
          onClose={() => setShowSalesModal(false)}
        />
      </div>
    </div>
  );
};

export default Inventory;
