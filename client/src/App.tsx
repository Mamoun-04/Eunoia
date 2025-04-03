
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
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/hooks/use-onboarding";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";
import { Loader2, BookOpenText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Splash screen component
function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#f8f7f2] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="inline-block mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
            <BookOpenText size={40} className="text-[#0000CC]" />
          </div>
        </motion.div>
        
        <h1 className="text-5xl font-serif font-bold mb-3 text-[#0000CC] tracking-tight">EUNOIA</h1>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-12 h-1 bg-[#0000CC]/30 rounded-full"></div>
          <Sparkles className="h-5 w-5 text-[#0000CC]" />
          <div className="w-12 h-1 bg-[#0000CC]/30 rounded-full"></div>
        </div>
        
        <p className="text-[#0000CC]/80 font-serif italic">
          Writing the story of you.
        </p>
      </motion.div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  // If not logged in, show auth page
  if (!user) {
    return <AuthPage />;
  }

  // If logged in but onboarding not complete, redirect to onboarding
  if (!user.onboardingComplete && location.pathname !== '/auth') {
    return <OnboardingPage />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/entries" component={EntriesPage} />
      <ProtectedRoute path="/library" component={LibraryPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
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
