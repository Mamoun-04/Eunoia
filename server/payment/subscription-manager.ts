import * as stripeHandler from './stripe';
import * as appleHandler from './apple';
import { storage } from '../storage';
import { subscriptionPlans } from '@shared/schema';

type SubscriptionPlatform = 'stripe' | 'apple' | 'android';

// Determine subscription platform based on user agent and explicit platform choice
export function getSubscriptionPlatform(userAgent: string, explicitPlatform?: string): SubscriptionPlatform {
  // If platform is explicitly specified in the request, use that
  if (explicitPlatform) {
    if (explicitPlatform === 'ios') return 'apple';
    if (explicitPlatform === 'android') return 'android';
    if (explicitPlatform === 'web') return 'stripe';
  }
  
  // Otherwise, determine from user agent
  // Check if user is on iOS device (iPhone, iPad, or iPod)
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || 
    (/Macintosh/.test(userAgent) && /safari/i.test(userAgent) && isTouchDevice(userAgent));
  
  // Check if user is on Android
  const isAndroid = /android/i.test(userAgent);
  
  // Determine platform based on device
  if (isIOS) return 'apple';
  if (isAndroid) return 'android'; // Currently handled same as Stripe
  
  // Default to Stripe for web
  return 'stripe';
}

// Helper function to detect touch devices that might be iOS
function isTouchDevice(userAgent: string): boolean {
  // This is a simple check that would need to be done client-side
  // For server-side, we're making a best guess based on userAgent
  return /CriOS|FxiOS|EdgiOS/.test(userAgent) || 
         /iPad|iPhone|iPod/.test(userAgent);
}

// Create a subscription for a user
export async function createSubscription(
  userId: number,
  plan: 'monthly' | 'yearly',
  platform: SubscriptionPlatform,
  receiptData?: string,
  email?: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    // Get user for username (needed for both platforms)
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Different flow for each platform
    if (platform === 'apple') {
      return await createAppleSubscription(userId, user.username, plan, receiptData || '');
    } else {
      return await createStripeSubscription(userId, user.username, plan, email || '');
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, message: 'Failed to create subscription' };
  }
}

// Process Apple In-App Purchase
async function createAppleSubscription(
  userId: number,
  username: string,
  plan: 'monthly' | 'yearly',
  receiptData: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    // Get user details for preferences
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Validate receipt with Apple
    const verificationResult = await appleHandler.verifyReceipt(receiptData);
    
    if (verificationResult.status === 'error') {
      return {
        success: false,
        message: 'Failed to verify Apple receipt',
        data: verificationResult.data
      };
    }
    
    // Extract subscription data
    const subscriptionData = verificationResult.data;
    
    // Check if subscription is active
    if (!subscriptionData.isActive) {
      return {
        success: false,
        message: 'Subscription has expired',
        data: subscriptionData
      };
    }
    
    // Calculate end date based on plan
    const endDate = subscriptionData.expiresDate;
    
    // Update user with subscription info
    await storage.updateUser(userId, {
      subscriptionStatus: 'active',
      subscriptionEndDate: endDate,
      subscriptionPlatform: 'apple',
      appleOriginalTransactionId: subscriptionData.originalTransactionId,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      preferences: JSON.stringify({
        ...JSON.parse(user.preferences || '{}'),
        subscriptionPlan: plan
      })
    });
    
    return {
      success: true,
      message: 'Subscription activated successfully',
      data: {
        plan,
        endDate,
        originalTransactionId: subscriptionData.originalTransactionId
      }
    };
  } catch (error) {
    console.error('Error creating Apple subscription:', error);
    return { success: false, message: 'Failed to process Apple subscription' };
  }
}

// Process Stripe subscription
async function createStripeSubscription(
  userId: number,
  username: string,
  plan: 'monthly' | 'yearly',
  email: string
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    // Get user to check for existing customer ID
    const user = await storage.getUser(userId);
    
    // Get existing customer ID or create new customer
    let customerId = user?.stripeCustomerId;
    
    if (!customerId) {
      customerId = await stripeHandler.createStripeCustomer(email, username);
      
      // Update user with customer ID
      await storage.updateUser(userId, {
        stripeCustomerId: customerId
      });
    }
    
    // Create checkout session
    // Use the actual host from the server
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
    const successUrl = `${baseUrl}/subscription/success?plan=${plan}`;
    const cancelUrl = `${baseUrl}/subscription/cancel`;
    
    const checkoutUrl = await stripeHandler.createCheckoutSession(
      customerId,
      plan,
      successUrl,
      cancelUrl
    );
    
    return {
      success: true,
      message: 'Checkout session created',
      data: {
        checkoutUrl,
        customerId
      }
    };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    return { success: false, message: 'Failed to process Stripe subscription' };
  }
}

