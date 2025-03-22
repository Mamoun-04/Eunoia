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
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

// Lazy load the splash screen
const SplashScreen = lazy(() => import("@/components/onboarding/splash-screen"));

// Create a welcome screen component with options for new and returning users
const WelcomeScreen = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8f7f2] p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-10">
        <div>
          <h1 className="text-5xl font-serif font-bold text-[#0000CC] mb-2">EUNOIA</h1>
          <p className="text-sm text-[#0000CC] italic font-serif">Writing the story of you.</p>
        </div>
        
        <div className="space-y-4 mt-12">
          <Button 
            className="w-full py-6 text-lg bg-[#0000CC] hover:bg-[#0000AA]"
            onClick={() => setLocation("/auth")}
          >
            Login
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full py-6 text-lg border-[#0000CC] text-[#0000CC] hover:bg-[#0000CC]/10"
            onClick={() => setLocation("/onboarding")}
          >
            New User
          </Button>
        </div>
      </div>
    </div>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomeScreen} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/entries" component={EntriesPage} />
      <ProtectedRoute path="/library" component={LibraryPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
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
      <Suspense fallback={<div className="h-screen w-full bg-[#f8f7f2]" />}>
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