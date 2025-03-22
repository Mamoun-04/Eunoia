
import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type OnboardingContextType = {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  showOnboarding: false,
  setShowOnboarding: () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const stored = localStorage.getItem("showOnboarding");
    return stored === null ? false : JSON.parse(stored);
  });

  useEffect(() => {
    localStorage.setItem("showOnboarding", JSON.stringify(showOnboarding));
  }, [showOnboarding]);

  return (
    <OnboardingContext.Provider value={{ showOnboarding, setShowOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
