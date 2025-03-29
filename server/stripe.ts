import Stripe from 'stripe';
import express, { Request, Response } from 'express';
import { storage } from './storage';
import { subscriptionPlans } from '@shared/schema';

// Initialize Stripe with the secret test key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export function setupStripeRoutes(app: express.Express) {
  // Create a payment intent for one-time payments
  app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const { amount, subscription_type, currency = 'usd' } = req.body;
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          subscription_type,
        },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a subscription
  app.post('/api/create-subscription', async (req: Request, res: Response) => {
    try {
      const { priceId, userId, plan } = req.body;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create or get customer
      let customer = await stripe.customers.list({ email: user.username + '@example.com', limit: 1 });
      
      if (!customer.data.length) {
        customer = await stripe.customers.create({
          email: user.username + '@example.com',
          metadata: { userId: userId.toString() }
        });
      }

      // Create subscription with proper items array
      const subscription = await stripe.subscriptions.create({
        customer: customer.data?.[0]?.id || customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user's subscription in the database
      const subscriptionType = subscription.items.data[0].plan.interval === 'month' 
        ? 'monthly' 
        : 'yearly';
        
      await storage.updateUser(userId, {
        subscriptionStatus: subscriptionType,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      });

      res.status(200).json({ subscription });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update subscription
  app.post('/api/update-subscription', async (req: Request, res: Response) => {
    try {
      const { subscriptionId, priceId, userId } = req.body;
      
      // Retrieve the subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Update the subscription with the new price
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
      });

      // Update user's subscription in the database
      const subscriptionType = updatedSubscription.items.data[0].plan.interval === 'month' 
        ? 'monthly' 
        : 'yearly';
        
      await storage.updateUser(userId, {
        subscriptionStatus: subscriptionType,
        subscriptionEndDate: new Date(updatedSubscription.current_period_end * 1000),
      });

      res.status(200).json({ subscription: updatedSubscription });
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel subscription
  app.post('/api/cancel-subscription', async (req: Request, res: Response) => {
    try {
      const { subscriptionId, userId } = req.body;
      
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      
      // Update user's subscription in the database
      await storage.updateUser(userId, {
        subscriptionStatus: "free",
        subscriptionEndDate: null,
      });

      res.status(200).json({ subscription });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Setup webhook for handling Stripe events
  app.post('/api/webhook', express.json({ type: 'application/json' }), async (req, res) => {
    const event = req.body;

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Handle successful payment
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        // Handle successful invoice payment
        console.log('Invoice paid:', invoice.id);
        break;
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        // Handle subscription cancellation
        console.log('Subscription canceled:', subscription.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  });
}