import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import NewWelcomeScreen from '@/components/onboarding/new-welcome-screen';
import BenefitsGoalsScreen from '@/components/onboarding/benefits-goals-screen';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useAuth();
  const { data, updateData, resetData } = useOnboarding();
  const [, setLocation] = useLocation();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Force light theme for onboarding
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => document.documentElement.classList.remove('light');
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Initialize or retrieve step
  useEffect(() => {
    // If coming back to onboarding, ensure we start at step 0
    if (data.step > 2) {
      updateData({ step: 0 });
    }
  }, []);

  const handleNext = () => {
    // If last step
    if (data.step === 1) {
      // Mark onboarding as complete
      updateData({ onboardingComplete: true });
      setLocation('/home');
      return;
    }
    
    // Otherwise, move to next step
    updateData({ step: data.step + 1 });
  };

  const handleBack = () => {
    if (data.step === 0) {
      setShowExitConfirm(true);
    } else {
      updateData({ step: data.step - 1 });
    }
  };

  const handleExit = () => {
    resetData();
    setLocation('/home');
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // Calculate progress percentage
  const progressPercentage = ((data.step + 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8f7f2] flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex justify-between items-center">
        {data.step > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        )}
        {data.step === 0 && <div className="w-10"></div>}
        
        <div className="w-full max-w-[200px] mx-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <span className="text-sm font-medium text-gray-500">
          {data.step + 1} of 2
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {data.step === 0 && <NewWelcomeScreen onNext={handleNext} />}
            {data.step === 1 && <BenefitsGoalsScreen onNext={handleNext} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-2">Exit Setup?</h3>
            <p className="text-gray-600 mb-6">
              Your progress won't be saved. Are you sure you want to exit?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelExit}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleExit}
              >
                Exit Setup
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}