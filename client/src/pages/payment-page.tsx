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
import { ArrowLeft, CheckCircle, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const paymentPlans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "9.99",
    description: "Billed monthly. Cancel anytime.",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "99.99",
    savings: "Save 16%",
    description: "Billed annually. Cancel anytime.",
  },
];

export default function PaymentPage() {
  const { user } = useAuth();
  const { data, updateData } = useOnboarding();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  
  // Payment form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

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
    setIsFormValid(
      cardName.trim().length > 0 && 
      cardNumber.replace(/\s/g, "").length === 16 &&
      cardExpiry.length === 5 &&
      cardCvc.length === 3
    );
  }, [cardName, cardNumber, cardExpiry, cardCvc]);
  
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
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsProcessing(true);
    
    try {
      // Mock payment processing with simulated delay
      setTimeout(async () => {
        // Update subscription data
        updateData({
          subscriptionPlan: "premium",
          subscriptionStatus: billingPeriod as "monthly" | "yearly"
        });
        
        // Mock subscription API call
        try {
          await fetch("/api/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ plan: billingPeriod }),
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
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for subscribing to Eunoia Premium. Redirecting to your journal...
          </p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-white to-[#f8f7f2]">
      <div className="w-full max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="h-5 w-5 text-primary" />
              Premium Subscription
            </CardTitle>
            <CardDescription>
              Unlock all features and start your premium journaling experience
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-6">
              {/* Plan Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Choose your billing plan</h3>
                
                <RadioGroup 
                  value={billingPeriod}
                  onValueChange={setBillingPeriod}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {paymentPlans.map((plan) => (
                    <div key={plan.id} className="relative">
                      <RadioGroupItem
                        value={plan.id}
                        id={`plan-${plan.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`plan-${plan.id}`}
                        className="flex flex-col p-4 gap-2 border rounded-lg cursor-pointer hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{plan.name}</span>
                          {plan.savings && (
                            <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                              {plan.savings}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">${plan.price}</span>
                          <span className="text-sm text-gray-500 ml-1">
                            {plan.id === "monthly" ? "/month" : "/year"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{plan.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              {/* Payment Info Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <h3 className="text-lg font-medium">Payment Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
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
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mt-4">
                  <Shield className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  Secure payment processing. We don't store your payment details.
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing || !isFormValid}
                >
                  {isProcessing ? "Processing..." : `Pay $${billingPeriod === 'monthly' ? '9.99' : '99.99'}`}
                </Button>
              </form>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between text-xs text-gray-500 border-t pt-6">
            <span>© 2025 Eunoia</span>
            <span>Secure Payment</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}