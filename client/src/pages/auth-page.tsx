import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-0">
      {/* Form Section */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Eunoia</h1>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onSubmit={(data) => loginMutation.mutate(data)} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm onSubmit={(data) => registerMutation.mutate(data)} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Want the full experience?
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => setLocation("/onboarding")}
            >
              Try our guided onboarding
            </Button>
          </div>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary/5 p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-4">Your Journey to Mindfulness</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your mindful journaling practice with Eunoia. Track your moods,
            reflect on your day, and discover insights about yourself.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-lg bg-background/80">
              <h3 className="font-bold mb-2">Daily Reflections</h3>
              <p className="text-sm text-muted-foreground">Guided prompts for meaningful journaling</p>
            </div>
            <div className="p-4 rounded-lg bg-background/80">
              <h3 className="font-bold mb-2">Mood Tracking</h3>
              <p className="text-sm text-muted-foreground">Visual insights into your emotional journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...form.register("username")}
          placeholder="Username"
          className="w-full"
        />
      </div>
      <div>
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Password"
          className="w-full"
        />
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

function RegisterForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...form.register("username")}
          placeholder="Choose a username"
          className="w-full"
        />
      </div>
      <div>
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Choose a password"
          className="w-full"
        />
      </div>
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
