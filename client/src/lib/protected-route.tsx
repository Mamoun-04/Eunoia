
import { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/auth");
      } else if (!user.onboardingComplete && location !== "/onboarding") {
        setLocation("/onboarding");
      }
    }
  }, [user, isLoading, setLocation, location]);

  // This prevents the component from rendering at all if the user is not logged in
  // and the authentication check is complete
  if (!isLoading && !user) {
    return null;
  }

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : user ? (
        <Component />
      ) : null}
    </Route>
  );
}
