import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import NewWelcomeScreen from '@/components/onboarding/new-welcome-screen';
import BenefitsGoalsScreen from '@/components/onboarding/benefits-goals-screen';
import NewSubscriptionScreen from '@/components/onboarding/new-subscription-screen';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const { user } = useAuth();
  const { data, updateData, resetData } = useOnboarding();
  const [, setLocation] = useLocation();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();
  
  // Parse URL query parameters from current location
  const searchParams = new URLSearchParams(window.location.search);
  const isSuccessfulCheckout = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  
  // Process Stripe checkout success if applicable
  useEffect(() => {
    if (isSuccessfulCheckout && sessionId && !paymentSuccess) {
      setIsProcessingPayment(true);
      
      // Process the checkout session
      fetch(`/api/subscription/process-checkout?session_id=${sessionId}`, {
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setPaymentSuccess(true);
            toast({
              title: "Payment Successful",
              description: "Your premium subscription is now active!",
              variant: "default",
            });
            
            // Mark onboarding as complete and update subscription
            updateData({ 
              onboardingComplete: true, 
              subscriptionPlan: 'premium',
              subscriptionStatus: 'active'  // Add this line to properly set subscription status
            });
            
            // Force refresh user data to sync subscription status
            await fetch('/api/user', { credentials: 'include' })
              .then(res => res.json())
              .then(userData => {
                // Update global user state if needed
                if (userData) {
                  console.log('User data refreshed after subscription:', userData);
                }
              })
              .catch(err => console.error('Error refreshing user data:', err));
            
            // Redirect to home after a short delay
            setTimeout(() => {
              setLocation('/home');
            }, 2000);
          } else {
            throw new Error(data.error || "Payment processing failed");
          }
        })
        .catch(error => {
          console.error("Payment verification error:", error);
          toast({
            title: "Payment Error",
            description: error.message || "There was a problem processing your payment",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsProcessingPayment(false);
        });
    }
  }, [isSuccessfulCheckout, sessionId, paymentSuccess, setLocation, toast, updateData]);
  
  // Force light theme for onboarding
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => document.documentElement.classList.remove('light');
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Initialize or retrieve step
  useEffect(() => {
    // If coming back to onboarding and no successful payment, ensure we start at step 0
    if (data.step > 2 && !isSuccessfulCheckout) {
      updateData({ step: 0 });
    }
  }, []);

  const handleNext = () => {
    // If last step
    if (data.step === 2) {
      // Mark onboarding as complete
      updateData({ onboardingComplete: true });
      
      // If premium subscription selected, go to payment page
      if (data.subscriptionPlan === 'premium') {
        // Store the redirect destination so we can redirect to home after payment
        updateData({ paymentRedirect: '/home' });
        setLocation('/payment');
      } else {
        // For free users, go directly to home
        setLocation('/home');
      }
      return;
    }
    
    // Otherwise, move to next step
    updateData({ step: data.step + 1 });
  };

  const handleBack = () => {
    if (data.step === 0) {
      setShowExitConfirm(true);
    } else {
      updateData({ step: data.step - 1 });
    }
  };

  const handleExit = () => {
    resetData();
    setLocation('/home');
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // Calculate progress percentage
  const progressPercentage = ((data.step + 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8f7f2] flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex justify-between items-center">
        {data.step > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        )}
        {data.step === 0 && <div className="w-10"></div>}
        
        <div className="w-full max-w-[200px] mx-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <span className="text-sm font-medium text-gray-500">
          {data.step + 1} of 3
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {isProcessingPayment || paymentSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3">
              {paymentSuccess ? "Payment Successful!" : "Processing Payment..."}
            </h2>
            <p className="text-gray-600 max-w-md mb-8">
              {paymentSuccess 
                ? "Your premium subscription has been activated. You'll be redirected to your dashboard shortly."
                : "Please wait while we process your payment. This may take a few seconds..."}
            </p>
            
            {paymentSuccess && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="h-1 bg-green-500 rounded-full max-w-xs"
              />
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={data.step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {data.step === 0 && <NewWelcomeScreen onNext={handleNext} />}
              {data.step === 1 && <BenefitsGoalsScreen onNext={handleNext} />}
              {data.step === 2 && <NewSubscriptionScreen onNext={handleNext} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-2">Exit Setup?</h3>
            <p className="text-gray-600 mb-6">
              Your progress won't be saved. Are you sure you want to exit?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelExit}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleExit}
              >
                Exit Setup
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}