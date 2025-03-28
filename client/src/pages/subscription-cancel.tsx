import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Subscription Not Completed</CardTitle>
          <CardDescription>
            Your subscription process was not completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            No worries! You can still use Eunoia with our free plan or try subscribing again.
          </p>
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => setLocation("/home")}
            >
              Continue to Eunoia
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setLocation("/settings")}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}