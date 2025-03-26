import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEntrySchema, Entry } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

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
  const [wordLimit, setWordLimit] = useState<number>(250);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState(0);
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

  // Cycle through prompts if no content is present
  useEffect(() => {
    if (form.getValues('content')) return;
    const interval = setInterval(() => {
      const currentIndex = WRITING_PROMPTS.indexOf(currentPrompt);
      const nextIndex = (currentIndex + 1) % WRITING_PROMPTS.length;
      setCurrentPrompt(WRITING_PROMPTS[nextIndex]);
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

  // Check user subscription status
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const user = await response.json();
          setIsPremium(user.subscriptionStatus === 'active');
          setWordLimit(user.subscriptionStatus === 'active' ? 1000 : 250);
        }
      } catch (error) {
        console.error('Failed to fetch user status:', error);
      }
    };
    checkUserStatus();
  }, []);

  // Update progress bar and word count
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'content' || name === undefined) {
        try {
          const content = value.content as string || '';
          const words = content.trim() ? content.trim().split(/\s+/).length : 0;
          setWordCount(words);
          const newProgress = Math.min((words / wordLimit) * 100, 100);
          setProgress(newProgress);
          if (words >= wordLimit) {
            const allWords = content.trim().split(/\s+/);
            const limitedContent = allWords.slice(0, wordLimit).join(' ');
            form.setValue('content', limitedContent);
            toast({
              title: "Word limit reached",
              description: isPremium 
                ? "You've reached the maximum word count of 1000 words."
                : "You've reached the free limit of 250 words. Upgrade to Premium for up to 1000 words.",
              variant: "destructive",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error in form watch handler:", error);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, wordLimit, isPremium, toast]);

  // Adjust initial textarea height
  useEffect(() => {
    if (textareaRef.current && form.getValues('content')) {
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Handle image upload without closing the editor
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any default behavior and stop event propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Store the file immediately and reset the input to ensure proper behavior on repeated uploads
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: (
          <div className="space-y-2">
            <p>Image uploads are available to Premium users only.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Upgrade to Premium",
                  description: "Unlock unlimited entries, images, and word count!",
                });
              }}
            >
              Upgrade to Premium
            </Button>
          </div>
        ),
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 5) {
      toast({
        title: "Image too large",
        description: `Your image is ${fileSizeMB.toFixed(1)}MB. Please select an image smaller than 5MB.`,
        variant: "destructive",
      });
      return;
    }
    
    // Set image preview first for immediate feedback
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        setImagePreview(imageDataUrl);
      };
      reader.readAsDataURL(file);
    } catch (readerError) {
      console.error("Error reading file:", readerError);
      toast({
        title: "Preview failed",
        description: "Could not generate a preview for this image.",
        variant: "destructive",
      });
    }
    
    // Then upload the image to the server
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use a Promise with setTimeout to ensure the state updates properly
      const uploadPromise = new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
              reject(new Error(errorData.message || `Server error: ${response.status}`));
              return;
            }
            
            const data = await response.json();
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }, 50);
      });
      
      const data = await uploadPromise as { url: string };
      if (data && data.url) {
        form.setValue("imageUrl", data.url, { 
          shouldDirty: true,
          shouldTouch: true 
        });
        
        toast({
          title: "Image uploaded",
          description: "Your image has been successfully uploaded.",
          duration: 3000,
        });
      } else {
        throw new Error('Invalid server response');
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      toast({
        title: "Upload failed",
        description: uploadError instanceof Error ? uploadError.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Stop propagation on file input focus and blur to prevent unintended closure
  const handleFileInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleFileInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const addSentenceStarter = (starter: string) => {
    const currentContent = form.getValues('content');
    const newContent = currentContent ? `${currentContent}\n\n${starter} ` : `${starter} `;
    form.setValue('content', newContent);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = newContent.length;
      textareaRef.current.selectionEnd = newContent.length;
    }
  };

  const getAIAssistance = () => {
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

  // Save entry without auto-closing the editor
  const entryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!data.title) {
        const firstLine = data.content.split('\n')[0].trim();
        data.title = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
      }
      if (entry) {
        const res = await apiRequest("PATCH", `/api/entries/${entry.id}`, data);
        return res.json();
      } else {
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
      // Do not auto-close; let the user close manually
    },
    onError: (error: Error) => {
      const errorMessage = error.message;
      const isLimitError = errorMessage.includes("Free users") && 
        (errorMessage.includes("entries per day") || errorMessage.includes("words per entry") || errorMessage.includes("image per day"));
      if (isLimitError) {
        toast({
          title: "Premium Feature",
          description: (
            <div className="space-y-2">
              <p>{errorMessage}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => {
                  toast({
                    title: "Upgrade to Premium",
                    description: "Unlock unlimited entries, images, and word count!",
                  });
                }}
              >
                Upgrade to Premium
              </Button>
            </div>
          ),
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: entry ? "Failed to update entry" : "Failed to save entry",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  return (
    // Use hardcoded open={true} and empty onOpenChange to maintain control over dialog visibility
    <Dialog open={true} modal={true} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[min(600px,90vw)] min-h-[100dvh] sm:min-h-0 sm:max-h-[90vh] mx-0 sm:mx-auto rounded-none sm:rounded-[1.25rem] border-0 overflow-hidden bg-gradient-to-b from-[#fcfbf9] to-[#f8f7f2] p-4 sm:p-6 shadow-lg"
        aria-describedby="journal-editor-description"
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing when clicking outside
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent ESC key from closing
      >
        <h2 id="journal-dialog-title" className="sr-only">Journal Entry Editor</h2>
        <p id="journal-editor-description" className="sr-only">
          Create or edit your journal entry with this editor.
        </p>

        {/* Explicit Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="journal-interface custom-scrollbar overflow-y-auto max-h-[calc(100vh-4rem)] sm:max-h-[calc(90vh-4rem)]">
          {/* Progress Bar */}
          <div className="journal-progress">
            <div className="journal-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Entry Title"
              className="w-full text-xl font-medium bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              {...form.register("title")}
            />
          </div>

          {/* Word Count */}
          <div className="flex justify-end mb-4">
            <div className="text-xs text-muted-foreground/80 font-medium bg-background/40 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              {wordCount} / {wordLimit} words 
              {!isPremium && wordCount >= wordLimit * 0.9 && (
                <span className="text-destructive font-semibold"> (Free limit)</span>
              )}
            </div>
          </div>

          {/* Sentence Starters */}
          <div className="sentence-starters-container">
            <div className="sentence-starters">
              {['Today I felt...', "I'm grateful for...", 'Looking forward to...'].map((starter, index) => (
                <motion.button 
                  key={index}
                  className="sentence-starter"
                  onClick={() => addSentenceStarter(starter)}
                  whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.3 } }}
                >
                  {starter}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Journal Entry Textarea */}
          <textarea
            className="journal-textarea"
            placeholder="Begin writing here..."
            {...form.register('content', {
              onChange: (e) => {
                if (wordCount < wordLimit || isPremium) {
                  form.setValue('content', e.target.value);
                } else if (e.target.value.length < form.getValues('content').length) {
                  form.setValue('content', e.target.value);
                }
                if (e.target) {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }
              }
            })}
            aria-label="Journal entry content"
            ref={textareaRef}
          />

          {/* Image Preview */}
          {imagePreview && (
            <motion.div 
              className="relative mb-6 rounded-xl overflow-hidden shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full">
                <img 
                  src={imagePreview} 
                  alt="Journal entry" 
                  className="w-full rounded-lg object-contain max-h-[60vh]"
                />
              </div>
              <motion.div whileHover={{ scale: 1.1 }} className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-primary/20 hover:bg-primary/30 text-primary rounded-full h-8 w-8 shadow-sm backdrop-blur-sm"
                  onClick={() => {
                    setImagePreview(null);
                    form.setValue("imageUrl", "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Action Bar */}
          <motion.div 
            className="action-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex space-x-3">
              {/* Camera Button */}
              <motion.button 
                type="button"
                className="action-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                data-tooltip="Attach image"
                whileHover={{ scale: 1.08, y: -2, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-5 w-5" />
                <input 
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleImageUpload(e);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onFocus={handleFileInputFocus}
                  onBlur={handleFileInputBlur}
                  className="hidden"
                  value=""
                />
              </motion.button>

              {/* AI Assistance Button */}
              <motion.button 
                className="action-button"
                onClick={getAIAssistance}
                data-tooltip="Need a prompt?"
                whileHover={{ scale: 1.08, y: -2, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Submit Button */}
            <motion.button 
              className={cn(
                "submit-button", 
                (!form.getValues('content') || entryMutation.isPending) && "opacity-50 cursor-not-allowed"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (form.getValues('content') && !entryMutation.isPending) {
                  entryMutation.mutate(form.getValues());
                }
              }}
              disabled={!form.getValues('content') || entryMutation.isPending}
              data-tooltip="Save entry"
              whileHover={form.getValues('content') && !entryMutation.isPending ? { scale: 1.08, y: -2, transition: { duration: 0.2 } } : {}}
              whileTap={form.getValues('content') && !entryMutation.isPending ? { scale: 0.95 } : {}}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}