import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle, 
  Shield, 
  CreditCard, 
  AppleIcon, 
  LockIcon, 
  BadgeCheck,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const paymentPlans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "4.99",
    description: "Billed monthly. Cancel anytime.",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "39.99",
    savings: "Save 33%",
    description: "Billed annually. Cancel anytime.",
  },
];

type PaymentMethod = "card" | "apple";

export default function PaymentPage() {
  const { user } = useAuth();
  const { data, updateData } = useOnboarding();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState(data?.billingPeriod === "yearly" ? "yearly" : "monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  
  // Payment form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  // Check if Apple Pay is available (mock for demo)
  useEffect(() => {
    // In a real app, you would check if Apple Pay is available
    // For this demo, we'll just simulate it's available on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsApplePayAvailable(isIOS);
  }, []);

  // Force light theme for payment page
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => document.documentElement.classList.remove('light');
  }, []);
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);
  
  // Validate form
  useEffect(() => {
    if (paymentMethod === "apple") {
      setIsFormValid(true);
      return;
    }
    
    setIsFormValid(
      cardName.trim().length > 0 && 
      cardNumber.replace(/\s/g, "").length === 16 &&
      cardExpiry.length === 5 &&
      cardCvc.length === 3
    );
  }, [cardName, cardNumber, cardExpiry, cardCvc, paymentMethod]);
  
  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would integrate with Stripe or Apple Pay
      // For now, we'll simulate a successful payment after a short delay
      setTimeout(async () => {
        // Update subscription data
        updateData({
          subscriptionPlan: "premium",
          billingPeriod: billingPeriod as "monthly" | "yearly"
        });
        
        // API call to update subscription on the server
        try {
          await fetch("/api/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              plan: billingPeriod,
              paymentMethod: paymentMethod 
            }),
          });
        } catch (error) {
          console.error("Error setting subscription:", error);
        }
        
        // Show success state
        setPaymentSuccess(true);
        
        // Redirect to home after a delay
        setTimeout(() => {
          setLocation("/home");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again."
      });
      setIsProcessing(false);
    }
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    await processPayment();
  };
  
  const handleApplePayClick = async () => {
    if (isProcessing) return;
    
    await processPayment();
  };
  
  const handleCancel = () => {
    setLocation("/onboarding");
  };
  
  // If payment is successful, show success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-green-100 rounded-full"
              style={{ width: '100px', height: '100px', left: '-10px', top: '-10px' }}
            />
            <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
          </div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-serif font-bold mb-3"
          >
            Payment Successful!
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-8"
          >
            Thank you for subscribing to Eunoia Premium. Redirecting to your journal...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="flex items-center justify-center text-sm text-gray-500">
              <BadgeCheck className="h-4 w-4 mr-1 text-primary" />
              {billingPeriod === 'monthly' ? 'Monthly' : 'Annual'} subscription activated
            </span>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Card className="shadow-xl border-gray-100 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-serif">
              <CreditCard className="h-5 w-5 text-primary" />
              Premium Subscription
            </CardTitle>
            <CardDescription className="text-base">
              Unlock unlimited journaling and AI assistance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center space-y-2">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-4"
              >
                <div className="text-sm text-gray-500 mb-2">Your selected plan</div>
                <div className="text-3xl font-bold text-gray-900">
                  {billingPeriod === 'monthly' ? '$4.99' : '$39.99'}
                  <span className="text-base font-normal text-gray-500 ml-1">
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <div className="text-green-600 text-sm mt-1">
                    You save ${((4.99 * 12) - 39.99).toFixed(2)} per year
                  </div>
                )}
              </motion.div>
              
              <Tabs 
                defaultValue={billingPeriod} 
                onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}
                className="w-full max-w-xs"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly
                    <span className="ml-1 text-xs text-green-600">-33%</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-green-500 mr-1" />
                <span>Cancel anytime</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              {isApplePayAvailable && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Payment method</h3>
                    <div className="flex items-center space-x-1">
                      <LockIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Secure payment</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      className="flex items-center justify-center py-5"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Card
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "apple" ? "default" : "outline"}
                      className="flex items-center justify-center py-5"
                      onClick={() => setPaymentMethod("apple")}
                    >
                      <AppleIcon className="h-5 w-5 mr-2" />
                      Apple Pay
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Apple Pay Button */}
              {paymentMethod === "apple" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="my-8"
                >
                  <Button
                    onClick={handleApplePayClick}
                    disabled={isProcessing}
                    className="w-full bg-black hover:bg-gray-900 text-white py-6 rounded-lg"
                  >
                    <AppleIcon className="h-5 w-5 mr-2" />
                    {isProcessing ? "Processing..." : "Pay with Apple Pay"}
                  </Button>
                  <div className="mt-4 text-center text-xs text-gray-500">
                    Your payment will be securely processed by Apple Pay
                  </div>
                </motion.div>
              )}
              
              {/* Credit Card Form */}
              {paymentMethod === "card" && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handlePaymentSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Smith"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="py-5"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="py-5"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          if (formatted.length <= 5) {
                            setCardExpiry(formatted);
                          }
                        }}
                        maxLength={5}
                        className="py-5"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 3) {
                            setCardCvc(value);
                          }
                        }}
                        maxLength={3}
                        className="py-5"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-4">
                    <Shield className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    Your payment is secured with Stripe. We never store your full card details.
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full py-6 text-base mt-4"
                    disabled={isProcessing || !isFormValid}
                  >
                    {isProcessing ? "Processing..." : `Pay $${billingPeriod === 'monthly' ? '4.99' : '39.99'}`}
                  </Button>
                </motion.form>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center text-xs text-gray-500 border-t pt-6">
            <div className="flex items-center">
              <span>© 2025 Eunoia</span>
            </div>
            <div className="flex items-center space-x-2">
              <LockIcon className="h-3 w-3" />
              <span>Secure Payment</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}