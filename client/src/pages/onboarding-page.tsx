import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load the components
const SplashScreen = lazy(() => import("@/components/onboarding/splash-screen"));
const WelcomeScreen = lazy(() => import("@/components/onboarding/welcome-screen"));
const ProfileSetup = lazy(() => import("@/components/onboarding/profile-setup"));
const GoalSetting = lazy(() => import("@/components/onboarding/goal-setting"));
const InterestSelection = lazy(() => import("@/components/onboarding/interest-selection"));
const SubscriptionStep = lazy(() => import("@/components/onboarding/subscription-step"));
const CreateAccount = lazy(() => import("@/components/onboarding/create-account"));

export default function OnboardingPage() {
  const { step, setStep } = useOnboarding();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (step === 5) {
        setStep(6);
      } else if (step > 6) {
        setLocation("/home");
      }
    } else if (step > 1 && !user) {
      setStep(1);
    }
  }, [user, step, setStep, setLocation]);

  // Calculate progress percentage
  const totalSteps = 5;
  const currentStep = Math.max(0, Math.min(step - 1, totalSteps));
  const progress = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 0:
        return <SplashScreen />;
      case 1:
        return <WelcomeScreen />;
      case 2:
        return <ProfileSetup />;
      case 3:
        return <GoalSetting />;
      case 4:
        return <InterestSelection />;
      case 5:
        return <CreateAccount />;
      case 6:
        return <SubscriptionStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {step > 1 && step < 7 && (
        <header className="p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep(step - 1)}
            className="w-9 h-9"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Progress value={progress} className="w-[200px]" />
          <div className="w-9 h-9" /> {/* Spacer */}
        </header>
      )}

      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}