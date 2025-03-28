import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { LoaderCircle } from 'lucide-react';
import { useBrowserPlatform } from '@/hooks/use-browser-platform';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
  const [loading, setLoading] = useState(false);
  const [paymentPlatform, setPaymentPlatform] = useState<'web' | 'apple' | 'test'>('web');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isIOS, isMacOS, isMobile } = useBrowserPlatform();
  const isApplePlatform = isIOS || isMacOS;

  const planDetails = {
    monthly: {
      name: 'Monthly Plan',
      price: '$4.99/month',
      description: 'Unlimited journal entries, image uploads, and premium features',
      features: [
        'Unlimited daily entries',
        'Image uploads',
        'AI journaling assistant',
        'Cancel anytime'
      ]
    },
    yearly: {
      name: 'Annual Plan',
      price: '$39.99/year',
      savings: 'Save 33%',
      description: 'All premium features at our best value',
      features: [
        'All monthly features',
        'Priority support',
        'Yearly savings of $19.89',
        'Cancel anytime'
      ]
    },
    lifetime: {
      name: 'Lifetime Access',
      price: '$99.99',
      badge: 'Limited time offer',
      description: 'One-time payment for permanent access',
      features: [
        'All premium features forever',
        'No recurring fees',
        'All future updates included',
        'VIP support'
      ]
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Call subscription API
      const response = await apiRequest('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          plan: selectedPlan,
          platform: paymentPlatform
        })
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      const data = await response.json();

      // If using test mode, just show success
      if (paymentPlatform === 'test') {
        toast({
          title: 'Subscription successful!',
          description: `You're now subscribed to the ${selectedPlan} plan.`,
          variant: 'default',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        onOpenChange(false);
        return;
      }

      // For web platform with Stripe, handle client secret
      if (paymentPlatform === 'web' && data.requiresAction) {
        // Load Stripe.js dynamically
        const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
        
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        if (data.clientSecret) {
          // For subscriptions or one-time payments, confirm the payment
          const { error } = await stripe.confirmCardPayment(data.clientSecret);
          
          if (error) {
            throw new Error(error.message || 'Payment failed');
          }
          
          // Payment successful
          toast({
            title: 'Payment successful!',
            description: `You're now subscribed to the ${selectedPlan} plan.`,
            variant: 'default',
          });
          
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          onOpenChange(false);
        } else {
          throw new Error('No payment information received');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-center">
            Unlock unlimited journaling and premium features
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-4 pt-4">
            <RadioGroup 
              value={selectedPlan} 
              onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'yearly' | 'lifetime')}
              className="space-y-4"
            >
              {(['monthly', 'yearly', 'lifetime'] as const).map((plan) => (
                <div 
                  key={plan}
                  className={`flex items-center space-x-3 rounded-lg border p-4 ${selectedPlan === plan ? 'border-primary bg-accent/50' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <RadioGroupItem value={plan} id={plan} />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={plan} className="text-base font-medium">{planDetails[plan].name}</Label>
                      {planDetails[plan].savings && (
                        <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs text-green-800 dark:text-green-200">
                          {planDetails[plan].savings}
                        </span>
                      )}
                      {planDetails[plan].badge && (
                        <span className="rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200">
                          {planDetails[plan].badge}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold">{planDetails[plan].price}</p>
                    <p className="text-sm text-muted-foreground">{planDetails[plan].description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            
            {isApplePlatform && isMobile && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900 p-3 mt-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Apple users: You can also subscribe through the App Store for convenient billing.
                </p>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Development Testing Options:</p>
                <RadioGroup 
                  value={paymentPlatform} 
                  onValueChange={(value) => setPaymentPlatform(value as 'web' | 'apple' | 'test')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="web" id="platform-web" />
                    <Label htmlFor="platform-web" className="text-xs">Web/Stripe</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="apple" id="platform-apple" />
                    <Label htmlFor="platform-apple" className="text-xs">Apple</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="test" id="platform-test" />
                    <Label htmlFor="platform-test" className="text-xs">Test Mode</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="features" className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Free Plan</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>1 journal entry per day</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>250 words per entry</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>Basic journaling tools</span>
                    </li>
                    <li className="flex items-center opacity-50">
                      <XIcon className="mr-2 h-4 w-4 text-red-500" />
                      <span>No image uploads</span>
                    </li>
                    <li className="flex items-center opacity-50">
                      <XIcon className="mr-2 h-4 w-4 text-red-500" />
                      <span>Limited AI assistance</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Premium Plan</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>Unlimited journal entries</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>1,000 words per entry</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>Advanced journaling tools</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>Image uploads</span>
                    </li>
                    <li className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>Full AI journaling assistant</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900 p-3 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Premium subscribers get priority feature updates and dedicated support.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Subscribe ${selectedPlan === 'monthly' ? '$4.99/mo' : 
                selectedPlan === 'yearly' ? '$39.99/yr' : 
                '$99.99'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to load Stripe.js dynamically
async function loadStripe(publishableKey: string) {
  if (!publishableKey) {
    console.error('Stripe publishable key is missing');
    return null;
  }
  
  const stripeJs = await import('@stripe/stripe-js');
  return await stripeJs.loadStripe(publishableKey);
}

// Icons
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}