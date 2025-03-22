import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  // Add a class to body for background color
  useEffect(() => {
    document.body.classList.add('bg-[#f9f7f1]');
    
    return () => {
      document.body.classList.remove('bg-[#f9f7f1]');
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f7f1]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div 
          className="text-5xl sm:text-7xl font-serif font-bold text-primary mb-2"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Eunoia
        </motion.div>
        <motion.div 
          className="text-muted-foreground text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Your space for mindful reflection
        </motion.div>
      </motion.div>
    </div>
  );
}