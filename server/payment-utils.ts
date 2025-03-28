import Stripe from 'stripe';
import iap from 'in-app-purchase';
import { subscriptionPlans } from '@shared/schema';

// Initialize Stripe with test key for now (will be replaced with env variable)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key';
const stripe = new Stripe(stripeSecretKey);

// Initialize Apple IAP verification
const appleSharedSecret = process.env.APPLE_SHARED_SECRET || 'dummy_secret';

// Apple IAP product IDs - these would match what's configured in App Store Connect
const APPLE_PRODUCT_IDS = {
  monthly: 'com.your_app.subscription.monthly',
  yearly: 'com.your_app.subscription.yearly',
  lifetime: 'com.your_app.subscription.lifetime'
};

// Initialize the in-app-purchase verification
export async function setupIAP() {
  iap.config({
    applePassword: appleSharedSecret,
    test: true // Set to false in production
  });
  
  await iap.setup();
  console.log('In-app purchase validation service initialized');
}

// Stripe payment methods
export const stripePayments = {
  // Create a Stripe customer if they don't exist yet
  async getOrCreateCustomer(userId: number, email: string) {
    try {
      // Search for existing customer
      const customers = await stripe.customers.list({
        email,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        return customers.data[0];
      }
      
      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId: userId.toString()
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating/fetching Stripe customer:', error);
      throw error;
    }
  },
  
  // Create a subscription
  async createSubscription(customerId: string, planId: string) {
    try {
      const planKey = planId as keyof typeof subscriptionPlans;
      
      // For lifetime access, create a one-time payment instead
      if (planKey === 'lifetime') {
        // Create a payment intent for one-time payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(subscriptionPlans.lifetime.price * 100), // Convert to cents
          currency: 'usd',
          customer: customerId,
          metadata: {
            planId: 'lifetime'
          }
        });
        
        return {
          type: 'payment_intent',
          paymentIntent,
          endDate: null // Lifetime subscriptions don't have an end date
        };
      }
      
      // For monthly/yearly, create a subscription
      // First, find or create the price in Stripe
      let price;
      try {
        const prices = await stripe.prices.list({
          lookup_keys: [planKey],
          active: true
        });
        
        if (prices.data.length > 0) {
          price = prices.data[0];
        } else {
          // Create the price if it doesn't exist
          price = await stripe.prices.create({
            currency: 'usd',
            unit_amount: Math.round(subscriptionPlans[planKey].price * 100),
            recurring: {
              interval: subscriptionPlans[planKey].interval as 'month' | 'year'
            },
            product_data: {
              name: subscriptionPlans[planKey].name
            },
            lookup_key: planKey
          });
        }
      } catch (error) {
        console.error('Error creating/fetching Stripe price:', error);
        throw error;
      }
      
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: price.id
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
      
      return {
        type: 'subscription',
        subscription,
        endDate: new Date(subscription.current_period_end * 1000)
      };
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  },
  
  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error cancelling Stripe subscription:', error);
      throw error;
    }
  }
};

// Apple IAP verification methods
export const applePayments = {
  // Verify a receipt and get subscription information
  async verifyReceipt(receiptData: string) {
    try {
      const validationResponse = await iap.validate(receiptData);
      const isValid = iap.isValidated(validationResponse);
      
      if (!isValid) {
        throw new Error('Invalid receipt');
      }
      
      // Get the purchase info from the validation response
      const purchaseData = iap.getPurchaseData(validationResponse);
      if (!purchaseData || purchaseData.length === 0) {
        throw new Error('No purchase data found');
      }
      
      const purchase = purchaseData[0];
      
      // Find the plan type based on the product ID
      let planType: string | null = null;
      let endDate: Date | null = null;
      
      for (const [key, value] of Object.entries(APPLE_PRODUCT_IDS)) {
        if (value === purchase.productId) {
          planType = key;
          break;
        }
      }
      
      if (!planType) {
        throw new Error('Unknown product ID');
      }
      
      // Set end date for auto-renewable subscriptions
      if (planType === 'monthly' || planType === 'yearly') {
        // Convert the expiry date from seconds to milliseconds
        endDate = new Date(purchase.expirationDate);
      }
      
      return {
        originalTransactionId: purchase.originalTransactionId,
        planType,
        endDate
      };
    } catch (error) {
      console.error('Error verifying Apple receipt:', error);
      throw error;
    }
  }
};

// Helper function to determine if a subscription is active
export function isSubscriptionActive(endDate: Date | null, planType: string): boolean {
  // Lifetime plans are always active
  if (planType === 'lifetime') {
    return true;
  }
  
  // If there's no end date, subscription is not active
  if (!endDate) {
    return false;
  }
  
  // Compare with current date
  const now = new Date();
  return now < endDate;
}