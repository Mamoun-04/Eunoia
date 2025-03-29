import React, { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Sparkles, Smartphone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

// Mock product IDs (would come from iOS StoreKit in reality)
const PRODUCT_IDS = {
  monthly: 'eunoia.premium.monthly',
  yearly: 'eunoia.premium.yearly',
};

interface IOSSubscriptionProps {
  onComplete?: () => void;
}

export const IOSSubscription: React.FC<IOSSubscriptionProps> = ({ onComplete }) => {
  const { 
    status, 
    isLoading, 
    error, 
    isApplePaymentInProgress,
    purchaseIOSSubscription,
    restoreIOSPurchases
  } = useSubscription();
  
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCT_IDS.monthly);
  
  // Handle purchase
  const handlePurchase = async () => {
    await purchaseIOSSubscription(selectedProductId);
    if (onComplete) {
      onComplete();
    }
  };
  
  // Handle restore purchases
  const handleRestore = async () => {
    await restoreIOSPurchases();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading subscription details...</p>
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
  
  // Ensure status exists and handle correctly
  if (status && typeof status === 'object' && 'plan' in status && 'isActive' in status) {
    // If user already has an active premium subscription
    if (status.plan === 'premium' && status.isActive) {
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
            You have an active premium subscription through App Store
            {'expiresAt' in status && typeof status.expiresAt === 'string' && ` until ${new Date(status.expiresAt).toLocaleDateString()}`}.
          </p>
          
          <div className="mt-6 space-y-2 w-full">
            <p className="text-sm text-gray-500 mb-4">
              To manage your subscription, please visit the App Store &gt; Account &gt; Subscriptions
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
  }
  
  // Show subscription options
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-medium">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Select the plan that best fits your journaling needs</p>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto space-y-4"
      >
        {/* Monthly Subscription */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className={`flex flex-col cursor-pointer relative ${
              selectedProductId === PRODUCT_IDS.monthly 
                ? 'ring-2 ring-primary border-primary shadow-lg bg-gradient-to-br from-white to-blue-50' 
                : 'border-border hover:border-primary/50 hover:shadow-md transition-all duration-300'
            }`}
            onClick={() => setSelectedProductId(PRODUCT_IDS.monthly)}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-medium">Monthly Premium</CardTitle>
                  <CardDescription className="mt-1">Unlimited journaling experience</CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={`py-1 ${selectedProductId === PRODUCT_IDS.monthly ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
                >
                  Monthly
                </Badge>
              </div>
              <div className="mt-4 pt-3 border-t">
                <span className="text-2xl font-bold">$4.99</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
            </CardHeader>
            
            <CardFooter className="pt-2">
              <Button 
                variant={selectedProductId === PRODUCT_IDS.monthly ? 'default' : 'outline'} 
                className="w-full py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProductId(PRODUCT_IDS.monthly);
                }}
              >
                {selectedProductId === PRODUCT_IDS.monthly ? 'Selected' : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Yearly Subscription */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className={`flex flex-col cursor-pointer relative overflow-hidden ${
              selectedProductId === PRODUCT_IDS.yearly 
                ? 'ring-2 ring-[#FFD700] border-[#FFD700] shadow-xl bg-gradient-to-br from-white to-yellow-50' 
                : 'border border-amber-200 ring-1 ring-amber-100 shadow-md hover:shadow-lg hover:border-amber-300 hover:ring-amber-200 transition-all duration-300'
            }`}
            onClick={() => setSelectedProductId(PRODUCT_IDS.yearly)}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 text-xs font-medium rounded-bl-md">
              BEST VALUE
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-medium flex items-center">
                    Yearly Premium 
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
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="mt-1">Unlimited journaling experience</CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={`py-1 ${selectedProductId === PRODUCT_IDS.yearly ? 'bg-amber-100 text-amber-800' : 'text-gray-500'}`}
                >
                  Yearly
                </Badge>
              </div>
              <div className="mt-4 pt-3 border-t">
                <span className="text-2xl font-bold">$49.99</span>
                <span className="text-gray-500 ml-1">/year</span>
                <div className="text-green-600 text-sm mt-1 font-medium">Save $10 per year</div>
              </div>
            </CardHeader>
            
            <CardFooter className="pt-2">
              <Button 
                variant={selectedProductId === PRODUCT_IDS.yearly ? 'default' : 'outline'} 
                className="w-full py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProductId(PRODUCT_IDS.yearly);
                }}
              >
                {selectedProductId === PRODUCT_IDS.yearly ? 'Selected' : 'Select Plan'}
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
            onClick={handlePurchase}
            disabled={isApplePaymentInProgress}
            className="w-full py-6 text-base bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 text-white shadow-md"
          >
            {isApplePaymentInProgress ? (
              <span className="flex items-center">
                <Spinner className="mr-2" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5" />
                Subscribe with App Store
              </span>
            )}
          </Button>
        </motion.div>
        
        <Button 
          variant="outline" 
          onClick={handleRestore}
          disabled={isApplePaymentInProgress}
          className="w-full"
        >
          Restore Purchases
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-4 px-4">
          Payment will be charged to your Apple ID account at the confirmation of purchase. 
          Subscription automatically renews unless it is canceled at least 24 hours before the 
          end of the current period. Your account will be charged for renewal within 24 hours prior 
          to the end of the current period. You can manage and cancel your subscriptions by going to 
          your account settings on the App Store.
        </p>
      </motion.div>
    </div>
  );
};