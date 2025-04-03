import nodemailer from 'nodemailer';

// Normally, you would configure this with environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@eunoia.app';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Create a reusable transporter
let transporter: nodemailer.Transporter | null = null;

// Initialize the transporter if credentials are available
function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email service not configured: EMAIL_USER or EMAIL_PASS missing');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Send an email verification link
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email service not configured, skipping verification email');
    return false;
  }

  const verificationLink = `${APP_URL}/verify-email?token=${verificationToken}`;

  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Verify Your Eunoia Account',
      text: `Hello ${username},

Thank you for signing up for Eunoia, your mindful journaling companion.

Please verify your email address by clicking the link below:
${verificationLink}

This link will expire in 24 hours.

If you didn't sign up for Eunoia, you can safely ignore this email.

Best regards,
The Eunoia Team`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #6366f1;">Verify Your Eunoia Account</h2>
  <p>Hello ${username},</p>
  <p>Thank you for signing up for Eunoia, your mindful journaling companion.</p>
  <p>Please verify your email address by clicking the button below:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
  </p>
  <p>Or copy and paste this link in your browser:</p>
  <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 0.9em; word-break: break-all;">${verificationLink}</p>
  <p>This link will expire in 24 hours.</p>
  <p>If you didn't sign up for Eunoia, you can safely ignore this email.</p>
  <p>Best regards,<br>The Eunoia Team</p>
</div>`,
    });

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

/**
 * Send a password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email service not configured, skipping password reset email');
    return false;
  }

  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset Your Eunoia Password',
      text: `Hello ${username},

We received a request to reset your Eunoia account password.

Please click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Eunoia Team`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #6366f1;">Reset Your Eunoia Password</h2>
  <p>Hello ${username},</p>
  <p>We received a request to reset your Eunoia account password.</p>
  <p>Please click the button below to reset your password:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
  </p>
  <p>Or copy and paste this link in your browser:</p>
  <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 0.9em; word-break: break-all;">${resetLink}</p>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request a password reset, you can safely ignore this email.</p>
  <p>Best regards,<br>The Eunoia Team</p>
</div>`,
    });

    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send an account recovery email (when user forgets username)
 */
export async function sendAccountRecoveryEmail(
  email: string,
  username: string
): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email service not configured, skipping account recovery email');
    return false;
  }

  const loginLink = `${APP_URL}/login`;

  try {
    await transport.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: 'Your Eunoia Account Information',
      text: `Hello,

We received a request for your Eunoia account information.

Your username is: ${username}

You can log in to your account here:
${loginLink}

If you've forgotten your password, you can request a password reset on the login page.

If you didn't request this information, you can safely ignore this email.

Best regards,
The Eunoia Team`,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #6366f1;">Your Eunoia Account Information</h2>
  <p>Hello,</p>
  <p>We received a request for your Eunoia account information.</p>
  <p>Your username is: <strong>${username}</strong></p>
  <p>You can log in to your account by clicking the button below:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${loginLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Log In</a>
  </p>
  <p>If you've forgotten your password, you can request a password reset on the login page.</p>
  <p>If you didn't request this information, you can safely ignore this email.</p>
  <p>Best regards,<br>The Eunoia Team</p>
</div>`,
    });

    return true;
  } catch (error) {
    console.error('Failed to send account recovery email:', error);
    return false;
  }
}