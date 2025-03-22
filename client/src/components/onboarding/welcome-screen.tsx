import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function WelcomeScreen() {
  // Force light theme for welcome screen
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => document.documentElement.classList.remove('light');
  }, []);
  
  const { setStep } = useOnboarding();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleContinue = () => {
    setStep(3); // Go to the next step (goal setting)
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-3xl mx-auto px-4 py-6 text-center"
    >
      <div className="space-y-10">
        {/* Logo/Branding */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-5xl font-serif font-bold text-primary">EUNOIA</h1>
          <p className="text-lg font-serif italic text-primary">Writing the story of you.</p>
        </motion.div>
        
        {/* Welcome Message */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome to Your Journey of Mindful Journaling
          </h2>
          <p className="text-lg text-gray-700">
            Congratulations on taking the first step toward self-discovery and mental clarity!
          </p>
        </motion.div>
        
        {/* Description */}
        <motion.div variants={itemVariants} className="space-y-6 px-4 max-w-xl mx-auto">
          <p className="text-gray-700 leading-relaxed">
            Eunoia offers you a calm space for reflection, with daily prompts, mood tracking, 
            and personal insights to nurture your mental wellbeing. Your journal becomes a mirror 
            to your growth, capturing moments of clarity and guiding you through challenges.
          </p>
          
          <div className="pt-6">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-10 py-6 text-lg bg-primary hover:bg-primary/90"
              onClick={handleContinue}
            >
              Begin Your Journey
            </Button>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.div variants={itemVariants} className="text-sm text-gray-500 pt-6">
          <p>© 2025 Eunoia - Mindful Journaling</p>
        </motion.div>
      </div>
    </motion.div>
  );
}