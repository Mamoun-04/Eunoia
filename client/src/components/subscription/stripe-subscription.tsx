import React, { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, CheckCircle2, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define billing period type
export type BillingPeriod = 'monthly' | 'yearly';

// Define subscription plan type
export type SubscriptionPlan = 'free' | 'premium';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

// Initialize Stripe with the public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripeSubscriptionProps {
  onComplete?: () => void;
}

export const StripeSubscription: React.FC<StripeSubscriptionProps> = ({ onComplete }) => {
  const { 
    status, 
    isLoading, 
    error, 
    isCheckoutSessionCreating,
    createCheckoutSession
  } = useSubscription();
  
  const [plan, setPlan] = useState<SubscriptionPlan>('premium');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  
  // Handle plan selection
  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setPlan(plan);
  };
  
  // Handle billing period change
  const handleBillingPeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
  };
  
  // Handle checkout
  const handleCheckout = async () => {
    await createCheckoutSession(plan, billingPeriod);
    if (onComplete) {
      onComplete();
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading subscription options...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="mt-4 text-xl font-medium">Subscription Error</h3>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-6" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // If user already has an active premium subscription
  if (status?.plan === 'premium' && status?.isActive) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </motion.div>
        <h3 className="mt-4 text-2xl font-medium">Premium Active</h3>
        <p className="mt-2 text-gray-600">
          You already have an active premium subscription
          {status.expiresAt && ` until ${new Date(status.expiresAt).toLocaleDateString()}`}.
        </p>
        
        <div className="mt-6 space-y-2 w-full">
          <p className="text-sm text-gray-500 mb-4">
            Your subscription will automatically renew. You can manage your subscription from the account settings.
          </p>
          
          <Button 
            variant="default" 
            className="w-full" 
            onClick={onComplete}
          >
            Continue to Eunoia
          </Button>
        </div>
      </div>
    );
  }

  // Show subscription options
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-medium">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Enhance your journaling experience with premium features</p>
      </div>
      
      {/* Billing period selector */}
      <div className="flex justify-center mb-8">
        <Tabs
          defaultValue="monthly"
          value={billingPeriod}
          onValueChange={(value) => handleBillingPeriodChange(value as BillingPeriod)}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" className="relative text-base py-3">
              Monthly
              {billingPeriod === 'monthly' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="underline"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="yearly" className="relative text-base py-3">
              Yearly
              <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">Save 16%</Badge>
              {billingPeriod === 'yearly' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="underline"
                />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        {/* Free Plan */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className={`h-full flex flex-col cursor-pointer ${
              plan === 'free' 
                ? 'ring-2 ring-primary border-primary shadow-lg' 
                : 'border-border hover:border-primary/50 hover:shadow-md transition-all duration-300'
            }`}
            onClick={() => handlePlanSelection('free')}
          >
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-medium">Free Plan</CardTitle>
              <CardDescription>Basic journaling features</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-500 ml-1">/forever</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-grow">
              <div className="space-y-2">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>1 journal entry per day</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Basic mood tracking</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>One image per entry</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>7-day entry history</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <Button 
                variant={plan === 'free' ? 'default' : 'outline'} 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelection('free');
                }}
                className="w-full"
              >
                {plan === 'free' ? 'Selected' : 'Select Free Plan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Premium Plan */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative z-10"
        >
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 py-1 px-3">
              RECOMMENDED
            </Badge>
          </div>
          <Card 
            className={`h-full flex flex-col cursor-pointer relative overflow-hidden ${
              plan === 'premium' 
                ? 'ring-2 ring-[#FFD700] border-[#FFD700] shadow-xl bg-gradient-to-br from-white to-yellow-50' 
                : 'border border-amber-200 ring-1 ring-amber-100 shadow-md hover:shadow-lg hover:border-amber-300 hover:ring-amber-200 transition-all duration-300'
            }`}
            onClick={() => handlePlanSelection('premium')}
          >
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-medium flex items-center">
                Premium Plan
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  className="ml-2"
                >
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </CardTitle>
              <CardDescription>Unlimited journaling experience</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {billingPeriod === 'monthly' ? '$4.99' : '$49.99'}
                </span>
                <span className="text-gray-500 ml-1">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
                {billingPeriod === 'yearly' && (
                  <div className="text-green-600 text-sm mt-1 font-medium">Save $10 per year</div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-grow">
              <div className="space-y-2">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited journal entries</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Advanced mood tracking & insights</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited images per entry</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI writing assistant</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Premium journal templates</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited entry history</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <Button 
                variant={plan === 'premium' ? 'default' : 'outline'} 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelection('premium');
                }}
                className="w-full"
              >
                {plan === 'premium' ? 'Selected' : 'Select Premium Plan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col items-center mt-10 max-w-md mx-auto space-y-4"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="w-full"
        >
          <Button 
            size="lg" 
            onClick={handleCheckout}
            disabled={isCheckoutSessionCreating}
            className="w-full py-6 text-base bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 text-white shadow-md"
          >
            {isCheckoutSessionCreating ? (
              <span className="flex items-center">
                <Spinner className="mr-2" />
                Creating checkout...
              </span>
            ) : (
              <span className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Continue to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </motion.div>
        
        <p className="text-xs text-gray-500 text-center mt-4 px-4">
          By proceeding with the payment, you agree to our Terms of Service and Privacy Policy.
          You can cancel your subscription anytime from your account settings.
        </p>
      </motion.div>
    </div>
  );
};