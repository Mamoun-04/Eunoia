import { Switch, Route } from "wouter";
import { useState } from "react";
import { AiJournalAssistant } from "@/components/ai-journal-assistant";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AssistantPage from "./pages/assistant-page"; // Replaced LibraryPage
import EntriesPage from "@/pages/entries-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/entries" component={EntriesPage} />
      <Route path="/assistant" component={AssistantPage} /> {/* Replaced Library route */}
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <AiJournalAssistant />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;