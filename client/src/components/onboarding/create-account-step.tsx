import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Check, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Extend the insertUserSchema with password confirmation
const createAccountSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  email: z.string().email("Please enter a valid email address"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export function CreateAccountStep({ 
  plan, 
  onComplete 
}: { 
  plan: 'free' | 'monthly' | 'yearly' | 'trial';
  onComplete: (data: any) => void 
}) {
  const { registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const form = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Check if email is already taken
  const checkEmailAvailability = async (email: string) => {
    if (!email || !z.string().email().safeParse(email).success) return;
    
    setIsCheckingEmail(true);
    try {
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setIsEmailAvailable(!data.exists);
    } catch (error) {
      setIsEmailAvailable(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Check if username is already taken
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      setIsUsernameAvailable(!data.exists);
    } catch (error) {
      setIsUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const onSubmit = async (data: CreateAccountFormData) => {
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...userData } = data;
      
      await registerMutation.mutateAsync(userData);
      
      // If registration successful, update subscription plan
      if (plan !== 'free') {
        try {
          await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan })
          });
        } catch (error) {
          toast({
            title: "Warning",
            description: "Your account was created but we couldn't activate your subscription. Please try again from settings.",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Account created",
        description: "Welcome to Eunoia! Your account has been created successfully.",
      });
      
      onComplete({ ...userData, plan });
      setLocation("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">Join Eunoia to start your mindful journaling journey</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Email"
              {...form.register("email", {
                onBlur: (e) => checkEmailAvailability(e.target.value)
              })}
              className={`pr-10 ${isEmailAvailable === false ? 'border-destructive' : ''}`}
            />
            {isCheckingEmail && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {isEmailAvailable === true && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
            {isEmailAvailable === false && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
            )}
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
          {isEmailAvailable === false && (
            <p className="text-sm text-destructive">This email is already taken</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder="Username"
              {...form.register("username", {
                onBlur: (e) => checkUsernameAvailability(e.target.value)
              })}
              className={`pr-10 ${isUsernameAvailable === false ? 'border-destructive' : ''}`}
            />
            {isCheckingUsername && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {isUsernameAvailable === true && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
            {isUsernameAvailable === false && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
            )}
          </div>
          {form.formState.errors.username && (
            <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
          )}
          {isUsernameAvailable === false && (
            <p className="text-sm text-destructive">This username is already taken</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Confirm Password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={
              registerMutation.isPending || 
              isEmailAvailable === false || 
              isUsernameAvailable === false ||
              isCheckingEmail ||
              isCheckingUsername
            }
          >
            {registerMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}