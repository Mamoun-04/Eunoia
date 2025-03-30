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

// Define price IDs for subscription plans (replace fallback IDs with your actual ones)
const PRICES = {
  premium: {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1ObXvEFGCOiwOKmXxxxxxxxxM',
    yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_1ObXvtFGCOiwOKmXxxxxxxxxY',
  },
};

// Global set for deduplication of webhook events
const processedEvents = new Set<string>();

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
      const plan = user.subscriptionStatus === 'free' ? 'free' : 'premium';
      const isActive = user.subscriptionStatus === 'monthly' || user.subscriptionStatus === 'yearly';
      const response = {
        plan,
        isActive,
        expiresAt: user.subscriptionEndDate?.toISOString() || null,
        cancelAtPeriodEnd: user.cancelAtPeriodEnd || false,
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
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found in database`);
        return res.status(404).json({ error: 'User not found' });
      }

      // Get the appropriate price ID based on plan and billing period
      const priceId = PRICES.premium[billingPeriod as 'monthly' | 'yearly'];
      console.log('Creating Stripe checkout session with price ID:', priceId);

      // Log the request headers
      console.log('Request headers:', {
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host
      });

      const origin = req.headers.origin || `https://${req.headers.host}` || 'https://eunoia.replit.app';

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
      // Check using payment_status instead of session.status
      if (!session || session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Invalid or incomplete session' });
      }

      const userId = parseInt(session.client_reference_id || '0');
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user reference' });
      }

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
      const subscriptionStatus = billingPeriod;
      const subscriptionId = session.subscription as string;
      console.log(`Retrieving subscription details for ID: ${subscriptionId}`);

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentPeriodEnd = subscription.current_period_end * 1000;
      const subscriptionEndDate = new Date(currentPeriodEnd);

      console.log(`Subscription end date: ${subscriptionEndDate.toISOString()}`);
      console.log(`Setting user subscription status to: ${subscriptionStatus}`);

      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus,
        subscriptionEndDate,
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        cancelAtPeriodEnd: false,
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

      if (user.stripeSubscriptionId) {
        try {
          console.log(`Canceling Stripe subscription ${user.stripeSubscriptionId}`);
          const subscription = await stripe.subscriptions.update(
            user.stripeSubscriptionId,
            { cancel_at_period_end: true }
          );
          console.log('Subscription set to cancel at period end');
          await storage.updateUser(userId, {
            cancelAtPeriodEnd: true,
            subscriptionEndDate: new Date(subscription.current_period_end * 1000)
          });
          return res.status(200).json({ 
            success: true,
            message: 'Your subscription will be canceled at the end of the current billing period.',
            endDate: new Date(subscription.current_period_end * 1000).toISOString()
          });
        } catch (stripeError: any) {
          console.error('Error canceling Stripe subscription:', stripeError);
        }
      }
      console.log('Manually canceling subscription for user');
      const currentDate = new Date();
      const hasValidEndDate = user.subscriptionEndDate && user.subscriptionEndDate > currentDate;
      await storage.updateUser(userId, {
        subscriptionStatus: hasValidEndDate ? user.subscriptionStatus : 'free',
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
      if (receiptData) {
        console.log('Received receipt data, would verify with Apple in production');
      }
      const subscriptionStatus = productId.includes('monthly') ? 'monthly' : 'yearly';
      const now = new Date();
      const subscriptionEndDate = subscriptionStatus === 'monthly' 
        ? new Date(now.setMonth(now.getMonth() + 1)) 
        : new Date(now.setFullYear(now.getFullYear() + 1));
      console.log(`Setting subscription to ${subscriptionStatus} until ${subscriptionEndDate.toISOString()}`);
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
  app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    console.log('Received webhook event');
    const sig = req.headers['stripe-signature'] as string;
    const eventId = req.body && req.body.id;
    if (eventId) {
      if (processedEvents.has(eventId)) {
        console.log(`Event ${eventId} already processed, skipping`);
        return res.json({ received: true, status: 'skipped_duplicate' });
      }
      processedEvents.add(eventId);
    }
    let event;
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        console.warn('Missing STRIPE_WEBHOOK_SECRET, skipping signature verification');
        event = req.body;
      } else {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
          console.log('Webhook verified successfully');
        } catch (err: any) {
          console.log(`Webhook signature verification failed:`, err);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      }
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
    const billingPeriod = session.metadata?.billingPeriod || 'monthly';
    let subscriptionStatus = billingPeriod;
    let subscriptionEndDate = new Date();
    if (billingPeriod === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }
    await storage.updateUser(userId, {
      subscriptionStatus,
      subscriptionEndDate,
      stripeSubscriptionId: session.subscription || null,
      cancelAtPeriodEnd: false,
      subscriptionActive: true,
    });
    console.log(`Updated user ${userId} to ${subscriptionStatus} subscription until ${subscriptionEndDate}`);
    if (session.subscription) {
      console.log(`Retrieving subscription details for ID: ${session.subscription}`);
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      subscriptionStatus = subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly';
      subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      console.log(`Subscription type: ${subscriptionStatus}, ends at: ${subscriptionEndDate.toISOString()}`);
    }
    const updatedUser = await storage.updateUser(userId, {
      subscriptionStatus,
      subscriptionEndDate,
      stripeSubscriptionId: session.subscription || null,
      subscriptionActive: true,
      cancelAtPeriodEnd: false,
    });
    console.log(`User subscription successfully updated: ${updatedUser.subscriptionStatus}, active until: ${updatedUser.subscriptionEndDate?.toISOString()}`);
  } catch (error: any) {
    console.error('Error processing checkout session:', error.message);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const metadata = subscription.metadata || {};
    let userId = parseInt(metadata.userId || '0');
    if (!userId) {
      console.log(`No userId in metadata, looking up by subscription ID: ${subscription.id}`);
      try {
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
    const subscriptionStatus = subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly';
    const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    console.log(`Updating subscription for user ${userId}:`);
    console.log(`- Type: ${subscriptionStatus}`);
    console.log(`- End date: ${subscriptionEndDate.toISOString()}`);
    console.log(`- Cancel at period end: ${cancelAtPeriodEnd}`);
    const currentDate = new Date();
    const isExpired = subscriptionEndDate < currentDate;
    const updatedUser = await storage.updateUser(userId, {
      subscriptionStatus: (cancelAtPeriodEnd && isExpired) ? 'free' : subscriptionStatus,
      subscriptionEndDate: subscriptionEndDate,
      cancelAtPeriodEnd: cancelAtPeriodEnd,
      subscriptionActive: !isExpired
    });
    console.log(`Subscription updated for user ${userId}: ${updatedUser.subscriptionStatus}`);
  } catch (error: any) {
    console.error('Error updating subscription:', error.message);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const metadata = subscription.metadata || {};
    let userId = parseInt(metadata.userId || '0');
    if (!userId) {
      console.log(`No userId in metadata, looking up by subscription ID: ${subscription.id}`);
      try {
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
