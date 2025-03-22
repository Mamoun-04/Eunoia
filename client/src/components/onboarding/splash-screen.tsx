import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-primary/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Eunoia
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your mindful journaling companion
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}