import { motion } from "framer-motion";
import { useEffect } from "react";

export default function SplashScreen() {
  // Logo animation variants
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 1.2, 
        ease: "easeOut" 
      }
    }
  };

  // Text animation variants
  const taglineVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        delay: 0.6, 
        duration: 1
      }
    }
  };

  // Loading dot variants
  const loadingDotVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      transition: {
        delay: i * 0.2,
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0.6
      }
    })
  };

  // Add a subtle fade-in effect to the background
  useEffect(() => {
    document.body.style.backgroundColor = "#f8f7f2";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8f7f2]">
      <div className="relative">
        {/* Logo container */}
        <motion.div
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#0000CC]"
            style={{ 
              letterSpacing: "0.01em",
              fontFamily: "serif"
            }}
          >
            EUNOIA
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={taglineVariants}
          initial="hidden"
          animate="visible"
          className="mt-2 text-sm sm:text-base text-[#0000CC] text-center italic"
          style={{ fontFamily: "serif" }}
        >
          Writing the story of you.
        </motion.p>

        {/* Loading dots */}
        <motion.div className="flex justify-center mt-16 space-x-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={loadingDotVariants}
              initial="hidden"
              animate="visible"
              className="w-2 h-2 rounded-full bg-[#0000CC]"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}