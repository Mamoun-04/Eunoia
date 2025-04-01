import { ReactNode, createContext, useContext, useState } from "react";

export type OnboardingContextType = {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
};

export type OnboardingData = {
  step: number;
  // Goals & preferences
  selectedGoals: string[];
  customGoal?: string;
  journalingFrequency: string;
  onboardingComplete?: boolean;
};

const initialData: OnboardingData = {
  step: 0,
  selectedGoals: [],
  journalingFrequency: "daily",
  subscriptionPlan: "free",
};

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  
  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prevData) => ({ ...prevData, ...newData }));
  };
  
  const resetData = () => {
    setData(initialData);
  };
  
  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  
  return context;
}