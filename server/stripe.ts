import Stripe from 'stripe';
import express, { Request, Response } from 'express';
import { storage } from './storage';
import { subscriptionPlans } from '@shared/schema';

// Initialize Stripe with the secret test key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51PExm5OX3dFAFDCYLW3LYZyHk9Vs7fgPbEeAOkXuCR6QJGCfI83B965uVOeX0WLtAIwCEDGP6LKxXPfQR1UwjZp800C4jJz6Xk';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51PExm5OX3dFAFDCYU34PXEAq5j3WzOAD8eGOTCe6bjyaEAeUmrj58GfLeSXTnE67dK3QzRMvHn9pnz7K44m78H0700ngM1ljJM';

// Define Stripe price IDs for subscription plans
const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1R7VvFFYtWG5sSMUuxk4XkJJ',
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_1R7VvVFYtWG5sSMU5fC8t5Z2'
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export function setupStripeRoutes(app: express.Express) {
  // Get Stripe configuration
  app.get('/api/stripe-config', (req, res) => {
    res.json({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      priceIds: STRIPE_PRICE_IDS
    });
  });

  // Create a checkout session for subscription
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    try {
      const { billingPeriod, userId, successUrl, cancelUrl } = req.body;
      
      // Validate required fields
      if (!billingPeriod || !successUrl || !cancelUrl) {
        return res.status(400).json({ 
          error: 'Missing required parameters: billingPeriod, successUrl or cancelUrl' 
        });
      }
      
      // Determine which price ID to use based on billing period
      const priceId = billingPeriod === 'yearly' 
        ? STRIPE_PRICE_IDS.yearly 
        : STRIPE_PRICE_IDS.monthly;
      
      console.log(`Creating checkout session with price ID: ${priceId}`);
      console.log('Request headers:', {
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host
      });
      
      // Create a new Checkout Session for the subscription
      // Note: API parameters changed in newer Stripe versions
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId ? String(userId) : '',
          billingPeriod,
          plan: 'premium'
        }
      });

      res.status(200).json({ url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Process completed checkout sessions
  app.get('/api/subscription/process-checkout', async (req: Request, res: Response) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id parameter' });
      }
      
      console.log(`Processing checkout for session ${session_id}`);
      
      // Retrieve the checkout session
      const session = await stripe.checkout.sessions.retrieve(String(session_id));
      
      // Get the user ID from the metadata
      const userId = session.metadata?.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'No user ID found in session metadata' });
      }
      
      console.log(`User ID: ${userId}`);
      console.log(`Payment status: ${session.payment_status}`);
      console.log(`Session metadata:`, session.metadata);
      
      // Check if payment was successful
      if (session.payment_status === 'paid') {
        // Get the subscription ID
        const subscriptionId = session.subscription as string;
        
        if (subscriptionId) {
          // Retrieve subscription details to get the current period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          console.log(`Retrieving subscription details for ID: ${subscriptionId}`);
          
          const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
          console.log(`Subscription end date: ${subscriptionEndDate.toISOString()}`);
          
          // Determine subscription type from metadata
          const subscriptionType = session.metadata?.billingPeriod || 'monthly';
          console.log(`Setting user subscription status to: ${subscriptionType}`);
          
          // Get the current user data to access preferences
          const user = await storage.getUser(parseInt(userId));
          if (!user) {
            console.log(`User ${userId} not found for subscription update`);
            return res.status(404).json({ error: 'User not found' });
          }
          
          // Parse the current preferences or create new ones
          let userPreferences = {};
          if (user.preferences) {
            try {
              userPreferences = JSON.parse(user.preferences);
            } catch (e) {
              console.error(`Error parsing preferences for user ${userId}:`, e);
            }
          }
          
          // Update the preferences with subscription plan
          userPreferences = {
            ...userPreferences,
            subscriptionPlan: subscriptionType
          };
          
          // Update the user's subscription details
          await storage.updateUser(parseInt(userId), {
            subscriptionStatus: subscriptionType,
            subscriptionEndDate: subscriptionEndDate,
            preferences: JSON.stringify(userPreferences)
          });
          
          // Also update the user's session data if they're the currently logged in user
          if (req.user && (req.user as any).id === parseInt(userId)) {
            (req.user as any).subscriptionStatus = subscriptionType;
            (req.user as any).subscriptionEndDate = subscriptionEndDate;
            
            // Also update the preferences in the session
            if ((req.user as any).preferences) {
              try {
                let sessionPreferences = JSON.parse((req.user as any).preferences);
                sessionPreferences.subscriptionPlan = subscriptionType;
                (req.user as any).preferences = JSON.stringify(sessionPreferences);
              } catch (e) {
                console.error('Error updating preferences in session:', e);
              }
            } else {
              (req.user as any).preferences = JSON.stringify({ subscriptionPlan: subscriptionType });
            }
            
            // Save the session to persist the changes
            req.session.save((err) => {
              if (err) {
                console.error('Error saving session:', err);
              } else {
                console.log('User session updated with new subscription data');
              }
            });
          }
          
          console.log(`User subscription updated successfully: ${subscriptionType}`);
        }
        
        return res.status(200).json({ success: true });
      }
      
      return res.status(400).json({ 
        error: 'Payment not completed', 
        status: session.payment_status 
      });
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a payment intent for one-time payments (keeping for backward compatibility)
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
      const { paymentMethodId, customerId, priceId, userId } = req.body;
      
      let customer;
      
      // If no customer ID is provided, create a new customer
      if (!customerId) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        customer = await stripe.customers.create({
          payment_method: paymentMethodId,
          email: user.username + '@example.com', // Replace with actual email when available
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      } else {
        customer = { id: customerId };
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user's subscription in the database
      const subscriptionType = subscription.items.data[0].plan.interval === 'month' 
        ? 'monthly' 
        : 'yearly';
        
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      // Get the current user data to access preferences
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found for subscription update`);
      }
      
      // Parse the current preferences or create new ones
      let userPreferences = {};
      if (user.preferences) {
        try {
          userPreferences = JSON.parse(user.preferences);
        } catch (e) {
          console.error(`Error parsing preferences for user ${userId}:`, e);
        }
      }
      
      // Update the preferences with subscription plan
      userPreferences = {
        ...userPreferences,
        subscriptionPlan: subscriptionType
      };
      
      // Update user in database
      await storage.updateUser(userId, {
        subscriptionStatus: subscriptionType,
        subscriptionEndDate: subscriptionEndDate,
        preferences: JSON.stringify(userPreferences)
      });
      
      // Update session data if this is the logged-in user
      if (req.user && (req.user as any).id === userId) {
        (req.user as any).subscriptionStatus = subscriptionType;
        (req.user as any).subscriptionEndDate = subscriptionEndDate;
        
        // Also update the preferences in the session
        if ((req.user as any).preferences) {
          try {
            let sessionPreferences = JSON.parse((req.user as any).preferences);
            sessionPreferences.subscriptionPlan = subscriptionType;
            (req.user as any).preferences = JSON.stringify(sessionPreferences);
          } catch (e) {
            console.error('Error updating preferences in session:', e);
          }
        } else {
          (req.user as any).preferences = JSON.stringify({ subscriptionPlan: subscriptionType });
        }
        
        // Save session to persist the changes
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session in create-subscription:', err);
          } else {
            console.log('User session updated with new subscription data');
          }
        });
      }

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
      
      const subscriptionEndDate = new Date(updatedSubscription.current_period_end * 1000);
      
      // Get the current user data to access preferences
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found for subscription update`);
      }
      
      // Parse the current preferences or create new ones
      let userPreferences = {};
      if (user.preferences) {
        try {
          userPreferences = JSON.parse(user.preferences);
        } catch (e) {
          console.error(`Error parsing preferences for user ${userId}:`, e);
        }
      }
      
      // Update the preferences with subscription plan
      userPreferences = {
        ...userPreferences,
        subscriptionPlan: subscriptionType
      };
        
      await storage.updateUser(userId, {
        subscriptionStatus: subscriptionType,
        subscriptionEndDate: subscriptionEndDate,
        preferences: JSON.stringify(userPreferences)
      });
      
      // Update session data if this is the logged-in user
      if (req.user && (req.user as any).id === userId) {
        (req.user as any).subscriptionStatus = subscriptionType;
        (req.user as any).subscriptionEndDate = subscriptionEndDate;
        
        // Also update the preferences in the session
        if ((req.user as any).preferences) {
          try {
            let sessionPreferences = JSON.parse((req.user as any).preferences);
            sessionPreferences.subscriptionPlan = subscriptionType;
            (req.user as any).preferences = JSON.stringify(sessionPreferences);
          } catch (e) {
            console.error('Error updating preferences in session:', e);
          }
        } else {
          (req.user as any).preferences = JSON.stringify({ subscriptionPlan: subscriptionType });
        }
        
        // Save session to persist the changes
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session in update-subscription:', err);
          } else {
            console.log('User session updated with new subscription data after plan change');
          }
        });
      }

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
      
      // Get the user data to access preferences
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found for subscription cancellation`);
      }
      
      // Parse the current preferences or create new ones
      let userPreferences = {};
      if (user.preferences) {
        try {
          userPreferences = JSON.parse(user.preferences);
        } catch (e) {
          console.error(`Error parsing preferences for user ${userId}:`, e);
        }
      }
      
      // Update the preferences with free plan
      userPreferences = {
        ...userPreferences,
        subscriptionPlan: "free"
      };
      
      // Update user's subscription in the database
      await storage.updateUser(userId, {
        subscriptionStatus: "free",
        subscriptionEndDate: null,
        preferences: JSON.stringify(userPreferences)
      });
      
      // Update session data if this is the logged-in user
      if (req.user && (req.user as any).id === userId) {
        (req.user as any).subscriptionStatus = "free";
        (req.user as any).subscriptionEndDate = null;
        
        // Also update the preferences in the session
        if ((req.user as any).preferences) {
          try {
            let sessionPreferences = JSON.parse((req.user as any).preferences);
            sessionPreferences.subscriptionPlan = "free";
            (req.user as any).preferences = JSON.stringify(sessionPreferences);
          } catch (e) {
            console.error('Error updating preferences in session:', e);
          }
        } else {
          (req.user as any).preferences = JSON.stringify({ subscriptionPlan: "free" });
        }
        
        // Save session to persist the changes
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session in cancel-subscription:', err);
          } else {
            console.log('User session updated to free after cancellation');
          }
        });
      }

      res.status(200).json({ subscription });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Setup webhook for handling Stripe events
  app.post('/api/webhook/stripe', express.json({ type: 'application/json' }), async (req, res) => {
    const event = req.body;
    
    try {
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Process the successful checkout
          console.log(`Webhook: checkout.session.completed for session ${session.id}`);
          
          // Get the user ID from metadata
          const userId = session.metadata?.userId;
          if (!userId) {
            console.log('No user ID found in session metadata');
            break;
          }
          
          // If the payment was successful and this is a subscription
          if (session.payment_status === 'paid' && session.mode === 'subscription') {
            const subscriptionId = session.subscription as string;
            
            if (subscriptionId) {
              // Get subscription details
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              
              // Get the subscription end date
              const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
              
              // Determine subscription type from metadata or default to monthly
              const subscriptionType = session.metadata?.billingPeriod || 'monthly';
              
              // Get the current user data to access preferences
              const user = await storage.getUser(parseInt(userId));
              if (!user) {
                console.log(`User ${userId} not found for subscription update`);
                break;
              }
              
              // Parse the current preferences or create new ones
              let userPreferences = {};
              if (user.preferences) {
                try {
                  userPreferences = JSON.parse(user.preferences);
                } catch (e) {
                  console.error(`Error parsing preferences for user ${userId}:`, e);
                }
              }
              
              // Update the preferences with subscription plan
              userPreferences = {
                ...userPreferences,
                subscriptionPlan: subscriptionType
              };
              
              // Update the user with subscription details
              await storage.updateUser(parseInt(userId), {
                subscriptionStatus: subscriptionType,
                subscriptionEndDate: subscriptionEndDate,
                preferences: JSON.stringify(userPreferences)
              });
              
              // If this is a request from a logged-in user and it's the same user
              // We need to update their session as well
              if (req.user && (req.user as any).id === parseInt(userId)) {
                (req.user as any).subscriptionStatus = subscriptionType;
                (req.user as any).subscriptionEndDate = subscriptionEndDate;
                
                // Also update the preferences in the session
                if ((req.user as any).preferences) {
                  try {
                    let sessionPreferences = JSON.parse((req.user as any).preferences);
                    sessionPreferences.subscriptionPlan = subscriptionType;
                    (req.user as any).preferences = JSON.stringify(sessionPreferences);
                  } catch (e) {
                    console.error('Error updating preferences in session:', e);
                  }
                } else {
                  (req.user as any).preferences = JSON.stringify({ subscriptionPlan: subscriptionType });
                }
                
                // Save session to persist changes
                req.session.save((err) => {
                  if (err) {
                    console.error('Error saving session in webhook:', err);
                  } else {
                    console.log('User session updated with new subscription data from webhook');
                  }
                });
              }
              
              console.log(`Webhook: Updated user ${userId} with subscription ${subscriptionType}`);
            }
          }
          break;
        }
        
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          console.log('Webhook: Payment succeeded:', paymentIntent.id);
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          console.log('Webhook: Invoice paid:', invoice.id);
          
          // Get subscription ID from the invoice
          const subscriptionId = invoice.subscription;
          if (subscriptionId) {
            // Get the subscription to find customer
            const subscription = await stripe.subscriptions.retrieve(String(subscriptionId));
            
            // Find user with this subscription (assuming you store customer ID with user)
            // This is a simplified approach - in a real app, you'd look up the user by customer ID
            // For now, we'll use metadata from the subscription
            // You might need to adapt this based on your data model
            
            // Get subscription end date
            const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
            
            // Get user ID from subscription metadata if available
            // Otherwise, you'd need to query your database to find the user by customer ID
            const userId = subscription.metadata?.userId;
            
            if (userId) {
              // Determine the subscription type based on plan interval
              const subscriptionType = subscription.items.data[0].plan.interval === 'month' 
                ? 'monthly' 
                : 'yearly';
              
              // Get the current user data to access preferences
              const user = await storage.getUser(parseInt(userId));
              if (!user) {
                console.log(`User ${userId} not found for subscription update`);
                break;
              }
              
              // Parse the current preferences or create new ones
              let userPreferences = {};
              if (user.preferences) {
                try {
                  userPreferences = JSON.parse(user.preferences);
                } catch (e) {
                  console.error(`Error parsing preferences for user ${userId}:`, e);
                }
              }
              
              // Update the preferences with subscription plan (might be redundant but ensures consistency)
              userPreferences = {
                ...userPreferences,
                subscriptionPlan: subscriptionType
              };
              
              // Update the user's subscription end date and ensure consistent subscription type
              await storage.updateUser(parseInt(userId), {
                subscriptionStatus: subscriptionType,
                subscriptionEndDate: subscriptionEndDate,
                preferences: JSON.stringify(userPreferences)
              });
              
              // Update session data if this is the logged-in user
              if (req.user && (req.user as any).id === parseInt(userId)) {
                (req.user as any).subscriptionStatus = subscriptionType;
                (req.user as any).subscriptionEndDate = subscriptionEndDate;
                
                // Also update the preferences in the session
                if ((req.user as any).preferences) {
                  try {
                    let sessionPreferences = JSON.parse((req.user as any).preferences);
                    sessionPreferences.subscriptionPlan = subscriptionType;
                    (req.user as any).preferences = JSON.stringify(sessionPreferences);
                  } catch (e) {
                    console.error('Error updating preferences in session:', e);
                  }
                } else {
                  (req.user as any).preferences = JSON.stringify({ subscriptionPlan: subscriptionType });
                }
                
                // Save session to persist the changes
                req.session.save((err) => {
                  if (err) {
                    console.error('Error saving session in invoice payment webhook:', err);
                  } else {
                    console.log('User session updated with subscription data from invoice payment');
                  }
                });
              }
              
              console.log(`Webhook: Updated user ${userId} subscription end date to ${subscriptionEndDate.toISOString()}`);
            } else {
              console.log('Webhook: No user ID found for customer', subscription.customer);
            }
          }
          break;
        }
        
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          console.log('Webhook: Subscription updated:', subscription.id);
          
          // Check if this subscription is scheduled to cancel at period end
          const cancelAtPeriodEnd = subscription.cancel_at_period_end;
          
          // Get user ID from metadata if available, otherwise you'd need to look up by customer ID
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            if (cancelAtPeriodEnd) {
              console.log(`Webhook: Subscription ${subscription.id} will cancel at period end`);
              // You may want to update your database to reflect that the subscription is scheduled to cancel
              // But don't remove premium access yet - that happens when customer.subscription.deleted fires
            } else {
              // The subscription was updated but not canceled
              console.log(`Webhook: Subscription ${subscription.id} was updated`);
              
              // Update subscription end date and type
              const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
              const subscriptionType = subscription.items.data[0].plan.interval === 'month' 
                ? 'monthly' 
                : 'yearly';
              
              // Get the current user data to access preferences
              const user = await storage.getUser(parseInt(userId));
              if (!user) {
                console.log(`User ${userId} not found for subscription update`);
                break;
              }
              
              // Parse the current preferences or create new ones
              let userPreferences = {};
              if (user.preferences) {
                try {
                  userPreferences = JSON.parse(user.preferences);
                } catch (e) {
                  console.error(`Error parsing preferences for user ${userId}:`, e);
                }
              }
              
              // Update the preferences with subscription plan
              userPreferences = {
                ...userPreferences,
                subscriptionPlan: subscriptionType
              };
              
              // Update user in database
              await storage.updateUser(parseInt(userId), {
                subscriptionStatus: subscriptionType,
                subscriptionEndDate: subscriptionEndDate,
                preferences: JSON.stringify(userPreferences)
              });
              
              // Update session data if this is the logged-in user
              if (req.user && (req.user as any).id === parseInt(userId)) {
                (req.user as any).subscriptionStatus = subscriptionType;
                (req.user as any).subscriptionEndDate = subscriptionEndDate;
                
                // Also update the preferences in the session
                if ((req.user as any).preferences) {
                  try {
                    let sessionPreferences = JSON.parse((req.user as any).preferences);
                    sessionPreferences.subscriptionPlan = subscriptionType;
                    (req.user as any).preferences = JSON.stringify(sessionPreferences);
                  } catch (e) {
                    console.error('Error updating preferences in session:', e);
                  }
                } else {
                  (req.user as any).preferences = JSON.stringify({ subscriptionPlan: subscriptionType });
                }
                
                // Save session to persist the changes
                req.session.save((err) => {
                  if (err) {
                    console.error('Error saving session in subscription update webhook:', err);
                  } else {
                    console.log('User session updated with new subscription data from subscription update');
                  }
                });
              }
            }
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          console.log('Webhook: Subscription canceled:', subscription.id);
          
          // Get user ID from metadata if available
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            // Get the user to access preferences
            const user = await storage.getUser(parseInt(userId));
            if (!user) {
              console.log(`User ${userId} not found for subscription cancellation`);
              break;
            }
            
            // Parse the current preferences or create new ones
            let userPreferences = {};
            if (user.preferences) {
              try {
                userPreferences = JSON.parse(user.preferences);
              } catch (e) {
                console.error(`Error parsing preferences for user ${userId}:`, e);
              }
            }
            
            // Update the preferences with free plan
            userPreferences = {
              ...userPreferences,
              subscriptionPlan: "free"
            };
            
            // Downgrade the user to free when subscription is fully canceled
            await storage.updateUser(parseInt(userId), {
              subscriptionStatus: "free",
              subscriptionEndDate: null,
              preferences: JSON.stringify(userPreferences)
            });
            
            // Update session data if this is the logged-in user
            if (req.user && (req.user as any).id === parseInt(userId)) {
              (req.user as any).subscriptionStatus = "free";
              (req.user as any).subscriptionEndDate = null;
              
              // Also update the preferences in the session
              if ((req.user as any).preferences) {
                try {
                  let sessionPreferences = JSON.parse((req.user as any).preferences);
                  sessionPreferences.subscriptionPlan = "free";
                  (req.user as any).preferences = JSON.stringify(sessionPreferences);
                } catch (e) {
                  console.error('Error updating preferences in session:', e);
                }
              } else {
                (req.user as any).preferences = JSON.stringify({ subscriptionPlan: "free" });
              }
              
              // Save session to persist the changes
              req.session.save((err) => {
                if (err) {
                  console.error('Error saving session in subscription deletion webhook:', err);
                } else {
                  console.log('User session updated to free plan after subscription cancellation');
                }
              });
            }
            
            console.log(`Webhook: Downgraded user ${userId} to free plan`);
          } else {
            // If userId is not in metadata, you'd need to query your database
            console.log('Webhook: No user ID found for cancelled subscription', subscription.id);
          }
          break;
        }
        
        default:
          console.log(`Webhook: Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      // Don't return error status to Stripe as it will retry the webhook
    }

    // Return 200 status to acknowledge receipt of the event
    res.json({ received: true });
  });
}