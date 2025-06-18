import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PackageOpen, Plus, Minus, History, Save, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  stockLevel: number;
  price: number;
  category: string;
  expiryDate: string | null;
  supplier: string;
  lastUpdated: string;
  location: string;
  status: string;
}

interface UpdateStockFormProps {
  item: InventoryItem | null;
  onClose: () => void;
}

const UpdateStockForm: React.FC<UpdateStockFormProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState('update');
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [quantityToRemove, setQuantityToRemove] = useState(1);
  const [notes, setNotes] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'add' | 'remove' | null>(null);
  
  // Mock history data for demonstration
  const stockHistory = [
    { date: '2025-06-01', action: 'Added', quantity: 50, user: 'Wilson M.', notes: 'Initial stock' },
    { date: '2025-06-02', action: 'Removed', quantity: 8, user: 'Wilson M.', notes: 'Sales order #12345' },
    { date: '2025-06-03', action: 'Added', quantity: 10, user: 'Wilson M.', notes: 'Restocking' },
  ];
  
  if (!item) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No item selected</DialogTitle>
          </DialogHeader>
          <p>Please select an inventory item to update.</p>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const handleAddStock = () => {
    setDialogAction('add');
    setConfirmDialogOpen(true);
  };
  
  const handleRemoveStock = () => {
    setDialogAction('remove');
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmAction = () => {
    // Here you would normally save the data to your database
    console.log('Update Stock:', {
      itemId: item.id,
      action: dialogAction,
      quantity: dialogAction === 'add' ? quantityToAdd : quantityToRemove,
      notes
    });
    
    setConfirmDialogOpen(false);
    // For demo purposes, just close the form
    onClose();
  };
  
  return (
    <>
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5" /> Update Inventory: {item.name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="update" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Update Stock
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" /> Stock History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="update" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item ID</Label>
                  <Input value={item.id} readOnly className="bg-slate-50" />
                </div>
                
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input value={item.barcode} readOnly className="bg-slate-50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Item Description</Label>
                <Input value={item.name} readOnly className="bg-slate-50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Stock Level</Label>
                  <Input value={item.stockLevel} readOnly className="bg-slate-50 text-lg font-semibold" />
                </div>
                
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <Input value={item.status} readOnly className="bg-slate-50" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4 border-green-100 shadow-md">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" /> Add Stock
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantityToAdd">Quantity to Add</Label>
                      <Input
                        id="quantityToAdd"
                        type="number"
                        min="1"
                        value={quantityToAdd}
                        onChange={(e) => setQuantityToAdd(parseInt(e.target.value))}
                        required
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAddStock}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Inventory
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4 border-orange-100 shadow-md">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Minus className="h-4 w-4 text-orange-600" /> Remove Stock
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantityToRemove">Quantity to Remove</Label>
                      <Input
                        id="quantityToRemove"
                        type="number"
                        min="1"
                        max={item.stockLevel}
                        value={quantityToRemove}
                        onChange={(e) => setQuantityToRemove(parseInt(e.target.value))}
                        required
                      />
                    </div>
                    
                    <Button 
                      onClick={handleRemoveStock}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={item.stockLevel <= 0}
                    >
                      <Minus className="h-4 w-4 mr-2" /> Remove Inventory
                    </Button>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this stock update..."
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="border rounded-md">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Action</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockHistory.map((record, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="px-4 py-2">{record.date}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            record.action === 'Added' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {record.action}
                          </span>
                        </td>
                        <td className="px-4 py-2">{record.quantity}</td>
                        <td className="px-4 py-2">{record.user}</td>
                        <td className="px-4 py-2">{record.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'add' ? 'Confirm Add Stock' : 'Confirm Remove Stock'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'add' 
                ? `Are you sure you want to add ${quantityToAdd} units to ${item.name}?`
                : `Are you sure you want to remove ${quantityToRemove} units from ${item.name}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              <Save className="mr-2 h-4 w-4" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateStockForm;
