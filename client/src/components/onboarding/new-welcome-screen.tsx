import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function NewWelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { updateData } = useOnboarding();

  const handleStart = () => {
    onNext();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-serif font-bold mb-3 text-[#0000CC]">EUNOIA</h1>
        <div className="w-16 h-1 bg-[#0000CC] mx-auto mb-6"></div>
        <h2 className="text-2xl font-medium mb-4">Welcome to Your Journaling Journey</h2>
        <p className="text-gray-600 mb-6">
          A place to reflect on your thoughts, track your emotional growth, and gain valuable insights about yourself.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-sm mb-10"
      >
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-bold text-lg text-[#0000CC]">Our Mission</h3>
          </div>
          <div className="p-5">
            <p className="text-gray-600">
              Eunoia helps you develop a meaningful journaling practice that supports your mental well-being and personal growth through thoughtful reflection.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="font-medium mb-2 text-[#0000CC]">Mindfulness</div>
          <p className="text-sm text-gray-600">Stay present and cultivate awareness through daily reflections</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="font-medium mb-2 text-[#0000CC]">Growth</div>
          <p className="text-sm text-gray-600">Track your personal journey and see your progress over time</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Button 
          size="lg"
          onClick={handleStart}
          className="bg-[#0000CC] hover:bg-[#0000AA] text-white px-8"
        >
          Begin Your Journey
        </Button>
      </motion.div>
    </div>
  );
}