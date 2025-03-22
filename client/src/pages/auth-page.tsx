import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { setShowOnboarding } = useOnboarding();
  const [, setLocation] = useLocation();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (data: any) => {
    try {
      await loginMutation.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (data: any) => {
    try {
      await registerMutation.mutateAsync(data);
      setShowOnboarding(true);
      setLocation("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Eunoia</h1>
          <p className="text-muted-foreground">Begin your mindful reflection journey</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {/* Login Form */}
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
              <Input
                placeholder="Username"
                {...loginForm.register("username")}
              />
              <Input
                type="password"
                placeholder="Password"
                {...loginForm.register("password")}
              />
              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  className="w-[48%]"
                  disabled={loginMutation.isLoading}
                >
                  {loginMutation.isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-[48%]"
                  onClick={() => registerForm.handleSubmit(handleRegister)()}
                  disabled={registerMutation.isLoading}
                >
                  {registerMutation.isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Start Fresh
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}