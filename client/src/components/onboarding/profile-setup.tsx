
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function ProfileSetup() {
  const { setStep } = useOnboarding();

  const handleNext = () => {
    setStep(3);
  };

  return (
    <Card className="w-full max-w-md p-8 mx-auto bg-white">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">✨</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Begin Your Journey</h1>
          <p className="text-lg text-gray-600 max-w-sm">
            Discover a deeper connection with yourself through daily reflection and mindful journaling
          </p>
        </div>

        <Button 
          onClick={handleNext}
          className="mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-full flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