// Handle Stripe webhook events
export async function handleStripeWebhookEvent(requestBody: any, signature: string): Promise<boolean> {
  try {
    const webhookResult = await stripeHandler.handleStripeWebhook(requestBody, signature);
    
    if (webhookResult.status === 'error') {
      console.error('Stripe webhook error:', webhookResult.data);
      return false;
    }
    
    if (webhookResult.status === 'skipped') {
      console.log('Skipped Stripe webhook:', webhookResult.data);
      return true;
    }
    
    // Process the webhook data
    const eventData = webhookResult.data;
    
    // Find user by customerId
    const users = await storage.getAllUsers();
    const user = users.find(user => user.stripeCustomerId === eventData.customerId);
    
    if (!user) {
      console.error('User not found for Stripe customer:', eventData.customerId);
      return false;
    }
    
    // Update user based on event type
    switch (webhookResult.data.status) {
      case 'active':
      case 'trialing':
        // Subscription created or updated
        // Calculate end date based on plan - this is a fallback if the data doesn't contain it
        const endDate = new Date();
        const userPreferences = user.preferences ? JSON.parse(user.preferences) : {};
        endDate.setMonth(endDate.getMonth() + (userPreferences.subscriptionPlan === 'yearly' ? 12 : 1));
        
        await storage.updateUser(user.id, {
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
          subscriptionPlatform: 'stripe',
          stripeSubscriptionId: eventData.subscriptionId,
        });
        break;
        
      case 'canceled':
      case 'unpaid':
        // Subscription canceled or unpaid
        await storage.updateUser(user.id, {
          subscriptionStatus: 'canceled',
        });
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return false;
  }
}

// Handle Apple server notifications
export async function handleAppleServerNotification(signedPayload: string): Promise<boolean> {
  try {
    const notificationResult = await appleHandler.handleServerNotification(signedPayload);
    
    if (notificationResult.status === 'error') {
      console.error('Apple notification error:', notificationResult.data);
      return false;
    }
    
    if (notificationResult.status === 'skipped') {
      console.log('Skipped Apple notification:', notificationResult.data);
      return true;
    }
    
    // Process the notification data
    const eventData = notificationResult.data;
    
    // Find user by originalTransactionId
    const users = await storage.getAllUsers();
    const user = users.find(user => user.appleOriginalTransactionId === eventData.originalTransactionId);
    
    if (!user) {
      console.error('User not found for Apple transaction:', eventData.originalTransactionId);
      return false;
    }
    
    // Update user based on notification type
    switch (eventData.type) {
      case 'subscribed':
      case 'renewed':
        // Subscription created or renewed
        // Verify the subscription with Apple to get the new expiration date
        if (user.appleOriginalTransactionId) {
          await verifyAndUpdateAppleSubscription(user.id, user.appleOriginalTransactionId);
        }
        break;
        
      case 'failed_renew':
        // Subscription failed to renew - mark as at risk
        await storage.updateUser(user.id, {
          subscriptionStatus: 'at_risk',
        });
        break;
        
      case 'expired':
        // Subscription expired - mark as expired
        await storage.updateUser(user.id, {
          subscriptionStatus: 'expired',
        });
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Error handling Apple notification:', error);
    return false;
  }
}

// Verify Apple subscription and update user
async function verifyAndUpdateAppleSubscription(userId: number, originalTransactionId: string): Promise<boolean> {
  try {
    // Get the receipt from Apple again
    // In a real implementation, you would store the receipt data when the user subscribes
    // For simplicity, this is a placeholder
    console.log('This function would need receipt data to verify with Apple');
    return false;
    
    // const receiptData = '...'; // Would need to be stored or passed
    // const verificationResult = await appleHandler.verifyReceipt(receiptData);
    // 
    // if (verificationResult.status === 'success') {
    //   const subscriptionData = verificationResult.data;
    //   
    //   // Update the user
    //   await storage.updateUser(userId, {
    //     subscriptionStatus: subscriptionData.isActive ? 'active' : 'expired',
    //     subscriptionEndDate: subscriptionData.expiresDate,
    //   });
    //   
    //   return true;
    // }
    // 
    // return false;
  } catch (error) {
    console.error('Error verifying Apple subscription:', error);
    return false;
  }
}

// Cancel a user's subscription
export async function cancelUserSubscription(userId: number): Promise<boolean> {
  try {
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }
    
    // Cancel based on platform
    if (user.subscriptionPlatform === 'stripe' && user.stripeSubscriptionId) {
      // Cancel Stripe subscription
      const cancelled = await stripeHandler.cancelSubscription(user.stripeSubscriptionId);
      
      if (cancelled) {
        // Mark subscription as canceled but keep end date
        await storage.updateUser(userId, {
          subscriptionStatus: 'canceled',
        });
        return true;
      }
    } else if (user.subscriptionPlatform === 'apple') {
      // Apple subscriptions can only be canceled by the user through App Store settings
      // We can only mark it as canceled in our database
      await storage.updateUser(userId, {
        subscriptionStatus: 'canceled',
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

// Regularly scheduled job to check and update subscription statuses
export async function checkAndUpdateAllSubscriptions(): Promise<void> {
  try {
    // Get all users
    const users = await storage.getAllUsers();
    
    // Check each user with an active subscription
    for (const user of users) {
      if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'at_risk') {
        // Check if subscription has expired
        if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
          // Mark as expired
          await storage.updateUser(user.id, {
            subscriptionStatus: 'expired',
          });
          continue;
        }
        
        // Verify subscription with platform
        if (user.subscriptionPlatform === 'stripe' && user.stripeSubscriptionId) {
          await verifyStripeSubscription(user.id, user.stripeSubscriptionId);
        } else if (user.subscriptionPlatform === 'apple' && user.appleOriginalTransactionId) {
          await verifyAndUpdateAppleSubscription(user.id, user.appleOriginalTransactionId);
        }
      }
    }
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  }
}

// Verify Stripe subscription and update user
async function verifyStripeSubscription(userId: number, subscriptionId: string): Promise<void> {
  try {
    const result = await stripeHandler.verifySubscription(subscriptionId);
    
    // Update user status
    await storage.updateUser(userId, {
      subscriptionStatus: result.active ? 'active' : 'expired',
      subscriptionEndDate: result.endDate,
    });
  } catch (error) {
    console.error('Error verifying Stripe subscription:', error);
  }
}