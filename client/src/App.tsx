import { Switch, Route } from "wouter";
import { useState, useEffect, lazy, Suspense } from "react";
import { AiJournalAssistant } from "@/components/ai-journal-assistant";
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
import { AuthProvider } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { ProtectedRoute } from "./lib/protected-route";

// Lazy load the splash screen
const SplashScreen = lazy(() => import("@/components/onboarding/splash-screen"));

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/entries" component={EntriesPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
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
      <Suspense fallback={<div className="h-screen w-full bg-white" />}>
        <SplashScreen />
      </Suspense>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <Router />
          <Toaster />
          <AiJournalAssistant />
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;