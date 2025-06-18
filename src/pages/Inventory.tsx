import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PackageOpen, 
  Search, 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  Download, 
  FileBarChart,
  Printer,
  AlertTriangle,
  Scan
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Component imports
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryScanner from '@/components/inventory/InventoryScanner';
import NewStockForm from '@/components/inventory/NewStockForm';
import UpdateStockForm from '@/components/inventory/UpdateStockForm';
import DamageStockForm from '@/components/inventory/DamageStockForm';

// Demo inventory data
const inventoryData = [
  { 
    id: 'INV-001', 
    name: 'Laptop HP ProBook', 
    barcode: '8901234567890', 
    stockLevel: 12, 
    price: 10999.99, 
    category: 'Electronics',
    expiryDate: null,
    supplier: 'HP South Africa',
    lastUpdated: '2025-05-30',
    location: 'Warehouse A',
    status: 'In Stock'
  },
  { 
    id: 'INV-002', 
    name: 'Office Chair - Ergonomic', 
    barcode: '8901234567891', 
    stockLevel: 25, 
    price: 1899.99, 
    category: 'Furniture',
    expiryDate: null,
    supplier: 'Office Solutions Ltd',
    lastUpdated: '2025-05-28',
    location: 'Warehouse B',
    status: 'In Stock'
  },
  { 
    id: 'INV-003', 
    name: 'Hand Sanitizer 500ml', 
    barcode: '8901234567892', 
    stockLevel: 130, 
    price: 89.99, 
    category: 'Health',
    expiryDate: '2026-04-15',
    supplier: 'MediClean SA',
    lastUpdated: '2025-06-01',
    location: 'Warehouse A',
    status: 'In Stock'
  },
  { 
    id: 'INV-004', 
    name: 'Premium Paper A4 (500 sheets)', 
    barcode: '8901234567893', 
    stockLevel: 45, 
    price: 149.99, 
    category: 'Stationery',
    expiryDate: null,
    supplier: 'Paper Corp',
    lastUpdated: '2025-05-20',
    location: 'Warehouse A',
    status: 'Low Stock'
  },
  { 
    id: 'INV-005', 
    name: 'Milk 1L', 
    barcode: '8901234567894', 
    stockLevel: 52, 
    price: 24.99, 
    category: 'Food & Beverages',
    expiryDate: '2025-06-10',
    supplier: 'Fresh Farms',
    lastUpdated: '2025-06-02',
    location: 'Store Room',
    status: 'In Stock'
  }
];

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('all-stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showNewStockForm, setShowNewStockForm] = useState(false);
  const [showUpdateStockForm, setShowUpdateStockForm] = useState(false);
  const [showDamageStockForm, setShowDamageStockForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = ['Electronics', 'Furniture', 'Health', 'Stationery', 'Food & Beverages'];
  const statuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Expired', 'Damaged'];

  const handleBarcodeResult = (result) => {
    // Check if barcode exists in inventory
    const item = inventoryData.find(item => item.barcode === result);
    if (item) {
      setSelectedItem(item);
      setShowUpdateStockForm(true);
    } else {
      // Display form to add new item with this barcode
      setShowNewStockForm(true);
    }
    setShowScanner(false);
  };

  const handleActionClick = (action, item = null) => {
    if (item) {
      setSelectedItem(item);
    }

    switch(action) {
      case 'new':
        setShowNewStockForm(true);
        break;
      case 'update':
        setShowUpdateStockForm(true);
        break;
      case 'damage':
        setShowDamageStockForm(true);
        break;
      case 'scan':
        setShowScanner(true);
        break;
      default:
        break;
    }
  };

  const handleFormClose = () => {
    setShowNewStockForm(false);
    setShowUpdateStockForm(false);
    setShowDamageStockForm(false);
    setSelectedItem(null);
  };

  const filteredInventory = inventoryData.filter(item => {
    // Apply search filter
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = categoryFilter === 'all' ? true : item.category === categoryFilter;
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link to="/dashboard">
                <Button variant="outline" className="flex items-center gap-2 hover:bg-slate-100 shadow-business hover:shadow-business-lg transition-all duration-300">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-sf-pro">
              Inventory Management
            </h1>
            <p className="text-xl text-slate-600 mt-2 font-sf-pro">
              Track, manage, and optimize your inventory
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-6 lg:mt-0">
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white shadow-colored hover:shadow-colored-lg hover-lift"
              onClick={() => handleActionClick('new')}
            >
              <Plus className="h-4 w-4" /> New Stock
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-gradient-to-r from-mokm-pink-500 to-mokm-purple-500 text-white shadow-colored hover:shadow-colored-lg hover-lift"
              onClick={() => handleActionClick('update')}
            >
              <RefreshCw className="h-4 w-4" /> Update Stock
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 shadow-business hover:shadow-business-lg hover-lift"
              onClick={() => handleActionClick('scan')}
            >
              <Scan className="h-4 w-4" /> Scan Barcode
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-amber-600 border-amber-200 shadow-business hover:shadow-business-lg hover-lift"
              onClick={() => handleActionClick('damage')}
            >
              <AlertTriangle className="h-4 w-4" /> Damage/Expired
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in delay-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name, ID, or barcode..." 
              className="pl-10 shadow-business"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="shadow-business">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="shadow-business">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Link to="/reports/inventory" className="flex-1">
              <Button variant="outline" className="w-full flex items-center gap-2 shadow-business hover:shadow-business-lg">
                <FileBarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Generate Reports</span>
                <span className="sm:hidden">Reports</span>
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center px-3 shadow-business hover:shadow-business-lg">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center px-3 shadow-business hover:shadow-business-lg">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Section */}
        <Card className="shadow-business animate-fade-in delay-200">
          <CardHeader className="pb-3">
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="all-stock">All Stock</TabsTrigger>
                  <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                  <TabsTrigger value="expiring-soon">Expiring Soon</TabsTrigger>
                  <TabsTrigger value="damaged">Damaged</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all-stock" className="m-0">
                <InventoryTable 
                  data={filteredInventory}
                  onAction={handleActionClick}
                />
              </TabsContent>
              
              <TabsContent value="low-stock" className="m-0">
                <InventoryTable 
                  data={filteredInventory.filter(item => item.status === 'Low Stock')}
                  onAction={handleActionClick}
                />
              </TabsContent>
              
              <TabsContent value="expiring-soon" className="m-0">
                <InventoryTable 
                  data={filteredInventory.filter(item => 
                    item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  )}
                  onAction={handleActionClick}
                />
              </TabsContent>
              
              <TabsContent value="damaged" className="m-0">
                <InventoryTable 
                  data={filteredInventory.filter(item => item.status === 'Damaged')}
                  onAction={handleActionClick}
                />
              </TabsContent>
              
              <TabsContent value="history" className="m-0">
                <InventoryTable 
                  data={filteredInventory}
                  onAction={handleActionClick}
                  showHistory={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Modal Forms */}
        {showScanner && (
          <InventoryScanner 
            onClose={() => setShowScanner(false)} 
            onResult={handleBarcodeResult}
          />
        )}
        
        {showNewStockForm && (
          <NewStockForm 
            onClose={handleFormClose} 
            initialBarcode={selectedItem?.barcode || ''}
          />
        )}
        
        {showUpdateStockForm && (
          <UpdateStockForm 
            item={selectedItem} 
            onClose={handleFormClose} 
          />
        )}
        
        {showDamageStockForm && (
          <DamageStockForm 
            item={selectedItem} 
            onClose={handleFormClose} 
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
