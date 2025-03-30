import express, { Request, Response } from 'express';

export function setupStripeRoutes(app: express.Express) {
  // Stub implementation - all features are available for free now
  
  // API route to indicate all features are available
  app.get('/api/stripe-config', (req, res) => {
    res.json({
      message: "All premium features are now available to all users."
    });
  });

  // Redirect checkout directly to success page
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    try {
      const { successUrl } = req.body;
      
      // Just redirect to success URL
      res.status(200).json({ 
        url: successUrl || "/success",
        message: "All premium features are now available to all users."
      });
    } catch (error: any) {
      console.error('Error in checkout redirect:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Simplified success handler
  app.get('/api/subscription/process-checkout', (req, res) => {
    res.status(200).json({ 
      success: true,
      message: "All premium features are now available to all users."
    });
  });

  // No-op implementation for payment intent
  app.post('/api/create-payment-intent', (req, res) => {
    res.status(200).json({
      success: true,
      message: "All premium features are now available to all users."
    });
  });

  // No-op implementation for subscription creation
  app.post('/api/create-subscription', (req, res) => {
    res.status(200).json({ 
      success: true,
      message: "All premium features are now available to all users."
    });
  });

  // No-op implementation for subscription updates
  app.post('/api/update-subscription', (req, res) => {
    res.status(200).json({ 
      success: true,
      message: "All premium features are now available to all users."
    });
  });

  // No-op implementation for subscription cancellation
  app.post('/api/cancel-subscription', (req, res) => {
    res.status(200).json({ 
      success: true,
      message: "All premium features are now available to all users."
    });
  });
}