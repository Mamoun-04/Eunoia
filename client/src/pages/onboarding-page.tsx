import { useEffect } from "react";
import { useLocation } from "wouter";
import { useOnboarding } from "@/hooks/use-onboarding";
import SplashScreen from "@/components/onboarding/splash-screen";
import WelcomeScreen from "@/components/onboarding/welcome-screen";
import ProfileSetup from "@/components/onboarding/profile-setup";
import GoalSetting from "@/components/onboarding/goal-setting";
import InterestSelection from "@/components/onboarding/interest-selection";
import SubscriptionStep from "@/components/onboarding/subscription-step";
import CreateAccount from "@/components/onboarding/create-account";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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

  // Render current step
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
        return <SubscriptionStep />;
      case 6:
        return <CreateAccount />;
      default:
        return <WelcomeScreen />;
    }
  };

  // Only show navigation when not on splash screen
  if (step === 0) {
    return renderStep();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f7f1]">
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
    </div>
  );
}