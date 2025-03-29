import Stripe from 'stripe';
import express, { Request, Response } from 'express';
import { storage } from './storage';
import { User } from '@shared/schema';

// Initialize Stripe with the secret key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

// Define price IDs for subscription plans
// Stripe test mode price IDs - these should be created in your Stripe dashboard
// and then set in environment variables
const PRICES = {
  premium: {
    // Using fallback test price IDs that should be replaced with actual IDs from Stripe dashboard
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1ObXvEFGCOiwOKmXxxxxxxxxM', // Test price ID for $4.99/month
    yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_1ObXvtFGCOiwOKmXxxxxxxxxY',  // Test price ID for $49.99/year
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
        console.error('Authentication required but user not found in session');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      console.log(`Processing subscription request for user ID: ${userId}`);
      
      const { plan, billingPeriod } = req.body;
      
      if (plan !== 'premium' || !['monthly', 'yearly'].includes(billingPeriod)) {
        return res.status(400).json({ error: 'Invalid subscription parameters' });
      }
      
      // Check if user exists in database
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found in database`);
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get the appropriate price ID based on plan and billing period
      // Type assertion to handle the dynamic access
      const priceId = PRICES.premium[billingPeriod as 'monthly' | 'yearly'];
      
      console.log('Creating Stripe checkout session with price ID:', priceId);
      
      // Log the request headers
      console.log('Request headers:', {
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host
      });
      
      const origin = req.headers.origin || 
                    `https://${req.headers.host}` || 
                    'https://eunoia.replit.app';
                    
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
        success_url: `${origin}/onboarding?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/onboarding`,
        client_reference_id: userId.toString(),
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
      
      // Log the session details
      console.log(`Processing checkout for session ${session_id}`);
      console.log(`User ID: ${userId}`);
      console.log(`Payment status: ${session.payment_status}`);
      console.log(`Session metadata:`, session.metadata);
      
      // Get billing period from session metadata
      const billingPeriod = session.metadata?.billingPeriod;
      if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
        console.error(`Invalid billing period in metadata: ${billingPeriod}`);
        return res.status(400).json({ error: 'Invalid subscription details' });
      }
      
      // Determine subscription status
      const subscriptionStatus = billingPeriod; // Should be 'monthly' or 'yearly'
      
      // Retrieve the subscription details to get the end date
      const subscriptionId = session.subscription as string;
      console.log(`Retrieving subscription details for ID: ${subscriptionId}`);
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Calculate end date based on billing period
      const currentPeriodEnd = subscription.current_period_end * 1000;
      const subscriptionEndDate = new Date(currentPeriodEnd);
      
      console.log(`Subscription end date: ${subscriptionEndDate.toISOString()}`);
      console.log(`Setting user subscription status to: ${subscriptionStatus}`);
      
      // Update user's subscription details
      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true
      });
      
      console.log(`User subscription updated successfully: ${updatedUser.subscriptionStatus}`);
      
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
      
      console.log(`Processing subscription cancellation for user ${userId}`);
      
      // Check if user has a Stripe subscription
      if (user.stripeSubscriptionId) {
        try {
          console.log(`Canceling Stripe subscription ${user.stripeSubscriptionId}`);
          
          // Update subscription in Stripe to cancel at period end
          const subscription = await stripe.subscriptions.update(
            user.stripeSubscriptionId,
            { cancel_at_period_end: true }
          );
          
          console.log('Subscription set to cancel at period end');
          
          // Keep subscription status but mark as canceled at period end
          await storage.updateUser(userId, {
            cancelAtPeriodEnd: true,
            // Keep the subscription active until the end date
            subscriptionEndDate: new Date(subscription.current_period_end * 1000)
          });
          
          return res.status(200).json({ 
            success: true,
            message: 'Your subscription will be canceled at the end of the current billing period.',
            endDate: new Date(subscription.current_period_end * 1000).toISOString()
          });
        } catch (stripeError: any) {
          console.error('Error canceling Stripe subscription:', stripeError);
          // Fallback to manual cancellation if Stripe operation fails
        }
      }
      
      // Handle cases where there's no Stripe subscription or Stripe cancellation failed
      console.log('Manually canceling subscription for user');
      
      // if user has a valid subscription end date that is in the future, keep it
      // otherwise set it to null and immediately cancel
      const currentDate = new Date();
      const hasValidEndDate = user.subscriptionEndDate && user.subscriptionEndDate > currentDate;
      
      await storage.updateUser(userId, {
        // Only switch to free if there's no valid end date
        subscriptionStatus: hasValidEndDate ? user.subscriptionStatus : 'free',
        // Keep the end date if it's valid, otherwise set to null
        subscriptionEndDate: hasValidEndDate ? user.subscriptionEndDate : null,
        cancelAtPeriodEnd: hasValidEndDate,
        subscriptionActive: hasValidEndDate
      });
      
      return res.status(200).json({ 
        success: true,
        message: hasValidEndDate 
          ? 'Your subscription will be canceled at the end of the current billing period.' 
          : 'Your subscription has been canceled.',
        endDate: hasValidEndDate ? user.subscriptionEndDate?.toISOString() : null
      });
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
      const { productId, receiptData } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: 'Missing product ID' });
      }
      
      console.log(`Processing iOS purchase for user ${userId}, product ${productId}`);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // In a real implementation, this would verify the purchase with Apple's servers
      // using the receipt data to validate the transaction
      if (receiptData) {
        console.log('Received receipt data, would verify with Apple in production');
      }
      
      // Determine subscription type from product ID
      const subscriptionStatus = productId.includes('monthly') ? 'monthly' : 'yearly';
      
      // Calculate the end date (1 month or 1 year from now)
      const now = new Date();
      const subscriptionEndDate = subscriptionStatus === 'monthly' 
        ? new Date(now.setMonth(now.getMonth() + 1)) 
        : new Date(now.setFullYear(now.getFullYear() + 1));
      
      console.log(`Setting subscription to ${subscriptionStatus} until ${subscriptionEndDate.toISOString()}`);
      
      // Update the user's subscription in the database
      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
        subscriptionActive: true,
        cancelAtPeriodEnd: false
      });
      
      console.log(`iOS subscription activated for user ${userId}`);
      
      res.status(200).json({ 
        success: true,
        plan: subscriptionStatus,
        expiresAt: subscriptionEndDate.toISOString()
      });
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
    
    console.log(`Processing completed checkout session for user ${userId}`);
    
    // Retrieve the subscription to get additional details
    if (session.subscription) {
      console.log(`Retrieving subscription details for ID: ${session.subscription}`);
      
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const subscriptionStatus = subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly';
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      console.log(`Subscription type: ${subscriptionStatus}, ends at: ${subscriptionEndDate.toISOString()}`);
      
      // Update the user's subscription details
      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
        stripeSubscriptionId: subscription.id,
        subscriptionActive: true,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
      
      console.log(`User subscription successfully updated: ${updatedUser.subscriptionStatus}, active until: ${updatedUser.subscriptionEndDate?.toISOString()}`);
    } else {
      console.warn(`No subscription found in session ${session.id}`);
    }
  } catch (error: any) {
    console.error('Error processing checkout session:', error.message);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Extract metadata to identify the user
    const metadata = subscription.metadata || {};
    let userId = parseInt(metadata.userId || '0');
    
    // If metadata doesn't have the userId, try to find the user by subscription ID
    if (!userId) {
      console.log(`No userId in metadata, looking up by subscription ID: ${subscription.id}`);
      
      try {
        // Find the user with this subscription ID
        const allUsers = await storage.getAllUsers();
        const userWithSubscription = allUsers.find((user: User) => 
          user.stripeSubscriptionId === subscription.id
        );
        
        if (userWithSubscription) {
          userId = userWithSubscription.id;
          console.log(`Found user ${userId} with matching subscription ID`);
        } else {
          console.error(`Could not find user for subscription: ${subscription.id}`);
          return;
        }
      } catch (error) {
        const lookupError = error as Error;
        console.error(`Error looking up user by subscription ID: ${lookupError.message}`);
        return;
      }
    }
    
    // Determine updated subscription details
    const subscriptionStatus = subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly';
    const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    console.log(`Updating subscription for user ${userId}:`);
    console.log(`- Type: ${subscriptionStatus}`);
    console.log(`- End date: ${subscriptionEndDate.toISOString()}`);
    console.log(`- Cancel at period end: ${cancelAtPeriodEnd}`);
    
    // Only mark as free after subscription period ends
    const currentDate = new Date();
    const isExpired = subscriptionEndDate < currentDate;
    
    // Update the user's subscription
    const updatedUser = await storage.updateUser(userId, {
      // Only change to free if it's expired AND canceled
      subscriptionStatus: (cancelAtPeriodEnd && isExpired) ? 'free' : subscriptionStatus,
      // Keep the end date regardless of cancellation status
      subscriptionEndDate: cancelAtPeriodEnd ? subscriptionEndDate : subscriptionEndDate,
      // Track cancellation status
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      // Subscription is active if not expired
      subscriptionActive: !isExpired
    });
    
    console.log(`Subscription updated for user ${userId}: ${updatedUser.subscriptionStatus}`);
  } catch (error: any) {
    console.error('Error updating subscription:', error.message);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Extract metadata to identify the user
    const metadata = subscription.metadata || {};
    let userId = parseInt(metadata.userId || '0');
    
    // If metadata doesn't have the userId, try to find the user by subscription ID
    if (!userId) {
      console.log(`No userId in metadata, looking up by subscription ID: ${subscription.id}`);
      
      try {
        // Find the user with this subscription ID
        const allUsers = await storage.getAllUsers();
        const userWithSubscription = allUsers.find((user: User) => 
          user.stripeSubscriptionId === subscription.id
        );
        
        if (userWithSubscription) {
          userId = userWithSubscription.id;
          console.log(`Found user ${userId} with matching subscription ID`);
        } else {
          console.error(`Could not find user for deleted subscription: ${subscription.id}`);
          return;
        }
      } catch (error) {
        const lookupError = error as Error;
        console.error(`Error looking up user by subscription ID: ${lookupError.message}`);
        return;
      }
    }
    
    // Update the user's subscription status to free
    const updatedUser = await storage.updateUser(userId, {
      subscriptionStatus: 'free',
      subscriptionEndDate: null,
      stripeSubscriptionId: null,
      subscriptionActive: false,
      cancelAtPeriodEnd: false
    });
    
    console.log(`Subscription deleted for user ${userId}, status set to: ${updatedUser.subscriptionStatus}`);
  } catch (error: any) {
    console.error('Error handling subscription deletion:', error.message);
  }
}