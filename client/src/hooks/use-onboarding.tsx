import { createContext, useState, useContext, ReactNode } from "react";

// Define types for our onboarding data
type OnboardingData = {
  name?: string;
  profilePhoto?: string;
  bio?: string;
  goal?: string;
  customGoal?: string;
  interests: string[];
  subscriptionPlan?: 'free' | 'monthly' | 'yearly';
};

type OnboardingContextType = {
  step: number;
  setStep: (step: number) => void;
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
};

// Create the context
const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Initial data state
const initialData: OnboardingData = {
  interests: [],
};

// Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(currentData => ({ ...currentData, ...newData }));
  };

  const resetOnboarding = () => {
    setStep(1);
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider
      value={{
        step,
        setStep,
        data,
        updateData,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook for using the onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  
  return context;
}