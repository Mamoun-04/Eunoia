import { Request, Response } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { sendVerificationEmail, sendPasswordResetEmail, sendAccountRecoveryEmail } from './services/email-service';
import { sendVerificationSMS, sendPasswordResetSMS, sendAccountRecoverySMS } from './services/sms-service';

// Extend Express.Session type to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// Validation schemas
const loginSchema = z.object({
  identifier: z.string().min(1, 'Username, email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = insertUserSchema;

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Username, email or phone is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const findAccountSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
});

/**
 * User registration handler
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const userData = validationResult.data;

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        errors: { username: ['Username already exists'] } 
      });
    }

    // Check if email already exists (if provided)
    if (userData.email) {
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          errors: { email: ['Email already exists'] } 
        });
      }
    }

    // Check if phone already exists (if provided)
    if (userData.phone) {
      const existingPhone = await storage.getUserByPhone(userData.phone);
      if (existingPhone) {
        return res.status(400).json({ 
          success: false, 
          errors: { phone: ['Phone number already exists'] } 
        });
      }
    }

    // Hash the password
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(userData.password, salt, 64) as Buffer;
    const hashedPassword = `${buf.toString('hex')}.${salt}`;

    // Create the user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });

    // Send verification email or SMS if provided
    if (userData.email) {
      const verificationToken = await storage.createVerificationToken(user.id);
      await sendVerificationEmail(userData.email, user.username, verificationToken);
    }

    if (userData.phone) {
      const verificationToken = await storage.createVerificationToken(user.id);
      await sendVerificationSMS(userData.phone, verificationToken);
    }

    // Login the user (set session)
    if (req.session) {
      req.session.userId = user.id;
    }

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * User login handler
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const { identifier, password } = validationResult.data;

    // Try to find user by username, email, or phone
    let user;
    
    // Check if identifier is a username
    user = await storage.getUserByUsername(identifier);
    
    // If not found, check if identifier is an email
    if (!user) {
      user = await storage.getUserByEmail(identifier);
    }
    
    // If still not found, check if identifier is a phone number
    if (!user) {
      user = await storage.getUserByPhone(identifier);
    }
    
    // If user not found, return error
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        errors: { general: ['Invalid credentials'] } 
      });
    }

    // Verify password
    const [hashedPassword, salt] = user.password.split('.');
    const buf = await scryptAsync(password, salt, 64) as Buffer;
    const isPasswordValid = timingSafeEqual(
      Buffer.from(hashedPassword, 'hex'),
      buf
    );

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        errors: { general: ['Invalid credentials'] } 
      });
    }

    // Set session
    if (req.session) {
      req.session.userId = user.id;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * User logout handler
 */
export const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ 
          success: false, 
          errors: { general: ['Failed to log out'] } 
        });
      }
      
      res.clearCookie('connect.sid');
      return res.status(200).json({ success: true });
    });
  } else {
    res.clearCookie('connect.sid');
    return res.status(200).json({ success: true });
  }
};

/**
 * Get current user handler
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        errors: { general: ['Not authenticated'] } 
      });
    }

    const user = await storage.getUser(userId);
    
    if (!user) {
      if (req.session) {
        req.session.destroy(() => {});
      }
      return res.status(401).json({ 
        success: false, 
        errors: { general: ['User not found'] } 
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * Email/Phone verification handler
 */
export const verifyAccount = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = verifyEmailSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const { token } = validationResult.data;

    // Verify the token
    const isVerified = await storage.verifyUser(token);
    
    if (!isVerified) {
      return res.status(400).json({ 
        success: false, 
        errors: { token: ['Invalid or expired verification token'] } 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * Forgot password handler
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const { identifier } = validationResult.data;

    // Find user by identifier
    let userInfo = await storage.findUserByIdentifier(identifier);
    
    // Do not reveal if the user exists or not
    if (!userInfo) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this identifier exists, a password reset link will be sent'
      });
    }

    // Create a password reset token
    const resetToken = await storage.createPasswordResetToken(identifier);
    
    if (!resetToken) {
      return res.status(500).json({ 
        success: false, 
        errors: { general: ['Failed to create password reset token'] } 
      });
    }

    // Send password reset email or SMS
    if (userInfo.email) {
      await sendPasswordResetEmail(
        identifier, // Full email, not masked
        userInfo.username,
        resetToken
      );
    } else if (userInfo.phone) {
      await sendPasswordResetSMS(
        identifier, // Full phone, not masked
        resetToken
      );
    }

    return res.status(200).json({
      success: true,
      message: 'If an account with this identifier exists, a password reset link will be sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * Reset password handler
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const { token, password } = validationResult.data;

    // Validate the token and get the user ID
    const userId = await storage.validateResetToken(token);
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        errors: { token: ['Invalid or expired reset token'] } 
      });
    }

    // Reset the password
    const success = await storage.resetPassword(userId, password);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        errors: { general: ['Failed to reset password'] } 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * Find account handler
 */
export const findAccount = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = findAccountSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const { identifier } = validationResult.data;

    // Find user by identifier
    let userInfo = await storage.findUserByIdentifier(identifier);
    
    // Do not reveal if the user exists or not
    if (!userInfo) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this identifier exists, the account information will be sent'
      });
    }

    // Send account recovery info
    if (userInfo.email) {
      await sendAccountRecoveryEmail(
        identifier, // Full email, not masked
        userInfo.username
      );
    } else if (userInfo.phone) {
      await sendAccountRecoverySMS(
        identifier, // Full phone, not masked
        userInfo.username
      );
    }

    return res.status(200).json({
      success: true,
      message: 'If an account with this identifier exists, the account information will be sent'
    });
  } catch (error) {
    console.error('Find account error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};

/**
 * Resend verification handler
 */
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        errors: { general: ['Not authenticated'] } 
      });
    }

    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        errors: { general: ['User not found'] } 
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        errors: { general: ['Account already verified'] } 
      });
    }

    // Create a new verification token
    const verificationToken = await storage.createVerificationToken(user.id);

    // Send verification email or SMS
    if (user.email) {
      await sendVerificationEmail(user.email, user.username, verificationToken);
    }

    if (user.phone) {
      await sendVerificationSMS(user.phone, verificationToken);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification instructions sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ 
      success: false, 
      errors: { general: ['An unexpected error occurred'] } 
    });
  }
};