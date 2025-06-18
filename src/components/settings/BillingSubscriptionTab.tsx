
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Clock, 
  X, 
  ArrowRight, 
  Shield 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BillingSubscriptionTab = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Mock subscription data for demonstration
  const mockSubscription = {
    status: 'active',
    tier: 'premium',
    trialDaysLeft: null,
    startDate: '2025-01-01',
    currentPeriodEnd: '2025-07-01',
    paymentDeclinedDate: null
  };

  const currentSubscription = mockSubscription;

  // Format date from ISO string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get subscription status badge
  const getStatusBadge = () => {
    switch (currentSubscription.status) {
      case 'trial':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Trial</Badge>;
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
      case 'payment_failed':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Payment Issue</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Free</Badge>;
    }
  };

  // Get tier badge
  const getTierBadge = () => {
    switch (currentSubscription.tier) {
      case 'free':
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Free</Badge>;
      case 'basic':
        return <Badge variant="outline" className="border-blue-400 text-blue-600">Basic</Badge>;
      case 'premium':
        return <Badge variant="outline" className="border-purple-400 text-purple-600">Premium</Badge>;
      case 'enterprise':
        return <Badge variant="outline" className="border-amber-400 text-amber-600">Enterprise</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Free</Badge>;
    }
  };

  // Mock payment history
  const paymentHistory = [
    {
      date: '2025-05-01',
      amount: 'R299.00',
      status: 'succeeded',
      description: 'Monthly subscription - Premium'
    },
    {
      date: '2025-04-01',
      amount: 'R299.00',
      status: 'succeeded',
      description: 'Monthly subscription - Premium'
    },
    {
      date: '2025-03-01',
      amount: 'R299.00',
      status: 'failed',
      description: 'Monthly subscription - Premium'
    }
  ];

  // Mock plan details
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'R0',
      description: 'Basic financial management tools',
      features: [
        'Basic invoicing',
        'Up to 5 clients',
        'Up to 10 documents'
      ],
      isCurrent: currentSubscription.tier === 'free'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 'R149/month',
      description: 'Essential tools for small businesses',
      features: [
        'Unlimited invoices',
        'Up to 25 clients',
        'Up to 100 documents',
        'Export reports',
        'Bulk invoicing'
      ],
      isCurrent: currentSubscription.tier === 'basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R299/month',
      description: 'Advanced tools for growing businesses',
      features: [
        'Everything in Basic',
        'Unlimited clients',
        'Unlimited documents',
        'Advanced reporting',
        'Custom branding',
        'Team members (up to 3)'
      ],
      isCurrent: currentSubscription.tier === 'premium'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R599/month',
      description: 'Complete solution for established businesses',
      features: [
        'Everything in Premium',
        'API access',
        'Unlimited team members',
        'Priority support',
        'Custom integrations'
      ],
      isCurrent: currentSubscription.tier === 'enterprise'
    }
  ];

  const handleUpgrade = (tier: string) => {
    toast({
      title: "Plan upgrade requested",
      description: `Upgrading to ${tier} plan...`,
    });
    setIsPaymentModalOpen(true);
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription canceled",
      description: "Your subscription has been canceled and will not renew.",
    });
  };

  const handleRetryPayment = () => {
    toast({
      title: "Payment retry initiated",
      description: "Please update your payment method.",
    });
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-xl bg-white/80 border-white/20 shadow-business">
        <CardHeader>
          <CardTitle className="flex items-center font-sf-pro">
            <CreditCard className="h-5 w-5 mr-2" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Subscription Status</CardTitle>
                      <CardDescription>Your current subscription details</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge()}
                      {getTierBadge()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentSubscription.status === 'trial' && currentSubscription.trialDaysLeft && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 flex items-start">
                      <Clock className="h-5 w-5 text-emerald-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-emerald-800">Trial Period</h3>
                        <p className="text-emerald-700">
                          You have <span className="font-semibold">{currentSubscription.trialDaysLeft} days</span> left in your trial.
                          {currentSubscription.trialDaysLeft <= 3 && 
                            " Your trial is ending soon. Upgrade to continue using premium features."}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSubscription.status === 'payment_failed' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Payment Issue</h3>
                        <p className="text-amber-700">
                          Your last payment was declined. Please update your payment method to avoid limited access.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleRetryPayment}
                        >
                          Update Payment Method
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
                      <p className="text-lg font-semibold capitalize">
                        {currentSubscription.tier}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Billing Cycle</h3>
                      <p className="text-lg font-semibold">Monthly</p>
                    </div>

                    {currentSubscription.startDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                        <p className="text-lg font-semibold">{formatDate(currentSubscription.startDate)}</p>
                      </div>
                    )}

                    {currentSubscription.currentPeriodEnd && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
                        <p className="text-lg font-semibold">{formatDate(currentSubscription.currentPeriodEnd)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {currentSubscription.status !== 'canceled' && (
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={handleCancelSubscription}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  )}
                  <Button onClick={() => setActiveTab('plans')}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Available Plans
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Manage your payment details</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentSubscription.tier !== 'free' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-md mr-4">
                          <CreditCard className="h-6 w-6 text-gray-700" />
                        </div>
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                        Update
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No payment method on file</p>
                      <Button onClick={() => setIsPaymentModalOpen(true)}>
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`relative ${plan.isCurrent ? 'border-mokm-orange-500 ring-2 ring-mokm-orange-200' : ''}`}>
                    {plan.isCurrent && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-mokm-orange-500 text-white text-xs py-1 px-3 rounded-full">
                        Current Plan
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-lg font-bold">{plan.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{plan.description}</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className={`w-full ${plan.isCurrent ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600'}`}
                        disabled={plan.isCurrent}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {plan.isCurrent ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View your recent payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.length > 0 ? (
                          paymentHistory.map((payment, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-3 px-4">{formatDate(payment.date)}</td>
                              <td className="py-3 px-4">{payment.description}</td>
                              <td className="py-3 px-4 font-medium">{payment.amount}</td>
                              <td className="py-3 px-4">
                                {payment.status === 'succeeded' ? (
                                  <span className="inline-flex items-center text-green-600 text-sm">
                                    <Check className="h-4 w-4 mr-1" /> Paid
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-red-600 text-sm">
                                    <X className="h-4 w-4 mr-1" /> Failed
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-500">
                              No payment history available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your billing details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Company Information</h3>
                      <address className="not-italic text-sm text-gray-600">
                        <p>MOK Mzansi Books (Pty) Ltd</p>
                        <p>VAT: ZA123456789</p>
                        <p>123 Main Street</p>
                        <p>Johannesburg, Gauteng 2000</p>
                        <p>South Africa</p>
                      </address>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Billing Contact</h3>
                      <div className="text-sm text-gray-600">
                        <p>Wilson Moabelo</p>
                        <p>admin@mokmzansibooks.co.za</p>
                        <p>+27 12 345 6789</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        Update Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mock Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Payment Method</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="4242 4242 4242 4242"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full p-2 border rounded-md"
                    defaultValue="12/25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123" 
                    className="w-full p-2 border rounded-md"
                    defaultValue="123"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name on Card</label>
                <input 
                  type="text" 
                  placeholder="Wilson Moabelo" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="Wilson Moabelo"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-mokm-orange-500 via-mokm-pink-500 to-mokm-purple-500 hover:from-mokm-orange-600 hover:via-mokm-pink-600 hover:to-mokm-purple-600" 
                  onClick={() => {
                    toast({
                      title: "Payment method updated",
                      description: "Your payment information has been saved securely.",
                    });
                    setIsPaymentModalOpen(false);
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Save Payment Method
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Your payment information is securely processed and stored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSubscriptionTab;
