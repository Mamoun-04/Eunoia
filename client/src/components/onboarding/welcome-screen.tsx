import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const { setStep } = useOnboarding();
  const [, setLocation] = useLocation();

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

  const handleNewUser = () => {
    // Set to step 2 directly (profile setup) to skip welcome screen in onboarding
    setStep(2);
    setLocation("/onboarding");
  };

  const handleLogin = () => {
    setLocation("/auth");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen bg-[#f8f7f2] p-4 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full space-y-12 text-center">
        {/* Logo/Branding */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-5xl font-serif font-bold text-[#0000CC]">EUNOIA</h1>
          <p className="text-md font-serif italic text-[#0000CC]">Writing the story of you.</p>
        </motion.div>
        
        {/* Description */}
        <motion.div variants={itemVariants} className="space-y-6 px-4">
          <p className="text-gray-700">
            Your mindful journaling companion for self-reflection and personal growth.
          </p>
          
          <div className="pt-4 space-y-6">
            {/* Two main buttons */}
            <motion.div variants={itemVariants}>
              <Button 
                size="lg" 
                className="w-full bg-[#0000CC] hover:bg-[#0000CC]/90"
                onClick={handleLogin}
              >
                Login
              </Button>
              <p className="text-xs mt-2 text-gray-500">Already have an account</p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full border-[#0000CC] text-[#0000CC] hover:bg-[#0000CC]/10"
                onClick={handleNewUser}
              >
                New User
              </Button>
              <p className="text-xs mt-2 text-gray-500">Complete the full onboarding</p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.div variants={itemVariants} className="text-xs text-gray-500">
          <p>© 2025 Eunoia - Mindful Journaling</p>
        </motion.div>
      </div>
    </motion.div>
  );
}