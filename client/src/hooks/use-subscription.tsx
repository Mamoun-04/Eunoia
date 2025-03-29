import { useState, useEffect } from 'react';
import { BillingPeriod, SubscriptionPlan } from '@/components/subscription/stripe-subscription';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the subscription status type
export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  billingPeriod?: BillingPeriod;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Define error types
interface SubscriptionError extends Error {
  code?: string;
}

/**
 * Custom hook for managing subscription state and actions
 */
export function useSubscription() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<SubscriptionError | null>(null);
  
  // Fetch subscription status
  const { 
    data: status, 
    isLoading: isStatusLoading, 
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['/api/subscription/status'],
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Set error from status query
  useEffect(() => {
    if (statusError) {
      setError(statusError as SubscriptionError);
    } else {
      setError(null);
    }
  }, [statusError]);
  
  // Create checkout session mutation
  const {
    mutate: createCheckoutSessionMutation,
    isPending: isCheckoutSessionCreating,
    error: checkoutError
  } = useMutation({
    mutationFn: async (data: { plan: SubscriptionPlan, billingPeriod: BillingPeriod }) => {
      console.log('Creating checkout session with data:', data);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Important for maintaining session cookies
      });
      
      console.log('Checkout session response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout session creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const result = await response.json();
      console.log('Checkout session created, redirecting to:', result.url);
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        // Refresh user data before redirecting
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('No redirect URL returned from checkout session creation');
        setError(new Error('No redirect URL returned from checkout session creation') as SubscriptionError);
      }
    },
    onError: (err) => {
      console.error('Error in checkout session mutation:', err);
      setError(err as SubscriptionError);
    }
  });
  
  // Create checkout session
  const createCheckoutSession = async (plan: SubscriptionPlan, billingPeriod: BillingPeriod) => {
    try {
      console.log(`Creating checkout session for plan: ${plan}, billing period: ${billingPeriod}`);
      createCheckoutSessionMutation({ plan, billingPeriod });
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err);
    }
  };
  
  // Cancel subscription mutation
  const {
    mutate: cancelSubscriptionMutation,
    isPending: isCancellingSubscription,
    error: cancelError
  } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (err) => {
      setError(err as SubscriptionError);
    }
  });
  
  // Cancel subscription
  const cancelStripeSubscription = async () => {
    try {
      await cancelSubscriptionMutation();
    } catch (err: any) {
      setError(err);
    }
  };
  
  // iOS Purchase mutation
  const {
    mutate: purchaseIOSSubscriptionMutation,
    isPending: isApplePaymentInProgress,
    error: iosPurchaseError
  } = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch('/api/ios/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process iOS purchase');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (err) => {
      setError(err as SubscriptionError);
    }
  });
  
  // Purchase iOS subscription
  const purchaseIOSSubscription = async (productId: string) => {
    try {
      await purchaseIOSSubscriptionMutation(productId);
    } catch (err: any) {
      setError(err);
    }
  };
  
  // Restore iOS purchases mutation
  const {
    mutate: restoreIOSPurchasesMutation,
    isPending: isRestoringIOSPurchases,
    error: iosRestoreError
  } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ios/restore-purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore purchases');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (err) => {
      setError(err as SubscriptionError);
    }
  });
  
  // Restore iOS purchases
  const restoreIOSPurchases = async () => {
    try {
      await restoreIOSPurchasesMutation();
    } catch (err: any) {
      setError(err);
    }
  };
  
  // Set error from other operations
  useEffect(() => {
    if (checkoutError) {
      setError(checkoutError as SubscriptionError);
    } else if (cancelError) {
      setError(cancelError as SubscriptionError);
    } else if (iosPurchaseError) {
      setError(iosPurchaseError as SubscriptionError);
    } else if (iosRestoreError) {
      setError(iosRestoreError as SubscriptionError);
    }
  }, [checkoutError, cancelError, iosPurchaseError, iosRestoreError]);
  
  return {
    status,
    isLoading: isStatusLoading,
    error,
    isCheckoutSessionCreating,
    createCheckoutSession,
    isCancellingSubscription,
    cancelStripeSubscription,
    isApplePaymentInProgress: isApplePaymentInProgress || isRestoringIOSPurchases,
    purchaseIOSSubscription,
    restoreIOSPurchases,
    refetchStatus,
  };
}