import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';

// Extended schema with validation
const createAccountSchema = insertUserSchema.extend({
  email: z.string().email({ message: "Please enter a valid email address" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export default function CreateAccount() {
  const { data, resetOnboarding } = useOnboarding();
  const { registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: CreateAccountFormValues) => {
    try {
      // Remove the confirmPassword and email field as it's not in the User schema
      const { confirmPassword, email, ...userData } = values;
      
      // Register the user
      await registerMutation.mutateAsync(userData);
      
      // Show success toast
      toast({
        title: "Account created!",
        description: `Welcome to Eunoia, ${values.username}!`,
      });
      
      // Reset onboarding data
      resetOnboarding();
      
      // Redirect to homepage
      setLocation('/');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating account",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto shadow-sm"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Lock className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold mb-2 text-center">Create Your Account</h2>
      <p className="text-center text-muted-foreground mb-8">
        You're almost there! Set up your login details to begin your journaling journey.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account & Start Journaling"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </div>
    </motion.div>
  );
}