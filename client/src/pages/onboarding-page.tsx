import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load the components to improve performance
const GoalSetting = lazy(() => import("@/components/onboarding/goal-setting"));
const InterestSelection = lazy(() => import("@/components/onboarding/interest-selection"));
const SubscriptionStep = lazy(() => import("@/components/onboarding/subscription-step"));
const CreateAccountWithProfile = lazy(() => import("@/components/onboarding/create-account-with-profile"));

export default function OnboardingPage() {
  const { step, setStep } = useOnboarding();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/home");
    }
  }, [user, setLocation]);

  // Calculate progress percentage
  const totalSteps = 4; // Goal, Interests, Subscription, Account+Profile
  const progressPercentage = (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <GoalSetting />;
      case 2:
        return <InterestSelection />;
      case 3:
        return <SubscriptionStep />;
      case 4:
        return <CreateAccountWithProfile />;
      default:
        return <GoalSetting />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
        </div>
        <Progress value={progressPercentage} className="mt-4" />
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  );
}