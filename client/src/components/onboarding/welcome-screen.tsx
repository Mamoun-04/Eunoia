import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function WelcomeScreen() {
  const { setStep } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-xl mx-auto p-6"
    >
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-primary">
        Welcome to Eunoia
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground mb-8">
        Your space for mindful reflection and personal growth.
        Start your journey to a more reflective and intentional life.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-medium mb-2">Daily Reflections</h3>
          <p className="text-muted-foreground">Develop a mindful journaling practice at your own pace</p>
        </div>
        <div className="bg-white/50 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-medium mb-2">Mood Tracking</h3>
          <p className="text-muted-foreground">Gain insights into your emotional patterns over time</p>
        </div>
      </div>

      <Button 
        size="lg" 
        className="text-lg px-8 py-6 h-auto font-medium"
        onClick={() => setStep(2)}
      >
        Get Started
      </Button>
    </motion.div>
  );
}