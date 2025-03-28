import fetch from 'node-fetch';
import { subscriptionPlans } from '@shared/schema';

// Apple App Store endpoints
const PRODUCTION_VERIFICATION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX_VERIFICATION_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Apple App Store product IDs
const PRODUCT_IDS = {
  monthly: 'com.eunoia.journal.subscription.monthly',
  yearly: 'com.eunoia.journal.subscription.yearly',
};

// Verify receipt with Apple servers
export async function verifyReceipt(receiptData: string): Promise<{ status: string | number; data?: any }> {
  try {
    // First try production environment
    const productionResult = await sendVerificationRequest(receiptData, PRODUCTION_VERIFICATION_URL);
    
    // If status is 21007, it's a sandbox receipt, try sandbox environment
    if (productionResult.status === '21007' || productionResult.status === 21007) {
      return await sendVerificationRequest(receiptData, SANDBOX_VERIFICATION_URL);
    }
    
    return productionResult;
  } catch (error) {
    console.error('Error verifying Apple receipt:', error);
    return { status: 'error', data: 'Failed to verify receipt' };
  }
}

// Helper function to send verification request to Apple
async function sendVerificationRequest(receiptData: string, url: string): Promise<{ status: string | number; data?: any }> {
  try {
    // Get shared secret from environment
    const sharedSecret = process.env.APPLE_SHARED_SECRET;
    
    if (!sharedSecret) {
      console.error('Apple shared secret is not set');
      return { status: 'error', data: 'Shared secret not configured' };
    }
    
    // Send request to Apple
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'receipt-data': receiptData,
        'password': sharedSecret,
        'exclude-old-transactions': false,
      }),
    });
    
    // Parse response
    const result = await response.json() as any;
    
    // Check status
    if (result.status === 0) {
      // Success, extract subscription information
      return parseReceiptData(result);
    } else {
      return {
        status: 'error',
        data: {
          code: result.status,
          message: getStatusCodeMessage(result.status),
        }
      };
    }
  } catch (error) {
    console.error('Error sending verification request to Apple:', error);
    return { status: 'error', data: 'Failed to send verification request' };
  }
}

// Parse receipt data from Apple response
function parseReceiptData(receipt: any): { status: string; data?: any } {
  try {
    // Check for latest receipt info
    const latestReceiptInfo = receipt.latest_receipt_info;
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return { status: 'error', data: 'No subscription information found' };
    }
    
    // Sort by expiration date to get the latest transaction
    const sortedTransactions = [...latestReceiptInfo].sort((a, b) => {
      return parseInt(b.expires_date_ms) - parseInt(a.expires_date_ms);
    });
    
    const latestTransaction = sortedTransactions[0];
    
    // Check if subscription is still valid
    const expiresDate = new Date(parseInt(latestTransaction.expires_date_ms));
    const now = new Date();
    const isActive = expiresDate > now;
    
    // Determine plan type
    const productId = latestTransaction.product_id;
    let plan = 'monthly';
    if (productId === PRODUCT_IDS.yearly) {
      plan = 'yearly';
    }
    
    return {
      status: 'success',
      data: {
        originalTransactionId: latestTransaction.original_transaction_id,
        transactionId: latestTransaction.transaction_id,
        productId: latestTransaction.product_id,
        plan,
        purchaseDate: new Date(parseInt(latestTransaction.purchase_date_ms)),
        expiresDate,
        isActive,
        environment: receipt.environment || 'Production',
      }
    };
  } catch (error) {
    console.error('Error parsing Apple receipt data:', error);
    return { status: 'error', data: 'Failed to parse receipt data' };
  }
}

// Handle Apple server to server notification
export async function handleServerNotification(signedPayload: string): Promise<{ status: string; data?: any }> {
  try {
    // Decode and verify the JWS payload from Apple
    // This is a simplification; in production, you would verify the signature
    const decodedPayload = Buffer.from(signedPayload.split('.')[1], 'base64').toString();
    const notification = JSON.parse(decodedPayload);
    
    // Extract relevant information
    const notificationType = notification.notificationType;
    const subtype = notification.subtype;
    const appAppleId = notification.appAppleId;
    const bundleId = notification.bundleId;
    const environment = notification.environment;
    
    // Handle different notification types
    switch (notificationType) {
      case 'SUBSCRIBED':
        // New subscription
        return {
          status: 'success',
          data: {
            type: 'subscribed',
            originalTransactionId: notification.data?.originalTransactionId,
            environment,
          }
        };
        
      case 'DID_RENEW':
        // Subscription renewed
        return {
          status: 'success',
          data: {
            type: 'renewed',
            originalTransactionId: notification.data?.originalTransactionId,
            environment,
          }
        };
        
      case 'DID_FAIL_TO_RENEW':
        // Subscription failed to renew
        return {
          status: 'success',
          data: {
            type: 'failed_renew',
            originalTransactionId: notification.data?.originalTransactionId,
            environment,
          }
        };
        
      case 'EXPIRED':
        // Subscription expired
        return {
          status: 'success',
          data: {
            type: 'expired',
            originalTransactionId: notification.data?.originalTransactionId,
            environment,
          }
        };
        
      default:
        return {
          status: 'skipped',
          data: `Unhandled notification type: ${notificationType}`
        };
    }
  } catch (error) {
    console.error('Error handling Apple server notification:', error);
    return { status: 'error', data: 'Failed to handle server notification' };
  }
}

// Get a human-readable message for Apple status codes
function getStatusCodeMessage(status: number): string {
  const statusMessages: { [key: number]: string } = {
    21000: 'The App Store could not read the JSON object you provided.',
    21002: 'The receipt data was malformed or missing.',
    21003: 'The receipt could not be authenticated.',
    21004: 'The shared secret you provided does not match the shared secret on file for your account.',
    21005: 'The receipt server is currently not available.',
    21006: 'This receipt is valid but the subscription has expired.',
    21007: 'This receipt is from the test environment, but sent to the production environment.',
    21008: 'This receipt is from the production environment, but sent to the test environment.',
    21010: 'This receipt could not be authorized.',
    21100: 'Internal data access error.',
    21199: 'Unknown error.',
  };
  
  return statusMessages[status] || `Unknown status code: ${status}`;
}