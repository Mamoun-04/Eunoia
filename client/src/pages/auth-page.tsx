import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthPage() {
  // Force light theme for auth page
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => document.documentElement.classList.remove('light');
  }, []);
  const [mode, setMode] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/home");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0 bg-[#f8f7f2]">
      {/* Form Section */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-serif font-bold text-[#0000CC]">EUNOIA</CardTitle>
            <CardDescription className="font-serif italic text-[#0000CC]">
              Writing the story of you.
            </CardDescription>
          </CardHeader>

          <div className="p-6 pt-2">
            <div className="mb-4 text-center">
              {mode === "login" ? (
                <>
                  <h3 className="text-xl font-medium">Welcome back</h3>
                  <p className="text-sm text-gray-500">Sign in to access your journal</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium">Create an account</h3>
                  <p className="text-sm text-gray-500">Start your journaling journey today</p>
                </>
              )}
            </div>

            {mode === "login" ? (
              <>
                <LoginForm onSubmit={(data) => {
                  loginMutation.mutate(data, {
                    onSuccess: () => setLocation("/home")
                  });
                }} />
                <div className="mt-3 text-center">
                  <Button 
                    variant="link" 
                    className="text-[#0000CC]"
                    onClick={() => setMode("register")}
                  >
                    Need an account? Register here
                  </Button>
                </div>
              </>
            ) : (
              <>
                <RegisterForm onSubmit={(data) => {
                  registerMutation.mutate(data, {
                    onSuccess: () => setLocation("/onboarding")
                  });
                }} />
                <div className="mt-3 text-center">
                  <Button 
                    variant="link" 
                    className="text-[#0000CC]"
                    onClick={() => setMode("login")}
                  >
                    Already have an account? Login here
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#0000CC]/5 p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-serif font-bold mb-4 text-[#0000CC]">Your Journey to Mindfulness</h2>
          <p className="text-lg text-gray-600 mb-8">
            Start your mindful journaling practice with Eunoia. Track your moods,
            reflect on your day, and discover insights about yourself.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold mb-2 text-[#0000CC]">Daily Reflections</h3>
              <p className="text-sm text-gray-600">Guided prompts for meaningful journaling</p>
            </div>
            <div className="p-4 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold mb-2 text-[#0000CC]">Mood Tracking</h3>
              <p className="text-sm text-gray-600">Visual insights into your emotional journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [loginError, setLoginError] = useState<string | null>(null);
  const { loginMutation } = useAuth();
  
  const form = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  const handleSubmit = async (data: any) => {
    setLoginError(null); // Clear previous errors
    try {
      await onSubmit(data);
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          {...form.register("username")}
          placeholder="Username"
          className={`w-full ${form.formState.errors.username ? "border-red-500" : ""}`}
        />
        {form.formState.errors.username && (
          <p className="text-red-500 text-sm">{form.formState.errors.username.message as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Password"
          className={`w-full ${form.formState.errors.password ? "border-red-500" : ""}`}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm">{form.formState.errors.password.message as string}</p>
        )}
      </div>
      
      {loginError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {loginError}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting || loginMutation.isPending}
      >
        {(form.formState.isSubmitting || loginMutation.isPending) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [usernameExists, setUsernameExists] = useState<boolean>(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const { registerMutation } = useAuth();
  
  // Extended schema with confirmPassword
  const extendedSchema = insertUserSchema.extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  const form = useForm({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: ""
    },
    mode: "onChange" // Enable real-time validation
  });
  
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const username = form.watch("username");
  
  // Check for password match in real-time
  const passwordsMatch = password === confirmPassword;
  const showPasswordMatchError = password && confirmPassword && !passwordsMatch;
  
  // Check if username exists when username field changes
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length >= 4) {
        setIsCheckingUsername(true);
        try {
          const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
          const data = await response.json();
          setUsernameExists(data.exists);
        } catch (error) {
          console.error("Error checking username:", error);
        } finally {
          setIsCheckingUsername(false);
        }
      } else {
        setUsernameExists(false);
      }
    };
    
    const timer = setTimeout(checkUsername, 500); // Debounce for 500ms
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (data: any) => {
    setRegisterError(null); // Clear previous errors
    
    // Don't submit if username exists
    if (usernameExists) {
      return;
    }
    
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...submitData } = data;
      await onSubmit(submitData);
    } catch (error) {
      if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          {...form.register("username")}
          placeholder="Choose a username (min 4 characters)"
          className={`w-full ${form.formState.errors.username || usernameExists ? "border-red-500" : ""}`}
        />
        {form.formState.errors.username && (
          <p className="text-red-500 text-sm">{form.formState.errors.username.message as string}</p>
        )}
        {isCheckingUsername && (
          <p className="text-gray-500 text-sm">Checking username availability...</p>
        )}
        {usernameExists && !isCheckingUsername && (
          <p className="text-red-500 text-sm">This username is already taken</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Choose a password (min 8 characters)"
          className={`w-full ${form.formState.errors.password ? "border-red-500" : ""}`}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm">{form.formState.errors.password.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Input
          {...form.register("confirmPassword")}
          type="password"
          placeholder="Confirm your password"
          className={`w-full ${showPasswordMatchError || form.formState.errors.confirmPassword ? "border-red-500" : ""}`}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message as string}</p>
        )}
        {showPasswordMatchError && (
          <p className="text-red-500 text-sm">Passwords don't match</p>
        )}
      </div>
      
      {registerError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {registerError}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={
          form.formState.isSubmitting || 
          registerMutation.isPending || 
          !passwordsMatch || 
          usernameExists
        }
      >
        {(form.formState.isSubmitting || registerMutation.isPending) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}