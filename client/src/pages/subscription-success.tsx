import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<string>("premium");

  useEffect(() => {
    // Get the plan from URL params if present
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get("plan");
    if (planParam) {
      setPlan(planParam);
    }
  }, []);

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing to Eunoia {plan === "yearly" ? "Yearly" : "Monthly"} plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Your subscription includes:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                <span>Unlimited journal entries</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                <span>Advanced AI writing assistance</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                <span>Unlimited image uploads</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                <span>Premium journaling templates</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => setLocation("/home")}
            >
              Start Journaling
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setLocation("/settings")}
            >
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}