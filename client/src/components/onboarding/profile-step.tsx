
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Upload } from "lucide-react";

export function ProfileStep({ onNext }: { onNext: (data: any) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onNext({ name, bio, image });
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <h2 className="text-3xl font-semibold text-center">Create Your Profile</h2>
      
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <p className="text-sm text-muted-foreground">Upload a profile photo</p>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Write a short bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="h-24"
        />
      </div>

      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => onNext({})}>Skip</Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
