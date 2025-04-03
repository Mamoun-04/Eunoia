
import Stripe from 'stripe';
import { storage } from './storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession(userId: number, priceId: string, trialDays: number = 7) {
  const user = await storage.getUser(userId);
  if (!user) throw new Error('User not found');

  // Create a new checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    subscription_data: {
      trial_period_days: trialDays,
    },
    success_url: `http://localhost:5000/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5000/onboarding`,
    customer_email: user.email,
    client_reference_id: user.id.toString(),
  });

  return session;
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.client_reference_id) {
        const userId = parseInt(session.client_reference_id);
        await storage.updateUser(userId, {
          subscriptionStatus: 'active',
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation
      break;
    }
  }
}
