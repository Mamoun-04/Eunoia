import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthFormData {
  username: string;
  password: string;
}

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { loginMutation, registerMutation } = useAuth();
  const form = useForm<AuthFormData>();

  const handleSubmit = async (data: AuthFormData) => {
    if (isRegistering) {
      registerMutation.mutate(data);
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Eunoia</h1>
          <p className="text-muted-foreground">Begin your mindful reflection journey</p>
        </div>

        <Card className="p-6">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                {...form.register("username", { required: true })}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...form.register("password", { required: true })}
              />
            </div>
            <div className="flex justify-between gap-4">
              <Button
                type="submit"
                className="w-full"
                onClick={() => setIsRegistering(false)}
                disabled={loginMutation.isLoading || registerMutation.isLoading}
              >
                {loginMutation.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
              </Button>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                onClick={() => setIsRegistering(true)}
                disabled={loginMutation.isLoading || registerMutation.isLoading}
              >
                {registerMutation.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start Fresh
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}