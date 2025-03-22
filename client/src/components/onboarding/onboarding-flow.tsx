
import { useState } from "react";
import { WelcomeStep } from "./welcome-step";
import { ProfileStep } from "./profile-step";
import { GoalStep } from "./goal-step";
import { InterestsStep } from "./interests-step";
import { SubscriptionStep } from "./subscription-step";
import { CreateAccountStep } from "./create-account-step";
import { Progress } from "@/components/ui/progress";

const STEPS = ["Welcome", "Profile", "Goal", "Interests", "Subscription", "Create Account"];

type OnboardingData = {
  plan?: 'free' | 'monthly' | 'yearly' | 'trial';
  name?: string;
  bio?: string;
  image?: string | null;
  interests?: string[];
  goal?: string;
};

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleStepComplete = (stepData: any) => {
    setData(prev => ({ ...prev, ...stepData }));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // TODO: Handle onboarding completion
      console.log("Onboarding complete", data);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleStepComplete} />;
      case 1:
        return <ProfileStep onNext={handleStepComplete} />;
      case 2:
        return <GoalStep onNext={handleStepComplete} />;
      case 3:
        return <InterestsStep onNext={handleStepComplete} />;
      case 4:
        return <SubscriptionStep onComplete={handleStepComplete} />;
      case 5:
        return data.plan ? (
          <CreateAccountStep plan={data.plan} onComplete={handleStepComplete} />
        ) : (
          <SubscriptionStep onComplete={handleStepComplete} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          {STEPS.map((step, index) => (
            <span
              key={step}
              className={currentStep >= index ? "text-foreground" : ""}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        {renderStep()}
      </div>
    </div>
  );
}
