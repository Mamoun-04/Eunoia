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
import { 
  CheckCircle2, 
  X, 
  Zap, 
  CalendarDays, 
  Sparkles, 
  CreditCard, 
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

type BillingPeriod = 'monthly' | 'yearly';

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { data, updateData } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(data.subscriptionPlan || 'free');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const handlePlanSelection = (plan: 'free' | 'premium') => {
    setSelectedPlan(plan);
    updateData({ 
      subscriptionPlan: plan,
      billingPeriod: plan === 'premium' ? billingPeriod : undefined 
    });
  };

  const handleBillingPeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
    if (selectedPlan === 'premium') {
      updateData({ billingPeriod: period });
    }
  };

  const handleNext = () => {
    onNext();
  };

  const annualSavings = ((4.99 * 12) - 39.99).toFixed(2);

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col px-6 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center max-w-lg mx-auto"
      >
        <h2 className="text-3xl font-serif font-medium mb-3">Choose Your Journey</h2>
        <p className="text-gray-600 text-lg">
          Select the plan that best fits your journaling needs
        </p>
      </motion.div>

      <motion.div 
        className="mb-8 max-w-xs mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {selectedPlan === 'premium' && (
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Tabs 
              defaultValue="monthly" 
              value={billingPeriod}
              onValueChange={(value) => handleBillingPeriodChange(value as BillingPeriod)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1 bg-blue-50 dark:bg-blue-900/20">
                <TabsTrigger 
                  value="monthly"
                  className={`${billingPeriod === 'monthly' ? 'bg-white shadow-md dark:bg-slate-800' : ''} transition-all duration-300`}
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger 
                  value="yearly"
                  className={`${billingPeriod === 'yearly' ? 'bg-white shadow-md dark:bg-slate-800' : ''} transition-all duration-300`}
                >
                  Yearly
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Save {Math.round(100 - (39.99 / (4.99 * 12)) * 100)}%
                    </Badge>
                  </motion.div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        {/* Free Plan */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className={`h-full flex flex-col ${
              selectedPlan === 'free' 
                ? 'ring-2 ring-primary border-primary shadow-lg bg-gradient-to-br from-white to-blue-50' 
                : 'border-border hover:border-primary/50 hover:shadow-md transition-all duration-300'
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-serif">Free Plan</CardTitle>
                  <CardDescription className="text-base mt-1">Get started with basic journaling</CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={`py-1 ${selectedPlan === 'free' ? 'bg-primary/10 text-primary' : 'text-gray-500'}`}
                >
                  Free Forever
                </Badge>
              </div>
              <motion.div 
                className="mt-4 pt-3 border-t"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-2xl font-bold">$0</span>
                <span className="text-gray-500 ml-1">forever</span>
              </motion.div>
            </CardHeader>
            
            <CardContent className="flex-grow space-y-5 pb-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>1 journal entry per day</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Basic mood tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>Up to 1 image per entry</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                  <span>250 word limit per entry</span>
                </div>
                <div className="flex items-center text-sm">
                  <X className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Advanced AI insights</span>
                </div>
                <div className="flex items-center text-sm">
                  <X className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Unlimited entries</span>
                </div>
                <div className="flex items-center text-sm">
                  <X className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Premium journal templates</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <Button 
                variant={selectedPlan === 'free' ? 'default' : 'outline'} 
                className="w-full py-6 text-base"
                onClick={() => handlePlanSelection('free')}
              >
                {selectedPlan === 'free' ? 'Selected' : 'Select Free Plan'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Premium Plan */}
        <motion.div 
          variants={itemVariants} 
          animate={selectedPlan === 'premium' ? pulseAnimation : {}}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className={`h-full flex flex-col relative overflow-hidden ${
              selectedPlan === 'premium' 
                ? 'ring-2 ring-[#FFD700] border-[#FFD700] shadow-xl bg-gradient-to-br from-white to-yellow-50' 
                : 'border-border hover:border-primary/50 hover:shadow-md transition-all duration-300'
            }`}
          >
            {selectedPlan === 'premium' && (
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
            )}
            
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 text-xs font-medium rounded-bl-md">
              RECOMMENDED
            </div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-serif flex items-center">
                    Premium Plan
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
              </div>
              <div className="mt-4 pt-3 border-t">
                {billingPeriod === 'monthly' ? (
                  <div>
                    <span className="text-2xl font-bold">$4.99</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                ) : (
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-2xl font-bold">$39.99</span>
                      <span className="text-gray-500 ml-1">/year</span>
                      <div className="text-green-600 text-sm mt-1 font-medium">Save ${annualSavings} per year</div>
                    </motion.div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow space-y-5 pb-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium">
                  <Zap className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                  <span>Everything in Free, plus:</span>
                </div>
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
                  <span>Up to 5 images per entry</span>
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
                variant={selectedPlan === 'premium' ? 'default' : 'outline'} 
                className="w-full py-6 text-base"
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
        className="flex justify-center mt-10"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Button 
            size="lg" 
            onClick={handleNext}
            className={`
              px-10 py-6 text-lg font-medium rounded-xl
              ${selectedPlan === 'premium' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 text-white'}
              shadow-lg hover:shadow-xl transition-all duration-300
            `}
          >
            {selectedPlan === 'free' 
              ? 'Continue with Free Plan' 
              : (
                <span className="flex items-center">
                  Continue to Payment
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              )
            }
          </Button>
        </motion.div>
      </motion.div>

      {selectedPlan === 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col items-center text-sm text-gray-600 mt-6 max-w-md mx-auto"
        >
          <p className="flex items-center mb-3">
            <CalendarDays className="h-4 w-4 mr-2" />
            7-day free trial, cancel anytime
          </p>
          <div className="flex space-x-4 mt-2">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
              <span>Stripe</span>
            </div>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-1 text-gray-500" />
              <span>Apple Pay on iOS</span>
            </div>
          </div>
        </motion.div>
      )}

      {selectedPlan === 'free' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center text-sm text-gray-500 mt-6 max-w-md mx-auto"
        >
          <p>You can upgrade to Premium anytime in settings</p>
        </motion.div>
      )}
    </div>
  );
}