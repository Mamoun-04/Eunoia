
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, BookOpen, Star, PenLine, Brain, Leaf } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfileSetup() {
  const { setStep } = useOnboarding();
  const [hovered, setHovered] = useState(false);
  
  // Design elements for animation
  const floatingElements = [
    { icon: <Sparkles size={18} className="text-primary/60" />, delay: 0, x: -20, y: -30 },
    { icon: <PenLine size={18} className="text-primary/60" />, delay: 0.5, x: 20, y: -40 },
    { icon: <Heart size={18} className="text-primary/60" />, delay: 1, x: -30, y: 20 },
    { icon: <Leaf size={18} className="text-primary/60" />, delay: 1.5, x: 30, y: 30 },
    { icon: <Brain size={18} className="text-primary/60" />, delay: 2, x: 0, y: -50 },
  ];

  const handleNext = () => {
    setStep(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md mx-auto relative px-4 sm:px-0"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-70"></div>  
      </div>
      
      <Card className="w-full p-8 mx-auto bg-white/80 backdrop-blur-sm border-primary/20 shadow-lg relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-70"
          animate={{ 
            background: [
              "linear-gradient(120deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 50%, rgba(var(--primary-rgb), 0.05) 100%)",
              "linear-gradient(240deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 50%, rgba(var(--primary-rgb), 0.05) 100%)",
              "linear-gradient(360deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 50%, rgba(var(--primary-rgb), 0.05) 100%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="flex flex-col items-center text-center space-y-8 relative">
          {/* Floating elements */}
          {floatingElements.map((el, index) => (
            <motion.div
              key={index}
              className="absolute text-2xl"
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                x: [0, el.x],
                y: [0, el.y]
              }}
              transition={{
                duration: 8,
                delay: el.delay,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              style={{ top: "45%", left: "50%" }}
            >
              {el.icon}
            </motion.div>
          ))}
          
          {/* Main circle */}
          <motion.div 
            className="relative w-48 h-48 md:w-64 md:h-64"
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30 rounded-full flex items-center justify-center"
              animate={{ 
                boxShadow: hovered 
                  ? "0 0 40px rgba(var(--primary-rgb), 0.3)" 
                  : "0 0 20px rgba(var(--primary-rgb), 0.2)"
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full flex items-center justify-center"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0, -10, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  <Sparkles size={40} className="text-primary/80" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1 
              className="text-4xl font-bold text-primary"
              animate={{ 
                scale: [1, 1.01, 1],
                textShadow: ["0 0 0px rgba(var(--primary-rgb), 0)", "0 0 8px rgba(var(--primary-rgb), 0.3)", "0 0 0px rgba(var(--primary-rgb), 0)"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Begin Your Journey
            </motion.h1>
            <p className="text-lg text-gray-700 max-w-sm">
              Discover a deeper connection with yourself through daily reflection and mindful journaling
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button 
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-4 sm:px-8 sm:py-6 rounded-full flex items-center gap-2 text-base sm:text-lg shadow-md w-full sm:w-auto"
            >
              <motion.span
                animate={{ 
                  x: [0, 3, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
              >
                Get Started
              </motion.span>
              <motion.div
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
