import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "@/hooks/use-toast";

// Initialize Stripe with the publishable test key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PExm5OX3dFAFDCYL4WHhMV3Ovs98EDr54S7ZHCfWlOkEGF7lA2vTQSkkFO94iKPBNx3W9QFILNIk8cEcv1GYHel00JbUEctdw';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const plans = {
  free: {
    name: "Free",
    price: 0,
    topFeatures: [
      "Limited entries per day",
      "Limited guided journaling lessons",
      "Basic theme options",
    ],
    extraFeatures: [
      "Limited photo uploads",
      "Basic features only",
      "No achievement tracking",
    ],
  },
  premium: {
    name: "Premium",
    monthlyPrice: 3.99,
    yearlyPrice: 34.99,
    yearlyMonthlyPrice: 2.92,
    topFeatures: [
      "Unlimited journal entries",
      "Unlimited guided journaling lessons",
      "Full theme customization",
    ],
    extraFeatures: [
      "Unlimited photo uploads",
      "Full achievement tracking",
      "Unlimited AI assistant access",
      "Priority support",
    ],
    // These would be your actual Stripe price IDs
    priceIds: {
      monthly: "price_monthly_id",
      yearly: "price_yearly_id"
    }
  },
};

const faqs = [
  {
    question: "Is Premium really worth it?",
    answer:
      "Most of our users think so — in fact, more than 50% of users upgrade to Premium within their first week.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Absolutely! You can upgrade or downgrade anytime. Your journal entries are always safe.",
  },
];

