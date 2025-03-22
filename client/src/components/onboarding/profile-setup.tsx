import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';

export default function ProfileSetup() {
  const { data, updateData, setStep } = useOnboarding();
  const [name, setName] = useState(data.name || '');
  const [bio, setBio] = useState(data.bio || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.profilePhoto || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setPhotoPreview(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    updateData({
      name,
      bio,
      profilePhoto: photoPreview || undefined
    });
    setStep(3);
  };

  const handleSkip = () => {
    setStep(3);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto shadow-sm"
    >
      <h2 className="text-3xl font-serif font-bold mb-6 text-center">Tell us about yourself</h2>
      
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4 relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={photoPreview || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {name ? getInitials(name) : <User />}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute -bottom-2 -right-2">
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="bg-primary text-primary-foreground rounded-full p-2">
                <Upload size={16} />
              </div>
            </Label>
            <Input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Upload a profile photo
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea
            id="bio"
            placeholder="Tell us a little about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="resize-none h-24"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={handleSkip}>
          Skip
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}