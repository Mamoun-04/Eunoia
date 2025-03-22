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
const SplashScreen = lazy(() => import("@/components/onboarding/splash-screen"));
const WelcomeScreen = lazy(() => import("@/components/onboarding/welcome-screen"));
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

  // If step is 0, auto-advance to step 1 (welcome screen)
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1); // Go to welcome screen
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [step, setStep]);

  // Calculate progress percentage
  const totalSteps = 5; // Steps 1-5: Welcome, Goal, Interests, Subscription, Account creation
  const progressPercentage = ((step - 1) / totalSteps) * 100;

  // Loading fallback component
  const StepSkeleton = () => (
    <div className="space-y-4 w-full">
      <Skeleton className="h-12 w-3/4 rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );

  // Render current step with animation
  const renderStep = () => {
    // Animation variants
    const pageVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Suspense fallback={<StepSkeleton />}>
            {(() => {
              switch (step) {
                case 0:
                  return <SplashScreen />;
                case 1:
                  return <WelcomeScreen />;
                case 2:
                  return <GoalSetting />;
                case 3:
                  return <InterestSelection />;
                case 4:
                  return <SubscriptionStep />;
                case 5:
                  return <CreateAccountWithProfile />;
                default:
                  return <WelcomeScreen />;
              }
            })()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Only show navigation when not on splash screen
  if (step === 0) {
    return renderStep();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white light">
      {/* Header with progress */}
      <header className="p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {step > 1 && step < 5 && ( // Don't show back button on welcome or final screen
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-right text-sm text-muted-foreground mt-1">
            Step {step} of {totalSteps}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl mx-auto">
          {renderStep()}
        </div>
      </main>
      {step < 5 && ( // Only show login link on steps before the final account creation step
        <footer className="p-4 text-center">
          <Button 
            variant="link" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setLocation("/auth")}
          >
            Already have an account? Login here
          </Button>
        </footer>
      )}
    </div>
  );
}