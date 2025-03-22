import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the components to improve performance
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

  // Redirect to home if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("user");
    if (isLoggedIn) {
      setLocation("/");
    }
  }, [setLocation]);

  // If step is 0, show splash screen and then auto-advance
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [step, setStep]);

  // Calculate progress percentage
  const totalSteps = 6; // Not counting splash screen
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

  // Render current step
  const renderStep = () => {
    return (
      <Suspense fallback={<StepSkeleton />}>
        {(() => {
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
              return <SubscriptionStep />;
            case 6:
              return <CreateAccount />;
            default:
              return <WelcomeScreen />;
          }
        })()}
      </Suspense>
    );
  };

  // Only show navigation when not on splash screen
  if (step === 0) {
    return renderStep();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with progress */}
      <header className="p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {step > 1 && (
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
      {/* No footer with login option - users must complete onboarding */}
    </div>
  );
}