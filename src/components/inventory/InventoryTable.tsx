import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Pen, 
  Trash, 
  FileText, 
  Receipt, 
  RefreshCw, 
  Clock,
  PackageOpen,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalization } from '@/hooks/useLocalization';

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

interface InventoryTableProps {
  data: InventoryItem[];
  onAction: (action: string, item?: any) => void;
  showHistory?: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  data, 
  onAction,
  showHistory = false 
}) => {
  const { formatCurrency, t } = useLocalization();
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'In Stock':
        return <Badge className="bg-green-500">{t('inventory.inStock')}</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-500">{t('inventory.lowStock')}</Badge>;
      case 'Out of Stock':
        return <Badge className="bg-red-500">{t('inventory.outOfStock')}</Badge>;
      case 'Expired':
        return <Badge variant="outline" className="text-red-500 border-red-200">{t('inventory.expiredLabel')}</Badge>;
      case 'Damaged':
        return <Badge variant="outline" className="text-amber-600 border-amber-200">{t('inventory.damaged')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('inventory.itemIdHeader')}</TableHead>
            <TableHead>{t('inventory.item')}</TableHead>
            <TableHead>{t('inventory.category')}</TableHead>
            <TableHead>{t('inventory.stock')}</TableHead>
            <TableHead>{t('inventory.price')}</TableHead>
            <TableHead>{t('inventory.status')}</TableHead>
            <TableHead>{t('inventory.location')}</TableHead>
            {showHistory && <TableHead>{t('inventory.lastUpdated')}</TableHead>}
            <TableHead className="text-right">{t('inventory.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showHistory ? 9 : 8} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <PackageOpen className="h-12 w-12 mb-2" />
                  <p className="text-lg font-semibold">{t('inventory.noInventoryItemsFound')}</p>
                  <p className="text-sm">{t('inventory.tryAdjustingFiltersOrAddNewStock')}</p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 text-white"
                    onClick={() => onAction('new')}
                  >
                    {t('inventory.newStock')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover-highlight">
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-slate-500">{t('inventory.barcode')}: {item.barcode}</div>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.stockLevel}</TableCell>
                <TableCell>{formatCurrency(item.price)}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{item.location}</TableCell>
                {showHistory && <TableCell>{item.lastUpdated}</TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('inventory.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAction('update', item)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>{t('inventory.updateStockLabel')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction('edit', item)}>
                        <Pen className="mr-2 h-4 w-4" />
                        <span>{t('inventory.editDetails')}</span>
                      </DropdownMenuItem>
                      <Link to={`/invoices/new?item=${item.id}`}>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{t('inventory.addToInvoice')}</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to={`/quotations/new?item=${item.id}`}>
                        <DropdownMenuItem>
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>{t('inventory.addToQuotation')}</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => onAction('history', item)}>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{t('inventory.viewHistory')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction('damage', item)}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        <span>{t('inventory.reportDamageExpired')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onAction('delete', item)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>{t('inventory.delete')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
