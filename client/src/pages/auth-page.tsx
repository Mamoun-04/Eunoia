import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserSchema, insertUserSchema } from "@/lib/schema";
// ^ adjust the path as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthPage() {
  // Force light theme for auth page
  useEffect(() => {
    document.documentElement.classList.add("light");
    return () => document.documentElement.classList.remove("light");
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
            <CardTitle className="text-3xl font-serif font-bold text-[#0000CC]">
              EUNOIA
            </CardTitle>
            <CardDescription className="font-serif italic text-[#0000CC]">
              Writing the story of you.
            </CardDescription>
          </CardHeader>

          <div className="p-6 pt-2">
            <div className="mb-4 text-center">
              {mode === "login" ? (
                <>
                  <h3 className="text-xl font-medium">Welcome back</h3>
                  <p className="text-sm text-gray-500">
                    Sign in to access your journal
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium">Create an account</h3>
                  <p className="text-sm text-gray-500">
                    Start your journaling journey today
                  </p>
                </>
              )}
            </div>

            {mode === "login" ? (
              <LoginForm
                onSubmit={(data) => {
                  loginMutation.mutate(data, {
                    onSuccess: () => setLocation("/home"),
                  });
                }}
              />
            ) : (
              <>
                <RegisterForm
                  onSubmit={(data) => {
                    registerMutation.mutate(data, {
                      onSuccess: () => setLocation("/onboarding"),
                    });
                  }}
                />
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

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-[#0000CC] hover:bg-[#0000CC]/10 flex items-center justify-center gap-2"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to welcome screen
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#0000CC]/5 p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-serif font-bold mb-4 text-[#0000CC]">
            Your Journey to Mindfulness
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start your mindful journaling practice with Eunoia. Track your
            moods, reflect on your day, and discover insights about yourself.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold mb-2 text-[#0000CC]">
                Daily Reflections
              </h3>
              <p className="text-sm text-gray-600">
                Guided prompts for meaningful journaling
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold mb-2 text-[#0000CC]">Mood Tracking</h3>
              <p className="text-sm text-gray-600">
                Visual insights into your emotional journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------
// Login Form (username + password)
// ---------------------------------
function LoginForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(loginUserSchema),
    // loginUserSchema only has { username, password }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...form.register("username")}
          placeholder="Username"
          className="w-full"
        />
        {form.formState.errors.username && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>
      <div>
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Password"
          className="w-full"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}

// ------------------------------------
// Register Form (username + email + password + preferences?)
// ------------------------------------
function RegisterForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    // insertUserSchema includes { username, email, password, preferences? }
    // and the password length refine
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...form.register("username")}
          placeholder="Choose a username"
          className="w-full"
        />
        {form.formState.errors.username && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>
      <div>
        <Input
          {...form.register("email")}
          type="email"
          placeholder="Your email"
          className="w-full"
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div>
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Choose a password"
          className="w-full"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      {/* Preferences could be optional fields here, or you can handle them later. */}

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
