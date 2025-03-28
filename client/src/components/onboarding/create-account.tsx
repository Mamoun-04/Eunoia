
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const createAccountSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export default function CreateAccount() {
  const { data } = useOnboarding();
  const { registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  });

  const onSubmit = async (values: CreateAccountFormValues) => {
    // Clear any previous username error
    setUsernameError(null);
    
    try {
      // First, register the user
      const response = await registerMutation.mutateAsync({
        username: values.username,
        password: values.password,
        preferences: {
          name: data.name,
          bio: data.bio,
          goal: data.goal,
          customGoal: data.customGoal,
          interests: data.interests || [],
          subscriptionPlan: data.subscriptionPlan || 'free',
          theme: "light"
        }
      });

      toast({
        title: "Account created!",
        description: "Welcome to Eunoia"
      });

      // Check if user selected a premium plan and handle subscription
      if (data.subscriptionPlan === 'monthly' || data.subscriptionPlan === 'yearly') {
        try {
          // Make the subscription API call directly
          const subscriptionResponse = await fetch('/api/subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              plan: data.subscriptionPlan,
              platform: 'web'
            })
          });
          
          const subscriptionData = await subscriptionResponse.json();
          
          // If there's a checkout URL from Stripe, redirect to it
          if (subscriptionData.data?.checkoutUrl) {
            window.location.href = subscriptionData.data.checkoutUrl;
          } else {
            // If something went wrong or no checkout URL (shouldn't happen), redirect to settings
            toast({
              title: "Couldn't set up premium",
              description: "Please try again from the settings page",
              variant: "destructive"
            });
            setTimeout(() => {
              setLocation("/home");
            }, 1500);
          }
        } catch (subscriptionError) {
          console.error("Failed to start subscription process:", subscriptionError);
          // Still navigate to home if subscription fails, user can subscribe later
          toast({
            title: "Subscription setup failed",
            description: "You can upgrade to premium later from settings",
            variant: "destructive"
          });
          setTimeout(() => {
            setLocation("/home");
          }, 1500);
        }
      } else {
        // Regular free account, just go to home
        setLocation("/home");
      }
    } catch (error: any) {
      // Check if the error is specifically for username already exists
      if (error.message?.includes("Username already exists") || 
          (typeof error.response?.json === 'function' && 
           await error.response.json().then((data: any) => 
             data.message === "Username already exists"
           ).catch(() => false))) {
        
        // Set inline error for username field
        setUsernameError("Username already exists. Please choose another.");
        
        // Update form state to show error
        form.setError("username", { 
          type: "manual", 
          message: "Username already exists. Please choose another." 
        });
      } else {
        // Generic error toast for other errors
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create account. Please try again."
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] p-4"
    >
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username error message displayed if present */}
              {usernameError && (
                <div className="text-destructive text-sm font-medium mt-1 mb-2">
                  {usernameError}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username" 
                        {...field}
                        className={usernameError ? "border-destructive" : ""} 
                      />
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
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
                      </div>
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
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="accent-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      I agree to the terms and conditions
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
