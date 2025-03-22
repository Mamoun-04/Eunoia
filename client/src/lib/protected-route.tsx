
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
    // Only redirect if we're certain there's no user and loading is complete
    if (!isLoading && !user && window.location.pathname !== '/onboarding') {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

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
