
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FileCheck,
  DollarSign,
  Plus
} from 'lucide-react';

type ClientTransaction = {
  id: string;
  type: 'invoice' | 'quotation' | 'payment';
  number: string;
  date: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'declined';
};

interface ClientTransactionsProps {
  transactions: ClientTransaction[];
  clientId: string;
}

export const ClientTransactions: React.FC<ClientTransactionsProps> = ({ 
  transactions, 
  clientId 
}) => {
  const getStatusColor = (status: ClientTransaction['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: ClientTransaction['type']) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'quotation':
        return <FileCheck className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="glass backdrop-blur-sm bg-white/50 border border-white/20 shadow-business rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium font-sf-pro">Recent Transactions</h2>
        <Link to={`/clients/${clientId}/transactions`} className="text-sm text-blue-600 hover:underline font-sf-pro">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/30">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                Number
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider font-sf-pro">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/20 divide-y divide-white/20">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-white/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                      transaction.type === 'invoice' 
                        ? 'bg-blue-100 text-blue-600' 
                        : transaction.type === 'quotation'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-green-100 text-green-600'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-slate-900 font-sf-pro">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 font-sf-pro">{transaction.number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 font-sf-pro">{transaction.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 font-sf-pro">
                    R {transaction.amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sf-pro ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    to={`/${transaction.type}s/${transaction.id}`} 
                    className="text-blue-600 hover:text-blue-900 font-sf-pro"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 font-sf-pro">No transactions found</p>
          <div className="mt-4 flex justify-center space-x-3">
            <Link to={`/quotations/create?client=${clientId}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro">
              <Plus className="h-4 w-4" />
              <span>Create Quotation</span>
            </Link>
            <Link to={`/invoices/create?client=${clientId}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-lg hover:bg-white/90 transition-colors font-sf-pro">
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
