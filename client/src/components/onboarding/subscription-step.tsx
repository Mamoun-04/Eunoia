
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/use-onboarding';

const features = [
  { name: "Unlimited journal entries", included: { free: true, monthly: true, yearly: true } },
  { name: "Basic mood tracking", included: { free: true, monthly: true, yearly: true } },
  { name: "Daily mindfulness reminders", included: { free: true, monthly: true, yearly: true } },
  { name: "Access to guided journaling prompts", included: { free: false, monthly: true, yearly: true } },
  { name: "Advanced mood analytics", included: { free: false, monthly: true, yearly: true } },
  { name: "Unlimited AI journal assistant", included: { free: false, monthly: true, yearly: true } },
  { name: "Journal entry themes", included: { free: false, monthly: true, yearly: true } },
  { name: "Priority support", included: { free: false, monthly: false, yearly: true } },
  { name: "Advanced journaling insights", included: { free: false, monthly: false, yearly: true } },
  { name: "Early access to new features", included: { free: false, monthly: false, yearly: true } }
];

const faqs = [
  {
    question: "Is Premium really worth it?",
    answer: "Most of our users think so — in fact, 9 out of 10 members upgrade within their first week. Premium unlocks AI-powered insights, advanced analytics, and deeper self-reflection tools that transform your journaling practice."
  },
  {
    question: "Can I change my plan later?",
    answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time. You'll have access to premium features until the end of your current billing period."
  },
  {
    question: "What happens to my entries if I cancel?",
    answer: "Your journal entries are always yours. If you downgrade to Free, you'll maintain access to all your past entries while future entries will align with Free plan features."
  }
];

export default function SubscriptionStep() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState(data.subscriptionPlan || 'free');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleContinue = () => {
    updateData({ subscriptionPlan: selectedPlan });
    setStep(6);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-4 py-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-primary mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Start your mindful journaling journey today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Free Plan */}
        <Card className={`relative h-full transition-all duration-200 hover:shadow-lg ${
          selectedPlan === 'free' ? 'ring-2 ring-primary shadow-lg' : 'shadow-md hover:scale-102'
        }`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg mb-1">Free</CardTitle>
            <div className="text-3xl font-bold mb-1">$0</div>
            <p className="text-sm text-muted-foreground">Forever</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 border-t pt-4">
              {features.map((feature, index) => (
                <div key={index} className={`flex items-center text-sm ${!feature.included.free ? 'text-muted-foreground' : ''}`}>
                  {feature.included.free ? (
                    <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 mr-2" />
                  )}
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
            <Button
              variant={selectedPlan === 'free' ? 'default' : 'outline'}
              className="w-full mt-6"
              onClick={() => setSelectedPlan('free')}
            >
              {selectedPlan === 'free' ? 'Selected' : 'Choose Free'}
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card className={`relative h-full transition-all duration-200 hover:shadow-lg ${
          selectedPlan === 'monthly' ? 'ring-2 ring-primary shadow-lg' : 'shadow-md hover:scale-102'
        }`}>
          <CardHeader className="text-center pb-4">
            <Badge variant="secondary" className="absolute top-2 right-2">
              Popular Choice
            </Badge>
            <CardTitle className="text-lg mb-1">Premium</CardTitle>
            <div className="text-3xl font-bold mb-1">$4.99</div>
            <p className="text-sm text-muted-foreground">per month</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 border-t pt-4">
              {features.map((feature, index) => (
                <div key={index} className={`flex items-center text-sm ${!feature.included.monthly ? 'text-muted-foreground' : ''}`}>
                  {feature.included.monthly ? (
                    <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 mr-2" />
                  )}
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
            <Button
              variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
              className="w-full mt-6"
              onClick={() => setSelectedPlan('monthly')}
            >
              {selectedPlan === 'monthly' ? 'Selected' : 'Choose Premium'}
            </Button>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className={`relative h-full transition-all duration-200 hover:shadow-lg ${
          selectedPlan === 'yearly' ? 'ring-2 ring-primary shadow-lg' : 'shadow-md hover:scale-102'
        }`}>
          <CardHeader className="text-center pb-4">
            <Badge variant="default" className="absolute top-2 right-2">
              Best Value
            </Badge>
            <CardTitle className="text-lg mb-1">Premium Plus</CardTitle>
            <div className="text-3xl font-bold mb-1">$39.99</div>
            <p className="text-sm text-muted-foreground">per year</p>
            <p className="text-xs text-emerald-600 font-medium">Save $19.89</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 border-t pt-4">
              {features.map((feature, index) => (
                <div key={index} className={`flex items-center text-sm ${!feature.included.yearly ? 'text-muted-foreground' : ''}`}>
                  {feature.included.yearly ? (
                    <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 mr-2" />
                  )}
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
            <Button
              variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
              className="w-full mt-6"
              onClick={() => setSelectedPlan('yearly')}
            >
              {selectedPlan === 'yearly' ? 'Selected' : 'Choose Premium Plus'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <h3 className="text-lg font-medium text-center mb-4">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-muted/50"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 py-3 bg-muted/25 text-sm text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 border-t mt-auto">
        <div className="max-w-md mx-auto px-4">
          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
          >
            Continue with {selectedPlan === 'free' ? 'Free Plan' : selectedPlan === 'monthly' ? 'Premium' : 'Premium Plus'}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            You can change your plan anytime. No credit card required for free plan.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
