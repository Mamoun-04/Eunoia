import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BookOpenText, Sparkles, Brain, HeartHandshake, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onNext: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  }
};

export default function NewWelcomeScreen({ onNext }: { onNext?: () => void }) {
  const { updateData } = useOnboarding();

  const handleStart = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-12 mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div 
            animate={floatAnimation}
            className="inline-block"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
              <BookOpenText size={40} className="text-[#0000CC]" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl font-serif font-bold mb-3 text-[#0000CC] tracking-tight">EUNOIA</h1>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-1 bg-[#0000CC]/30 rounded-full"></div>
            <Sparkles className="h-5 w-5 text-[#0000CC]" />
            <div className="w-12 h-1 bg-[#0000CC]/30 rounded-full"></div>
          </div>
          
          <h2 className="text-3xl font-medium mb-4">Welcome to Your Mindful Journaling Journey</h2>
          
          <motion.p
            variants={itemVariants} 
            className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed"
          >
            A serene space to reflect on your thoughts, track emotional growth, and gain valuable insights that nurture your well-being.
          </motion.p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl mx-auto mb-12 relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transform rotate-1 scale-[1.02] opacity-70"></div>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden relative z-10 border border-blue-100">
            <div className="p-6 bg-gradient-to-r from-[#0000CC]/5 to-transparent border-b">
              <h3 className="font-bold text-xl text-[#0000CC] flex items-center">
                <HeartHandshake className="h-5 w-5 mr-2" />
                Our Mission
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Eunoia provides a thoughtful space for you to develop a meaningful journaling practice that nurtures mental well-being and fosters personal growth through daily reflection and emotional awareness.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mx-auto mb-12"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 204, 0.1)" }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <Brain className="h-5 w-5 text-[#0000CC]" />
              </div>
              <div className="font-medium text-[#0000CC]">Mindfulness</div>
            </div>
            <p className="text-sm text-gray-600">Stay present and cultivate awareness through guided reflections</p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 204, 0.1)" }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <Sparkles className="h-5 w-5 text-[#0000CC]" />
              </div>
              <div className="font-medium text-[#0000CC]">Growth</div>
            </div>
            <p className="text-sm text-gray-600">Track your journey and witness your progress over time</p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 204, 0.1)" }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <BookOpenText className="h-5 w-5 text-[#0000CC]" />
              </div>
              <div className="font-medium text-[#0000CC]">Insight</div>
            </div>
            <p className="text-sm text-gray-600">Gain meaningful perspectives on your thoughts and emotions</p>
          </motion.div>
        </motion.div>

        {/* Button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <Button 
            size="lg"
            onClick={handleStart}
            className="bg-[#0000CC] hover:bg-[#0000AA] text-white px-10 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Begin Your Journey
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}