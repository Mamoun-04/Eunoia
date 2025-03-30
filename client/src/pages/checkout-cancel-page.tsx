import { useLocation } from "wouter";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  const [, setLocation] = useLocation();

  const handleReturnToSettings = () => {
    setLocation("/settings");
  };
  
  const handleTryAgain = () => {
    // This would typically redirect to where the user initiated the subscription flow
    // Either the pricing page, settings page, or onboarding
    setLocation("/settings");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="flex flex-col items-center">
          <div className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-red-100 rounded-full"
              style={{ width: '120px', height: '120px', left: '-10px', top: '-10px' }}
            />
            <XCircle className="w-24 h-24 text-red-400 relative z-10" />
          </div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-serif font-bold mb-3"
          >
            Payment Canceled
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-8"
          >
            Your subscription payment was canceled. No charges were made. You can try again whenever you're ready.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4 w-full sm:flex-row sm:gap-3"
          >
            <Button 
              onClick={handleReturnToSettings}
              variant="outline"
              size="lg"
              className="font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Settings
            </Button>
            
            <Button 
              onClick={handleTryAgain}
              size="lg"
              className="bg-primary hover:bg-primary/90 font-medium"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}