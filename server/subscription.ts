import Stripe from 'stripe';
import express, { Request, Response } from 'express';
import { storage } from './storage';

// Initialize Stripe with the secret key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

// Define price IDs for subscription plans
const PRICES = {
  premium: {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly',
  },
};

export function setupSubscriptionRoutes(app: express.Express) {
  // Get current subscription status
  app.get('/api/subscription/status', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Determine subscription plan based on user's subscription status
      const plan = user.subscriptionStatus === 'free' ? 'free' : 'premium';
      const isActive = user.subscriptionStatus === 'monthly' || user.subscriptionStatus === 'yearly';
      
      // Build subscription response
      const response = {
        plan,
        isActive,
        expiresAt: user.subscriptionEndDate?.toISOString() || null,
        cancelAtPeriodEnd: false, // Would come from Stripe in production
        billingPeriod: user.subscriptionStatus === 'monthly' ? 'monthly' : 
                       user.subscriptionStatus === 'yearly' ? 'yearly' : undefined,
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create checkout session for Stripe
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const { plan, billingPeriod } = req.body;
      
      if (plan !== 'premium' || !['monthly', 'yearly'].includes(billingPeriod)) {
        return res.status(400).json({ error: 'Invalid subscription parameters' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get the appropriate price ID based on plan and billing period
      // Type assertion to handle the dynamic access
      const priceId = PRICES.premium[billingPeriod as 'monthly' | 'yearly'];
      
      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/subscribe/canceled`,
        client_reference_id: userId.toString(),
        customer_email: user.username + '@example.com', // Placeholder for real email
        metadata: {
          userId: userId.toString(),
          plan,
          billingPeriod,
        },
      });
      
      res.status(200).json({ url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Process successful Stripe checkout
  app.get('/api/subscription/process-checkout', async (req: Request, res: Response) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({ error: 'Missing session ID' });
      }
      
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (!session || session.status !== 'complete') {
        return res.status(400).json({ error: 'Invalid or incomplete session' });
      }
      
      const userId = parseInt(session.client_reference_id || '0');
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user reference' });
      }
      
      // Update the user's subscription status based on the session's metadata
      const subscriptionStatus = session.metadata?.billingPeriod;
      if (!subscriptionStatus) {
        return res.status(400).json({ error: 'Missing subscription details' });
      }
      
      // Retrieve the subscription details to get the end date
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      // Update the user's subscription status in the database
      await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error processing subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Cancel subscription
  app.post('/api/cancel-subscription', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // In a real implementation, this would cancel the subscription in Stripe
      // For now, we'll just update the user's subscription status
      await storage.updateUser(userId, {
        subscriptionStatus: 'free',
        subscriptionEndDate: null,
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Mock iOS purchase endpoint (for demo purposes)
  app.post('/api/ios/purchase', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Missing product ID' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // In a real implementation, this would verify the purchase with Apple's servers
      // For now, we'll just update the user's subscription status based on the product ID
      const subscriptionStatus = productId.includes('monthly') ? 'monthly' : 'yearly';
      
      // Calculate the end date (1 month or 1 year from now)
      const now = new Date();
      const subscriptionEndDate = subscriptionStatus === 'monthly' 
        ? new Date(now.setMonth(now.getMonth() + 1)) 
        : new Date(now.setFullYear(now.getFullYear() + 1));
      
      // Update the user's subscription status in the database
      await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error processing iOS purchase:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Mock iOS restore purchases endpoint (for demo purposes)
  app.post('/api/ios/restore-purchases', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // In a real implementation, this would check for active subscriptions with Apple's servers
      // For demo purposes, we'll just return success (no change)
      
      res.status(200).json({ 
        success: true,
        restored: false,
        message: 'No active subscriptions found to restore'
      });
    } catch (error: any) {
      console.error('Error restoring iOS purchases:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Stripe webhook for handling subscription events
  app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    
    let event;
    
    try {
      // Verify the webhook signature
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!endpointSecret) {
        console.warn('Missing STRIPE_WEBHOOK_SECRET, skipping signature verification');
        event = req.body;
      } else {
        // Parse and verify the webhook payload
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      }
      
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          await handleCheckoutSessionCompleted(session);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          await handleSubscriptionUpdated(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await handleSubscriptionDeleted(subscription);
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
}

// Helper functions for webhook event handling

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const userId = parseInt(session.client_reference_id || '0');
    if (!userId) {
      console.error('Invalid user reference in session:', session.id);
      return;
    }
    
    // Retrieve the subscription to get additional details
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const subscriptionStatus = subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly';
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      // Update the user's subscription status
      await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
      });
      
      console.log(`Subscription ${subscriptionStatus} activated for user ${userId}`);
    }
  } catch (error: any) {
    console.error('Error processing checkout session:', error.message);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Extract metadata to identify the user
    const metadata = subscription.metadata || {};
    const userId = parseInt(metadata.userId || '0');
    
    if (!userId) {
      console.error('Could not determine user for subscription:', subscription.id);
      return;
    }
    
    // Determine new subscription status
    const subscriptionStatus = subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly';
    const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    // Update the user's subscription
    await storage.updateUser(userId, {
      subscriptionStatus: cancelAtPeriodEnd ? 'free' : subscriptionStatus,
      subscriptionEndDate: cancelAtPeriodEnd ? null : subscriptionEndDate,
    });
    
    console.log(`Subscription updated for user ${userId}: ${subscriptionStatus}, cancel at period end: ${cancelAtPeriodEnd}`);
  } catch (error: any) {
    console.error('Error updating subscription:', error.message);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Extract metadata to identify the user
    const metadata = subscription.metadata || {};
    const userId = parseInt(metadata.userId || '0');
    
    if (!userId) {
      console.error('Could not determine user for deleted subscription:', subscription.id);
      return;
    }
    
    // Update the user's subscription status to free
    await storage.updateUser(userId, {
      subscriptionStatus: 'free',
      subscriptionEndDate: null,
    });
    
    console.log(`Subscription deleted for user ${userId}`);
  } catch (error: any) {
    console.error('Error handling subscription deletion:', error.message);
  }
}