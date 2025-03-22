
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useEffect } from "react";

export default function CreateAccountWithProfile() {
  // Force light theme
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => document.documentElement.classList.remove('light');
  }, []);

  const { setStep } = useOnboarding();

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen bg-[#f8f7f2] p-4 flex flex-col items-center justify-center"
    >
      <div className="max-w-md w-full space-y-12 text-center">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-5xl font-serif font-bold text-[#0000CC]">EUNOIA</h1>
          <p className="text-md font-serif italic text-[#0000CC]">Writing the story of you.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-8 px-4">
          <h2 className="text-2xl font-serif text-gray-800">Welcome to Your Journaling Journey</h2>
          
          <p className="text-gray-700 leading-relaxed">
            Begin your path to mindfulness and self-discovery. With Eunoia, every entry 
            is a step towards understanding yourself better. Let's start writing your story together.
          </p>
          
          <Button 
            size="lg" 
            className="w-full bg-[#0000CC] hover:bg-[#0000CC]/90 mt-8"
            onClick={() => setStep(prev => prev + 1)}
          >
            Begin Your Journey
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