// CheckoutForm component for Stripe Elements
function CheckoutForm({ priceId, amount, onSuccess, onCancel, billingType }: {
  priceId: string;
  amount: number;
  billingType: 'monthly' | 'yearly';
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data } = useOnboarding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // First confirm the payment with Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Create the subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (result.error) {
        setErrorMessage(result.error.message);
      } else {
        // Confirm the payment with Stripe
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret: result.clientSecret,
          confirmParams: {
            return_url: window.location.origin + '/subscription/success',
          },
        });

        if (confirmError) {
          throw confirmError;
        }

        toast({
          title: 'Subscription created!',
          description: `You're now subscribed to the ${billingType === 'yearly' ? 'yearly' : 'monthly'} plan.`,
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
      
      <div className="flex gap-2 mt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading} 
          className="flex-1"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay ${amount}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SubscriptionStep() {
  const { data, updateData } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(
    (data.subscriptionPlan as 'free' | 'premium') || "free",
  );
  const [isYearly, setIsYearly] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState({
    free: false,
    premium: false,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Get the payment intent when the premium plan is selected
  useEffect(() => {
    if (selectedPlan === 'premium' && !clientSecret) {
      const fetchPaymentIntent = async () => {
        try {
          const amount = isYearly ? plans.premium.yearlyPrice : plans.premium.monthlyPrice;
          const subscription_type = isYearly ? 'yearly' : 'monthly';
          
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount,
              subscription_type,
            }),
          });
          
          const data = await response.json();
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        } catch (error) {
          console.error('Error fetching payment intent:', error);
          toast({
            title: 'Error',
            description: 'Could not connect to payment service. Please try again.',
            variant: 'destructive',
          });
        }
      };
      
      fetchPaymentIntent();
    }
  }, [selectedPlan, isYearly]);

  const [location, setLocation] = useLocation();

  const handleContinue = () => {
    if (selectedPlan === 'free') {
      updateData({ 
        subscriptionPlan: selectedPlan, 
        // Use undefined instead of 'free' to align with type definition
        subscriptionStatus: undefined 
      });
      // Direct user to main app after selecting free plan
      setLocation('/home');
    } else {
      setShowPayment(true);
    }
  };
  
  const handlePaymentSuccess = () => {
    updateData({ 
      subscriptionPlan: selectedPlan,
      subscriptionStatus: isYearly ? 'yearly' : 'monthly'
    });
    // Navigate to home page after successful payment
    setLocation('/home');
  };
  
  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  // Stripe payment options
  const stripeOptions = {
    clientSecret: clientSecret || '',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1">
        {/* Payment Modal */}
        {showPayment && clientSecret && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <Card className="w-full max-w-md p-6">
              <h3 className="text-xl font-semibold mb-6">Complete Your Payment</h3>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm 
                  priceId={isYearly ? plans.premium.priceIds.yearly : plans.premium.priceIds.monthly}
                  amount={isYearly ? plans.premium.yearlyPrice : plans.premium.monthlyPrice}
                  billingType={isYearly ? 'yearly' : 'monthly'}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </Elements>
            </Card>
          </motion.div>
        )}

        <h1 className="text-2xl font-bold text-center mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Select the plan that best fits your journaling journey
        </p>

        {/* Premium Toggle */}
        {selectedPlan === "premium" && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className={!isYearly ? "font-medium" : "text-muted-foreground"}
            >
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span
              className={isYearly ? "font-medium" : "text-muted-foreground"}
            >
              Yearly <span className="text-sm text-primary">(Save 33%)</span>
            </span>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card
            className={`p-6 cursor-pointer transition-all ${
              selectedPlan === "free" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedPlan("free")}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold">{plans.free.name}</h3>
              <div className="text-3xl font-bold mt-2">Free</div>
            </div>

            <ul className="space-y-3 mb-4">
              {plans.free.topFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full mt-6" 
              onClick={() => handleContinue()}
            >
              Continue with Free Plan
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              You can upgrade anytime
            </p>
          </Card>

          {/* Premium Plan */}
          <Card
            className={`p-8 cursor-pointer relative overflow-hidden bg-white dark:bg-zinc-900 ${
              selectedPlan === "premium"
                ? "ring-2 ring-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                : "hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            } rounded-2xl transition-all duration-300 hover:translate-y-[-2px]`}
            onClick={() => setSelectedPlan("premium")}
          >
            <div className="absolute top-3 right-3">
              <span className="text-xs bg-primary text-white px-4 py-2 rounded-full font-medium">
                Unlock Your Best Self
              </span>
            </div>

            <div className="mb-6">
              <div className="relative">
                <h3 className="text-2xl font-bold font-serif bg-gradient-to-r from-violet-600 to-primary bg-clip-text text-transparent">
                  {plans.premium.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-light">For serious journalers</p>
                <div className="text-5xl font-light mt-4 flex items-baseline tracking-tight transition-transform duration-300 hover:scale-105">
                  <span className="font-normal">${isYearly ? plans.premium.yearlyMonthlyPrice.toFixed(2) : plans.premium.monthlyPrice.toFixed(2)}</span>
                  <span className="text-base font-light text-muted-foreground ml-1">
                    /month
                  </span>
                </div>
                {isYearly && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">
                      Billed ${plans.premium.yearlyPrice}/year
                    </div>
                    <div className="text-sm text-primary font-medium mt-1">
                      Save ${(plans.premium.monthlyPrice * 12 - plans.premium.yearlyPrice).toFixed(2)} per year
                    </div>
                  </div>
                )}
              </div>

              <ul className="space-y-4 my-6">
                {plans.premium.topFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 group">
                    <div className="relative">
                      <Check className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="ghost"
                className="w-full justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreFeatures((prev) => ({
                    ...prev,
                    premium: !prev.premium,
                  }));
                }}
              >
                <span className="font-medium">
                  {showMoreFeatures.premium ? "Hide features" : "Show more features"}
                </span>
                {showMoreFeatures.premium ? (
                  <ChevronUp className="h-4 w-4 text-primary transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200" />
                )}
              </Button>

              <div className={`space-y-3 mt-4 transition-all duration-300 ${
                showMoreFeatures.premium ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
              }`}>
                {plans.premium.extraFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </li>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="w-full mt-6 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all font-medium" 
                onClick={() => handleContinue()}
              >
                Continue with Premium {isYearly ? "Yearly" : "Monthly"}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </Card>
        </div>

        {/* FAQs */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </motion.div>
  );
}