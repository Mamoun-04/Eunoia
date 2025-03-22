
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeStep({ onNext }: { onNext: (data: any) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
      <h1 className="text-4xl font-bold">Welcome to Eunoia</h1>
      <p className="text-xl text-muted-foreground max-w-md">
        Your space for mindful reflection. Begin your journey to self-discovery and personal growth.
      </p>
      <Button onClick={() => onNext({})} className="mt-4" size="lg">
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
