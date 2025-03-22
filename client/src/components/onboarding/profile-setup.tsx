import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ProfileSetup() {
  const { data, updateData, setStep } = useOnboarding();
  const [name, setName] = useState(data.name || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(data.profilePhoto || null);
  const [bio, setBio] = useState(data.bio || "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    updateData({ 
      name, 
      profilePhoto: imagePreview || undefined,
      bio
    });
    setStep(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Create Your Profile</CardTitle>
          <CardDescription>Tell us a little about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={imagePreview || undefined} />
              <AvatarFallback className="text-3xl bg-primary/10">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <Label 
                htmlFor="profile-photo" 
                className="cursor-pointer text-primary hover:text-primary/80 transition-colors"
              >
                {imagePreview ? "Change photo" : "Upload photo"}
              </Label>
              <Input 
                id="profile-photo" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us a bit about yourself... (optional)" 
                rows={3}
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Button 
              disabled={!name.trim()} 
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}