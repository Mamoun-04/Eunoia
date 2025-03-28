import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
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
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionCancel from "@/pages/subscription-cancel";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, isLoading } = useAuth();

  // A function to determine if we should show auth page or redirect to home
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
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription/cancel" component={SubscriptionCancel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router />
          <Toaster />
          <AiJournalAssistant />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;