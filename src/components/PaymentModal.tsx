
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/paystack';
import { useAuth } from '@/hooks/useAuth';
import { paymentsStorageService, SavedPaymentMethod } from '@/services/paymentsStorageService';
import { toast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string | null;
  onPayment: (email: string, savePaymentMethod?: boolean) => void;
  isProcessing: boolean;
  modalMode: 'subscribe' | 'update';
  onCardSaved?: () => void;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  onPayment, 
  isProcessing,
  modalMode,
  onCardSaved,
}: PaymentModalProps) => {
  const { user } = useAuth();
  // const { modalMode } = usePayment(); // removed; mode is now passed via props
  const [userEmail, setUserEmail] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [savedCard, setSavedCard] = useState<SavedPaymentMethod | null>(null);

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset form states when modal opens
    if (modalMode === 'update') {
      const key = (user?.id || user?.email || '') as string;
      if (!key) return;
      const existing = paymentsStorageService.get(key);
      setSavedCard(existing);
      setSaveCard(true); // Reset to true for new card entry
      setSetAsDefault(false);
      if (existing) {
        setCardholderName(existing.cardholderName || '');
        const mm = existing.expMonth?.toString().padStart(2, '0');
        const yy = existing.expYear?.toString();
        const shortYY = yy && yy.length === 4 ? yy.slice(2) : (yy || '');
        setExpiryDate(mm && shortYY ? `${mm}/${shortYY}` : '');
        setCardNumber('');
        setCvv('');
      } else {
        // Clear form for new card
        setCardholderName('');
        setExpiryDate('');
        setCardNumber('');
        setCvv('');
      }
    } else {
      // Reset for subscription mode
      setSaveCard(true);
      setSetAsDefault(false);
    }
  }, [isOpen, modalMode, user]);

  const handlePayment = () => {
    if (!userEmail) {
      alert('Please enter your email address');
      return;
    }

    // Ensure we have a normalized numeric-only card number available across validations and save block
    const digitsOnly = (cardNumber || '').replace(/\D/g, '');
    
    // Additional validation for card management mode
    if (modalMode === 'update') {
      if (!cardholderName.trim()) {
        alert('Please enter the cardholder name');
        return;
      }
      // removed inner declaration; now using function-scoped digitsOnly
      if (digitsOnly && digitsOnly.length < 13) {
        alert('Please enter a valid card number');
        return;
      }
      if (!expiryDate.trim() || expiryDate.length !== 5) {
        alert('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cvv.trim() || cvv.length < 3) {
        alert('Please enter a valid CVV');
        return;
      }
    }
    
    // Persist non-sensitive data for prefill (multi-card)
    if (modalMode === 'update') {
      try {
        const key = (user?.id || user?.email || '') as string;
        // Save card if either 'Save this card' is checked OR 'Set as default' is checked
        // Setting as default implies saving the card
        const shouldSaveCard = saveCard || setAsDefault;
        
        if (key && shouldSaveCard) {
          const [mm, yyShort] = (expiryDate || '').split('/');
          const toSave: Omit<SavedPaymentMethod, 'id'> = {
            last4: digitsOnly.slice(-4),
            expMonth: mm || '',
            expYear: yyShort ? (yyShort.length === 2 ? `20${yyShort}` : yyShort) : '',
            brand: savedCard?.brand,
            cardholderName: cardholderName || '',
            updatedAt: new Date().toISOString(),
            isDefault: setAsDefault,
          };
          const res = paymentsStorageService.add(key, toSave);
          if (!res.ok && res.reason === 'limit') {
            toast({ title: 'Limit reached', description: 'You can only save up to 3 cards.', variant: 'destructive' });
            return;
          }
          toast({ title: 'Card Saved!', description: 'Your payment method has been updated successfully.' });
          onCardSaved?.(); // Refresh the saved cards list
        } else {
          toast({ title: 'Card Not Saved', description: 'Please check "Save this card" or "Set as default" to save the card.', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to save card. Please try again.', variant: 'destructive' });
      }
      onClose();
      return;
    }
    
    onPayment(userEmail, saveCard);
  };

  const plan = selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {modalMode === 'update' ? 'Manage Payment Method' : 'Complete Your Payment'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {modalMode === 'update'
              ? 'Add or update your payment information below.'
              : `You're about to subscribe to the ${plan?.name || ''}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {modalMode !== 'update' && plan && (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {formatPrice(plan.price)}
              </div>
              <div className="text-gray-600">
                {selectedPlan === 'annual' ? 'per year' : 'per month'}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={!!user?.email}
              required
            />
          </div>

          {modalMode === 'update' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <Input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                    if (value.length <= 19) setCardNumber(value);
                  }}
                  placeholder={modalMode === 'update' && savedCard?.last4 ? `•••• •••• •••• ${savedCard.last4}` : '1234 5678 9012 3456'}
                  className="font-mono"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <Input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                        setExpiryDate(formatted);
                      }
                    }}
                    placeholder={modalMode === 'update' && savedCard?.expMonth && savedCard?.expYear ? `${savedCard.expMonth}/${(savedCard.expYear.toString()).slice(-2)}` : 'MM/YY'}
                    className="font-mono"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <Input
                    type="text"
                    value={cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) setCvv(value);
                    }}
                    placeholder="123"
                    className="font-mono"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <input
                  id="set-default"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                />
                <label htmlFor="set-default" className="text-sm text-gray-700 select-none">
                  Set as default
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 py-1">
            <input
              id="save-card"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
            />
            <label htmlFor="save-card" className="text-sm text-gray-700 select-none">
              {modalMode === 'update' ? 'Save this card for future payments' : 'Save card for future payments'}
            </label>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !userEmail || (modalMode === 'update' && (!cardholderName.trim() || !expiryDate.trim() || !cvv.trim()))}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              {isProcessing ? 'Processing...' : modalMode === 'update' ? 'Save Card' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
