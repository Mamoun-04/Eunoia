import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function ProfileSetup() {
  const { data, updateData, setStep } = useOnboarding();
  const [name, setName] = useState(data.name || "");
  const [bio, setBio] = useState(data.bio || "");

  const handleContinue = () => {
    updateData({ 
      name,
      bio
    });
    setStep(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] p-4"
    >
      <Card className="w-full max-w-lg bg-black text-white p-8">
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Stop feeling lost and start living the life you want
            </h1>
            <p className="text-lg text-gray-400">
              Learn about yourself and take control of your present and future to live a more fulfilling life.
            </p>
          </div>

          <div className="mt-8">
            <Button 
              className="w-full bg-[#4444FF] hover:bg-[#3333FF] text-white py-6 text-lg"
              onClick={handleContinue}
            >
              I'm ready! →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}