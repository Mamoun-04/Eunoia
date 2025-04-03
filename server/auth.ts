import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Import the auth controller methods
import { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  verifyAccount, 
  forgotPassword, 
  resetPassword, 
  findAccount,
  resendVerification
} from './auth-controller';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport for the traditional username/password flow
  passport.use(
    new LocalStrategy({ usernameField: 'identifier' }, async (identifier, password, done) => {
      try {
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
        
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Split password into hash and salt
        const [hashedPassword, salt] = user.password.split('.');
        
        // Hash the provided password
        const { scrypt, timingSafeEqual } = await import('crypto');
        const { promisify } = await import('util');
        const scryptAsync = promisify(scrypt);
        const buf = await scryptAsync(password, salt, 64) as Buffer;
        
        // Compare passwords securely
        const isPasswordValid = timingSafeEqual(
          Buffer.from(hashedPassword, 'hex'),
          buf
        );

        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes using our new controller
  app.post("/api/register", register);
  app.post("/api/login", login);
  app.post("/api/logout", logout);
  app.get("/api/user", getCurrentUser);
  
  // New routes for advanced authentication
  app.post("/api/verify", verifyAccount);
  app.post("/api/forgot-password", forgotPassword);
  app.post("/api/reset-password", resetPassword);
  app.post("/api/find-account", findAccount);
  app.post("/api/resend-verification", resendVerification);

  // Check if username, email, or phone exists (helpful for registration form)
  app.get("/api/check-username", async (req, res) => {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: "Username parameter is required" });
    }
    
    const existingUser = await storage.getUserByUsername(username);
    return res.json({ exists: !!existingUser });
  });
  
  app.get("/api/check-email", async (req, res) => {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    
    const existingUser = await storage.getUserByEmail(email);
    return res.json({ exists: !!existingUser });
  });
  
  app.get("/api/check-phone", async (req, res) => {
    const { phone } = req.query;
    
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: "Phone parameter is required" });
    }
    
    const existingUser = await storage.getUserByPhone(phone);
    return res.json({ exists: !!existingUser });
  });
}
