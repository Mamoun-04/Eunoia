
import { useOnboarding } from '@/hooks/use-onboarding';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import SubscriptionSuccessScreen from './subscription-success-screen';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  const scriptLoaded = useRef(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check URL parameters for payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Update subscription status
      updateData({ 
        onboardingComplete: true,
        subscriptionPlan: 'premium',
        billingPeriod: 'yearly'
      });
      // Show success screen
      setShowSuccessScreen(true);
      return;
    }

    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      
      script.onload = () => {
        const pricingTable = document.createElement('stripe-pricing-table');
        pricingTable.setAttribute('pricing-table-id', 'prctbl_1R9saQFYtWG5sSMUmvLeSfXm');
        pricingTable.setAttribute('publishable-key', 'pk_test_51QkZILFYtWG5sSMULAzOVF4WmPiRbYdcXGFw44KYbXIRHlIe8KKItA1GjnO5W8qzh53nd8JaSgEETqClSbBqifQv00h3uKBhyT');
        
        const container = document.getElementById('stripe-pricing-container');
        if (container) {
          container.innerHTML = '';
          container.appendChild(pricingTable);
        }
      };

      document.body.appendChild(script);
      scriptLoaded.current = true;

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  // If success parameter is present, show the success screen
  if (showSuccessScreen) {
    return <SubscriptionSuccessScreen />;
  }

  // Otherwise show the pricing table
  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-grow w-full"
      >
        <div id="stripe-pricing-container" className="flex-grow flex items-center justify-center"></div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel your subscription anytime from your account settings.
        </p>
      </motion.div>
    </div>
  );
}
