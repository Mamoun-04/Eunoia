import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Sparkles,
  Gift, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionScreenProps {
  onNext: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

const pulseAnimation = {
  scale: [1, 1.02, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: "reverse" as const
  }
};

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  
  useEffect(() => {
    // Automatically set everyone to premium
    updateData({ 
      subscriptionPlan: 'premium',
      billingPeriod: 'yearly' // Give them the best plan
    });
  }, [updateData]);

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col px-6 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center max-w-lg mx-auto"
      >
        <h2 className="text-3xl font-serif font-medium mb-3">Good News!</h2>
        <p className="text-gray-600 text-lg">
          For a limited time, all premium features are available to everyone for free!
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <motion.div 
          variants={itemVariants}
          animate={pulseAnimation}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className="h-full flex flex-col relative overflow-hidden ring-2 ring-[#FFD700] border-[#FFD700] shadow-xl bg-gradient-to-br from-white to-yellow-50"
          >
            <motion.div 
              className="absolute inset-0 bg-[#FFD700]/5 z-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.1, 0.15, 0.1],
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-xs font-medium rounded-bl-md">
              FREE ACCESS
            </div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-serif flex items-center">
                    All Premium Features
                    <motion.div
                      animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-5 w-5 ml-2 text-yellow-500" />
                    </motion.div>
                  </CardTitle>
                  <CardDescription className="text-base mt-1">Unlimited journaling experience</CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className="py-1 bg-green-100 text-green-800"
                >
                  Limited Time Offer
                </Badge>
              </div>
              <motion.div 
                className="mt-4 pt-3 border-t"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-600">$0</span>
                  <div className="flex items-center ml-3">
                    <span className="text-gray-400 line-through text-sm mr-2">$4.99/month</span>
                    <Badge className="bg-green-100 text-green-800">100% OFF</Badge>
                  </div>
                </div>
              </motion.div>
            </CardHeader>
            
            <CardContent className="flex-grow space-y-5 pb-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Unlimited entries per day</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Advanced mood analysis & insights</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>AI-powered journaling assistant</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Unlimited images per entry</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>No word limit on entries</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Premium journal templates & prompts</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <Button 
                className="w-full py-6 text-base bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={handleNext}
              >
                <span className="flex items-center">
                  Continue to Eunoia
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center mt-10 text-gray-600"
      >
        <p>No credit card required. Enjoy all premium features!</p>
      </motion.div>
    </div>
  );
}