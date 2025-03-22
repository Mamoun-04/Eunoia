import { motion } from "framer-motion";

export default function SplashScreen() {
  // Logo animation variants
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3, 
        duration: 0.5 
      }
    }
  };

  // Loading dot variants
  const loadingDotVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0],
      y: [0, -10, 0],
      transition: {
        delay: i * 0.2,
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0.6
      }
    })
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="relative">
        {/* Logo container */}
        <motion.div
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <div className="mb-3 w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-12 h-12 text-primary"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-primary"
          >
            Eunoia
          </motion.h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="mt-3 text-lg text-gray-600 text-center"
        >
          Your mindful journaling companion
        </motion.p>

        {/* Loading dots */}
        <motion.div className="flex justify-center mt-12 space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={loadingDotVariants}
              initial="hidden"
              animate="visible"
              className="w-3 h-3 rounded-full bg-primary"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}