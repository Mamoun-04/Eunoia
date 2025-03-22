import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
  const { setStep } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-bold text-primary">Welcome to Eunoia</CardTitle>
          <CardDescription className="text-center text-lg">
            Your journey to mindful self-reflection begins here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Eunoia is a mindful journaling app designed to help you:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary text-xl">✦</span>
                <span>Capture your thoughts and emotions in a meaningful way</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary text-xl">✦</span>
                <span>Reflect on your personal growth journey</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary text-xl">✦</span>
                <span>Find moments of mindfulness in your daily life</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary text-xl">✦</span>
                <span>Track your moods and emotional patterns</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary text-xl">✦</span>
                <span>Receive AI-guided journaling assistance when needed</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={() => setStep(2)}
          >
            Let's Get Started
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}