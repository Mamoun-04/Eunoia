import { useState, useEffect, useRef } from 'react';
import { X, Camera, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEntrySchema, categoryOptions, Entry, moodOptions } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Array of writing prompts to cycle through
const WRITING_PROMPTS = [
  "What were the highlights of your day?",
  "What are you feeling grateful for today?",
  "What's something you learned recently?",
  "What's been on your mind lately?",
  "How did you take care of yourself today?",
  "What's a challenge you're currently facing?",
  "What made you smile today?",
  "What are you looking forward to tomorrow?"
];

// Sentence starters to help get the writing flowing
const SENTENCE_STARTERS = [
  "Today, I felt...",
  "I noticed that...",
  "I'm grateful for...",
  "I wonder why...",
  "It surprised me when...",
  "The best part was...",
  "I'm hoping to..."
];

type Props = {
  onClose: () => void;
  initialCategory?: string;
  entry?: Entry | null;
};

export function MinimalistJournalEditor({ onClose, initialCategory, entry }: Props) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(entry?.imageUrl || null);
  const [currentPrompt, setCurrentPrompt] = useState<string>(WRITING_PROMPTS[0]);
  const [progress, setProgress] = useState<number>(0);
  const [sectionTitle, setSectionTitle] = useState<string>("TODAY'S REFLECTIONS");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const form = useForm({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: entry?.title || "",
      content: entry?.content || "",
      mood: entry?.mood || "neutral",
      category: entry?.category || initialCategory || "Daily Reflection",
      imageUrl: entry?.imageUrl || "",
    },
  });

  // Cycle through prompts every few seconds when there's no content yet
  useEffect(() => {
    if (form.getValues('content')) return;
    
    const interval = setInterval(() => {
      const currentIndex = WRITING_PROMPTS.indexOf(currentPrompt);
      const nextIndex = (currentIndex + 1) % WRITING_PROMPTS.length;
      setCurrentPrompt(WRITING_PROMPTS[nextIndex]);
      
      // Also cycle through section titles based on the prompt
      if (nextIndex === 0) setSectionTitle("TODAY'S REFLECTIONS");
      else if (nextIndex === 1) setSectionTitle("GRATITUDE");
      else if (nextIndex === 2) setSectionTitle("LEARNING & GROWTH");
      else if (nextIndex === 3) setSectionTitle("THOUGHTS & FEELINGS");
      else if (nextIndex === 4) setSectionTitle("SELF-CARE");
      else if (nextIndex === 5) setSectionTitle("CHALLENGES");
      else if (nextIndex === 6) setSectionTitle("MOMENTS OF JOY");
      else setSectionTitle("LOOKING AHEAD");
      
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentPrompt, form]);

  // Update progress bar based on content length
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'content' || name === undefined) {
        const content = value.content as string || '';
        // Consider "complete" at 100 characters, scale accordingly
        const newProgress = Math.min(content.length / 100, 1) * 100;
        setProgress(newProgress);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 5) {
      toast({
        title: "Image too large",
        description: `Your image is ${fileSizeMB.toFixed(1)}MB. Please select an image smaller than 5MB.`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setImagePreview(imageDataUrl);
      form.setValue("imageUrl", imageDataUrl);
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };

  // Add a sentence starter to the current content
  const addSentenceStarter = (starter: string) => {
    const currentContent = form.getValues('content');
    const newContent = currentContent 
      ? `${currentContent}\n\n${starter} ` 
      : `${starter} `;
    
    form.setValue('content', newContent);
    
    // Focus the textarea and place cursor at the end
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = newContent.length;
      textareaRef.current.selectionEnd = newContent.length;
    }
  };

  // AI assistance function
  const getAIAssistance = () => {
    // This would eventually connect to an AI service
    // For now, just add a placeholder prompt
    const starters = [
      "Perhaps you could expand on...",
      "Have you considered...",
      "Another perspective might be...",
      "It might be interesting to explore...",
      "This reminds me of the concept of..."
    ];
    
    const randomStarter = starters[Math.floor(Math.random() * starters.length)];
    addSentenceStarter(randomStarter);
    
    toast({
      title: "AI Assistance",
      description: "We've added a prompt to help continue your thoughts.",
    });
  };

  // Submit entry
  const entryMutation = useMutation({
    mutationFn: async (data: any) => {
      // Generate a title if none provided
      if (!data.title) {
        const content = data.content;
        const firstLine = content.split('\n')[0].trim();
        data.title = firstLine.length > 30 
          ? firstLine.substring(0, 30) + '...' 
          : firstLine;
      }
      
      // If we have an existing entry, update it
      if (entry) {
        const res = await apiRequest("PATCH", `/api/entries/${entry.id}`, data);
        return res.json();
      } else {
        // Otherwise create a new one
        const res = await apiRequest("POST", "/api/entries", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: entry ? "Entry updated" : "Entry saved",
        description: entry 
          ? "Your journal entry has been updated successfully." 
          : "Your journal entry has been saved successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: entry ? "Failed to update entry" : "Failed to save entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[600px] min-h-[100dvh] sm:h-[90vh] mx-0 sm:mx-4 rounded-none sm:rounded-xl border-0 overflow-hidden bg-gradient-to-b from-[#fcfbf9] to-[#f8f7f2]"
        aria-describedby="journal-editor-description"
      >
        <h2 id="journal-dialog-title" className="sr-only">Journal Entry Editor</h2>
        <p id="journal-editor-description" className="sr-only">Create or edit your journal entry with this editor.</p>
        
        <div className="journal-interface custom-scrollbar overflow-y-auto">
          {/* Progress Bar */}
          <div className="journal-progress">
            <div className="journal-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          
          {/* Section Title */}
          <div className="section-title">
            {sectionTitle}
          </div>
          
          {/* Sentence Starters */}
          <div className="sentence-starters">
            {SENTENCE_STARTERS.map((starter, index) => (
              <button 
                key={index}
                className="sentence-starter"
                onClick={() => addSentenceStarter(starter)}
              >
                {starter}
              </button>
            ))}
          </div>
          
          {/* Journal Entry Textarea */}
          <textarea
            ref={textareaRef}
            className="journal-textarea"
            placeholder="Begin writing here..."
            value={form.getValues('content')}
            onChange={(e) => form.setValue('content', e.target.value)}
            aria-label="Journal entry content"
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-6 rounded-xl overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Journal entry" 
                className="w-full rounded-xl"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-full h-8 w-8"
                onClick={() => {
                  setImagePreview(null);
                  form.setValue("imageUrl", "");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Action Bar */}
          <div className="action-bar">
            <div className="flex space-x-3">
              {/* Camera Button */}
              <button 
                className="action-button"
                onClick={() => fileInputRef.current?.click()}
                data-tooltip="Attach image"
              >
                <Camera className="h-5 w-5" />
                <input 
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  value=""
                />
              </button>
              
              {/* AI Assist Button */}
              <button 
                className="action-button"
                onClick={getAIAssistance}
                data-tooltip="Need a prompt?"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
            
            {/* Submit Button */}
            <button 
              className={cn(
                "submit-button", 
                (!form.getValues('content') || entryMutation.isPending) && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if (form.getValues('content') && !entryMutation.isPending) {
                  entryMutation.mutate(form.getValues());
                }
              }}
              disabled={!form.getValues('content') || entryMutation.isPending}
              data-tooltip="Save entry"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}