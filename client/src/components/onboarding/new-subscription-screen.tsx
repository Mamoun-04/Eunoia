import { useState } from 'react';
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
import { CheckCircle2, X, Zap, CalendarDays, Image, Clock, FileText, Sparkles } from 'lucide-react';
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
  visible: { opacity: 1, y: 0 }
};

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { data, updateData } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(data.subscriptionPlan || 'free');

  const handlePlanSelection = (plan: 'free' | 'premium') => {
    setSelectedPlan(plan);
    updateData({ subscriptionPlan: plan });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="h-full flex flex-col px-6 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center max-w-md mx-auto"
      >
        <h2 className="text-2xl font-medium mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">
          Select the plan that best fits your journaling needs and goals
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        {/* Free Plan */}
        <motion.div variants={itemVariants}>
          <Card 
            className={`h-full flex flex-col ${
              selectedPlan === 'free' 
                ? 'ring-2 ring-primary border-primary' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Free Plan</CardTitle>
                  <CardDescription>Get started with basic journaling</CardDescription>
                </div>
                <Badge variant="outline" className="text-gray-500">Free</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>1 journal entry per day</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Basic mood tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Up to 1 image per entry</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>250 word limit per entry</span>
                </div>
                <div className="flex items-center text-sm">
                  <X className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Advanced AI insights</span>
                </div>
                <div className="flex items-center text-sm">
                  <X className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Unlimited entries</span>
                </div>
                <div className="flex items-center text-sm">
                  <X className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Premium journal templates</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant={selectedPlan === 'free' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => handlePlanSelection('free')}
              >
                {selectedPlan === 'free' ? 'Selected' : 'Select Free Plan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Premium Plan */}
        <motion.div variants={itemVariants}>
          <Card 
            className={`h-full flex flex-col relative overflow-hidden ${
              selectedPlan === 'premium' 
                ? 'ring-2 ring-primary border-primary' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium">
              RECOMMENDED
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    Premium Plan
                    <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />
                  </CardTitle>
                  <CardDescription>Unlimited journaling experience</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">$9.99</span>
                  <CardDescription>/month</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium">
                  <Zap className="h-4 w-4 mr-2 text-primary" />
                  <span>Everything in Free, plus:</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Unlimited entries per day</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Advanced mood analysis & insights</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>AI-powered journaling assistant</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Up to 5 images per entry</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>No word limit on entries</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Premium journal templates & prompts</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  <span>Priority support</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant={selectedPlan === 'premium' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => handlePlanSelection('premium')}
              >
                {selectedPlan === 'premium' ? 'Selected' : 'Select Premium Plan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center mt-8"
      >
        <Button 
          size="lg" 
          onClick={handleNext}
          className="px-8"
        >
          {selectedPlan === 'free' ? 'Continue with Free Plan' : 'Continue to Payment'}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="text-center text-sm text-gray-500 mt-4 max-w-md mx-auto"
      >
        {selectedPlan === 'premium' ? (
          <p className="flex items-center justify-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1" />
            7-day free trial, cancel anytime
          </p>
        ) : (
          <p>You can upgrade to Premium anytime in settings</p>
        )}
      </motion.div>
    </div>
  );
}