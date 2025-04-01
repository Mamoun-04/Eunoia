
import { Switch, Route } from "wouter";
import { useState, useEffect, lazy, Suspense } from "react";

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import LibraryPage from "./pages/library-page";
import EntriesPage from "@/pages/entries-page";
import SettingsPage from "@/pages/settings-page";
import OnboardingPage from "@/pages/onboarding-page";
import WelcomeScreen from "@/components/onboarding/new-welcome-screen";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";
import { Loader2 } from "lucide-react";

// Lazy load the welcome screen for splash
const SplashScreen = lazy(() => import("@/components/onboarding/new-welcome-screen"));

function Router() {
  const { user, isLoading } = useAuth();

  // A function to determine if we should show welcome screen or redirect to home
  const HomeRouteComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }
    
    // If user is logged in, show HomePage, otherwise show AuthPage
    return user ? <HomePage /> : <AuthPage />;
  };

  return (
    <Switch>
      <Route path="/" component={HomeRouteComponent} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/entries" component={EntriesPage} />
      <ProtectedRoute path="/library" component={LibraryPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <Route path="/welcome" component={WelcomeScreen} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <OnboardingProvider>
        <Suspense fallback={<div className="h-screen w-full bg-[#f8f7f2]" />}>
          <SplashScreen />
        </Suspense>
      </OnboardingProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <OnboardingProvider>
            <Router />
            <Toaster />
          </OnboardingProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
