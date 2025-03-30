import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircle, BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string>(""); 

  // Extract the session_id from the URL query parameters
  const sessionId = new URLSearchParams(search).get("session_id");

  useEffect(() => {
    async function processCheckoutSession() {
      if (!sessionId) {
        setError("No session ID found. Unable to process your subscription.");
        setProcessing(false);
        return;
      }

      try {
        // Call API to process the checkout session
        const response = await fetch(`/api/subscription/process-checkout?session_id=${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process subscription");
        }
        
        // Trigger a refetch of user data to get the updated subscription status
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // Set subscription type based on user data
        if (user?.subscriptionStatus) {
          setSubscriptionType(user.subscriptionStatus === "yearly" ? "Annual" : "Monthly");
        } else {
          // Default fallback if for some reason we can't determine from user data
          setSubscriptionType("Premium");
        }
        
        // Show success toast
        toast({
          title: "Subscription activated!",
          description: "Thank you for subscribing to Eunoia Premium.",
        });
        
        setProcessing(false);
      } catch (err) {
        console.error("Error processing checkout:", err);
        setError(
          err instanceof Error 
            ? err.message 
            : "An error occurred while processing your subscription"
        );
        setProcessing(false);
      }
    }

    processCheckoutSession();
  }, [sessionId, toast, user, queryClient]);

  const handleContinue = () => {
    setLocation("/entries");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {processing ? (
          <div className="flex flex-col items-center">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold mb-3">
              Processing your subscription...
            </h1>
            <p className="text-gray-600">
              Please wait while we activate your premium features.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-4xl">!</span>
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <Button 
              onClick={() => setLocation("/settings")}
              className="bg-primary hover:bg-primary/90"
            >
              Return to Settings
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative inline-block mb-6">
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-green-100 rounded-full"
                style={{ width: '120px', height: '120px', left: '-10px', top: '-10px' }}
              />
              <CheckCircle className="w-24 h-24 text-green-500 relative z-10" />
            </div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-serif font-bold mb-3"
            >
              You're all set!
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 mb-8"
            >
              Thank you for subscribing to Eunoia Premium. All premium features are now unlocked.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <span className="flex items-center justify-center text-sm text-gray-500 mb-2">
                <BadgeCheck className="h-4 w-4 mr-1 text-primary" />
                {subscriptionType} subscription activated
              </span>
              <span className="flex items-center justify-center text-sm text-gray-500">
                <BadgeCheck className="h-4 w-4 mr-1 text-primary" />
                Unlimited journaling, lessons, and themes
              </span>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={handleContinue}
                size="lg"
                className="bg-primary hover:bg-primary/90 font-medium px-8"
              >
                Continue to Journal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}