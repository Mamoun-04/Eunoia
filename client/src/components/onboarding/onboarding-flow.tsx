
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { WelcomeStep } from "./welcome-step";
import { ProfileStep } from "./profile-step";
import { GoalStep } from "./goal-step";
import { InterestsStep } from "./interests-step";
import { SubscriptionStep } from "./subscription-step";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const STEPS = ["Welcome", "Profile", "Goal", "Interests", "Subscription"];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleStepComplete = (stepData: any) => {
    setData(prev => ({ ...prev, ...stepData }));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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
        return <SubscriptionStep data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Return to Login
          </Link>
        </div>
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
