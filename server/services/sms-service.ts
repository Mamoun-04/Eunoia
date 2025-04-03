import twilio from 'twilio';

// Twilio configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Create a Twilio client if credentials are available
let twilioClient: twilio.Twilio | null = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('SMS service not configured: Twilio credentials missing');
    return null;
  }

  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
}

/**
 * Send a verification code via SMS
 */
export async function sendVerificationSMS(
  phoneNumber: string,
  verificationToken: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client || !TWILIO_PHONE_NUMBER) {
    console.warn('SMS service not configured, skipping verification SMS');
    return false;
  }

  // For SMS, use a short token instead of the full token
  // We'll use the first 6 characters of the token
  const verificationCode = verificationToken.substring(0, 6).toUpperCase();
  const verificationLink = `${APP_URL}/verify-phone?token=${verificationToken}`;

  try {
    await client.messages.create({
      body: `Your Eunoia verification code is: ${verificationCode}. Or verify at: ${verificationLink}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Failed to send verification SMS:', error);
    return false;
  }
}

/**
 * Send a password reset code via SMS
 */
export async function sendPasswordResetSMS(
  phoneNumber: string,
  resetToken: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client || !TWILIO_PHONE_NUMBER) {
    console.warn('SMS service not configured, skipping password reset SMS');
    return false;
  }

  // For SMS, use a short token instead of the full token
  const resetCode = resetToken.substring(0, 6).toUpperCase();
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

  try {
    await client.messages.create({
      body: `Your Eunoia password reset code is: ${resetCode}. Or reset at: ${resetLink}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Failed to send password reset SMS:', error);
    return false;
  }
}

/**
 * Send an account recovery SMS (when user forgets username)
 */
export async function sendAccountRecoverySMS(
  phoneNumber: string,
  username: string
): Promise<boolean> {
  const client = getTwilioClient();
  if (!client || !TWILIO_PHONE_NUMBER) {
    console.warn('SMS service not configured, skipping account recovery SMS');
    return false;
  }

  try {
    await client.messages.create({
      body: `Your Eunoia username is: ${username}. Log in at: ${APP_URL}/login`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Failed to send account recovery SMS:', error);
    return false;
  }
}