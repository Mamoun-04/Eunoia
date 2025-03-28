import Stripe from 'stripe';
import { subscriptionPlans } from '@shared/schema';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Prices in cents
const PRICES = {
  monthly: Math.round(subscriptionPlans.monthly.price * 100),
  yearly: Math.round(subscriptionPlans.yearly.price * 100),
};

// Create a Stripe customer
export async function createStripeCustomer(email: string, username: string): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name: username,
      metadata: {
        username,
      },
    });
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer');
  }
}

// Create a checkout session for subscription
export async function createCheckoutSession(
  customerId: string,
  plan: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  try {
    // Create or get the price for the selected plan
    const priceId = await getPriceIdForPlan(plan);
    
    // Get domain from environment or use a default for local development
    // In a real production app, this should be configured properly
    const domain = process.env.APP_DOMAIN || 'http://localhost:5000';
    
    // Ensure the URLs are absolute
    const fullSuccessUrl = successUrl.startsWith('http') ? successUrl : `${domain}${successUrl}`;
    const fullCancelUrl = cancelUrl.startsWith('http') ? cancelUrl : `${domain}${cancelUrl}`;
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: fullSuccessUrl,
      cancel_url: fullCancelUrl,
      metadata: {
        plan,
      },
    });
    
    return session.url || '';
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

// Get existing price or create a new one
async function getPriceIdForPlan(plan: 'monthly' | 'yearly'): Promise<string> {
  try {
    // First, check if we already have a price for this plan
    const prices = await stripe.prices.list({
      lookup_keys: [plan],
      active: true,
      limit: 1,
    });
    
    if (prices.data.length > 0) {
      return prices.data[0].id;
    }
    
    // Create a new product if needed
    const product = await stripe.products.create({
      name: `Eunoia Journal ${plan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
      description: plan === 'monthly' 
        ? 'Monthly access to all premium features' 
        : 'Annual access to all premium features (save 15%)',
    });
    
    // Create a price for the product
    const price = await stripe.prices.create({
      unit_amount: PRICES[plan],
      currency: 'usd',
      recurring: {
        interval: plan === 'monthly' ? 'month' : 'year',
      },
      product: product.id,
      lookup_key: plan,
    });
    
    return price.id;
  } catch (error) {
    console.error('Error getting/creating price:', error);
    throw new Error('Failed to get or create price');
  }
}

// Verify and handle webhook events from Stripe
export async function handleStripeWebhook(requestBody: any, signature: string): Promise<{ status: string; data?: any }> {
  try {
    // Verify webhook signature
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      console.error('Stripe webhook secret is not set');
      return { status: 'error', data: 'Webhook secret not configured' };
    }
    
    // Construct event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        requestBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return { status: 'error', data: 'Invalid signature' };
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        return { 
          status: 'success', 
          data: {
            customerId: checkoutSession.customer,
            subscriptionId: checkoutSession.subscription,
            plan: checkoutSession.metadata?.plan || 'monthly',
          }
        };
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        return { 
          status: 'success', 
          data: {
            customerId: subscription.customer,
            subscriptionId: subscription.id,
            status,
          }
        };
        
      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object as Stripe.Subscription;
        return { 
          status: 'success', 
          data: {
            customerId: canceledSubscription.customer,
            subscriptionId: canceledSubscription.id,
            status: 'canceled',
          }
        };
        
      default:
        return { status: 'skipped', data: `Unhandled event type: ${event.type}` };
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return { status: 'error', data: 'Failed to handle webhook' };
  }
}

// Manually cancel a subscription in Stripe
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    return false;
  }
}

// Verify if a subscription is active in Stripe
export async function verifySubscription(subscriptionId: string): Promise<{active: boolean, endDate?: Date}> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Check if the subscription is active
    const isActive = ['active', 'trialing'].includes(subscription.status);
    
    // Get the end date if available
    const endTimestamp = subscription.current_period_end;
    const endDate = endTimestamp ? new Date(endTimestamp * 1000) : undefined;
    
    return { active: isActive, endDate };
  } catch (error) {
    console.error('Error verifying Stripe subscription:', error);
    return { active: false };
  }
}