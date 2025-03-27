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
import { motion } from 'framer-motion';

// Writing prompts to help users
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

// Sentence starters
const SENTENCE_STARTERS = [
  "Today, I felt...",
  "I noticed that...",
  "I'm grateful for...",
  "I wonder why...",
  "It surprised me when...",
  "The best part was...",
  "I'm hoping to..."
];

type JournalEditorProps = {
  onClose: () => void;
  initialCategory?: string;
  entry?: Entry | null;
};

export function StableJournalEditor({ onClose, initialCategory, entry }: JournalEditorProps) {
  // Editor state
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(entry?.imageUrl || null);
  const [currentPrompt, setCurrentPrompt] = useState<string>(WRITING_PROMPTS[0]);
  const [progress, setProgress] = useState<number>(0);
  const [sectionTitle, setSectionTitle] = useState<string>("TODAY'S REFLECTIONS");
  const [wordLimit, setWordLimit] = useState<number>(250);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState(0);
  
  // Refs for DOM elements
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // Set up form with validation
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
      
      // Update section title based on prompt
      switch(nextIndex) {
        case 0: setSectionTitle("TODAY'S REFLECTIONS"); break;
        case 1: setSectionTitle("GRATITUDE"); break;
        case 2: setSectionTitle("LEARNING & GROWTH"); break;
        case 3: setSectionTitle("THOUGHTS & FEELINGS"); break;
        case 4: setSectionTitle("SELF-CARE"); break;
        case 5: setSectionTitle("CHALLENGES"); break;
        case 6: setSectionTitle("MOMENTS OF JOY"); break;
        case 7: setSectionTitle("LOOKING AHEAD"); break;
        default: setSectionTitle("TODAY'S REFLECTIONS");
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentPrompt]);

  // Check user subscription status - once at component mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const user = await response.json();
          const isPremiumUser = user.subscriptionPlan === 'monthly' || user.subscriptionPlan === 'yearly';
          setIsPremium(isPremiumUser);
          setWordLimit(isPremiumUser ? 1000 : 250);
        }
      } catch (error) {
        console.error('Failed to fetch user status:', error);
      }
    };
    checkUserStatus();
  }, []);

  // Calculate word count separately from form watch to prevent re-renders
  useEffect(() => {
    // Calculate word count from content
    const calculateWordCount = () => {
      const content = form.getValues('content') || '';
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      setWordCount(words);
      
      const newProgress = Math.min((words / wordLimit) * 100, 100);
      setProgress(newProgress);
    };

    // Set up interval to update word count without watching form
    const wordCountInterval = setInterval(calculateWordCount, 500);
    
    // Initial calculation
    calculateWordCount();
    
    return () => clearInterval(wordCountInterval);
  }, [wordLimit]);

  // Adjust initial textarea height
  useEffect(() => {
    if (textareaRef.current && form.getValues('content')) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Prevent clicks inside the editor from bubbling up
  useEffect(() => {
    const stopPropagation = (e: MouseEvent | TouchEvent | KeyboardEvent) => {
      e.stopPropagation();
    };

    const preventEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add event listeners to the editor container
    const containerElement = editorContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener('click', stopPropagation);
      containerElement.addEventListener('mousedown', stopPropagation);
      containerElement.addEventListener('touchstart', stopPropagation);
      containerElement.addEventListener('keydown', preventEscape, true);
    }

    // Clean up on unmount
    return () => {
      if (containerElement) {
        containerElement.removeEventListener('click', stopPropagation);
        containerElement.removeEventListener('mousedown', stopPropagation);
        containerElement.removeEventListener('touchstart', stopPropagation);
        containerElement.removeEventListener('keydown', preventEscape, true);
      }
    };
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the file
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
                e.preventDefault();
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 5) {
      toast({
        title: "Image too large",
        description: `Your image is ${fileSizeMB.toFixed(1)}MB. Please select an image smaller than 5MB.`,
        variant: "destructive",
      });
      return;
    }

    // Show preview immediately
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imageDataUrl = event.target?.result as string;
          setImagePreview(imageDataUrl);
        } catch (previewError) {
          console.error("Failed to set image preview:", previewError);
        }
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

    // Upload the image
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
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
    }, 50); // Small delay to ensure UI updates first
  };

  // Add a sentence starter to the content
  const addSentenceStarter = (starter: string) => {
    const currentContent = form.getValues('content');
    const newContent = currentContent ? `${currentContent}\n\n${starter} ` : `${starter} `;
    form.setValue('content', newContent);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = newContent.length;
      textareaRef.current.selectionEnd = newContent.length;
      
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Get AI assistance
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

  // Save entry mutation
  const entryMutation = useMutation({
    mutationFn: async (data: any) => {
      // Auto-generate title if none is provided
      if (!data.title) {
        const firstLine = data.content.split('\n')[0].trim();
        data.title = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
      }
      
      // Update existing entry or create new one
      if (entry) {
        const res = await apiRequest("PATCH", `/api/entries/${entry.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/entries", data);
        return res.json();
      }
    },
    onSuccess: () => {
      // Refresh entries list
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      
      toast({
        title: entry ? "Entry updated" : "Entry saved",
        description: entry 
          ? "Your journal entry has been updated successfully." 
          : "Your journal entry has been saved successfully.",
      });
      
      // Let the user close manually instead of auto-closing
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

  // Handle content change and auto-resize with better word limit handling
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    
    try {
      const newValue = e.target.value;
      const currentValue = form.getValues('content');
      
      // Always allow deletions (backspace/cut operations)
      if (newValue.length <= currentValue.length) {
        form.setValue('content', newValue);
      } else {
        // For additions, check word limit
        const words = newValue.trim().split(/\s+/).length;
        
        if (isPremium) {
          // Premium users: limit at 1000 words
          if (words <= 1000) {
            form.setValue('content', newValue);
          } else if (words > 1000 && currentValue.split(/\s+/).length !== 1000) {
            // Show toast only once when the limit is first reached
            toast({
              title: "Word limit reached",
              description: "You've reached the maximum word count of 1000 words.",
              variant: "destructive",
              duration: 3000,
            });
          }
        } else {
          // Free users: limit at 250 words
          if (words <= 250) {
            form.setValue('content', newValue);
          } else if (words > 250 && currentValue.split(/\s+/).length !== 250) {
            // Show toast only once when the limit is first reached
            toast({
              title: "Free account limit reached",
              description: "You've reached the free limit of 250 words. Upgrade to Premium for up to 1000 words.",
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      }
      
      // Auto-resize textarea
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    } catch (error) {
      console.error("Error in textarea onChange:", error);
    }
  };

  // Confirm before closing
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const hasContent = !!form.getValues('content') || !!form.getValues('title');
    
    if (hasContent) {
      const confirmed = window.confirm("Are you sure you want to close? Any unsaved changes will be lost.");
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    // Modal container with event capture
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center" 
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={handleCloseClick}></div>
      
      {/* Editor container */}
      <div 
        ref={editorContainerRef}
        className="sm:max-w-[min(600px,90vw)] min-h-[100dvh] sm:min-h-0 sm:max-h-[90vh] mx-0 sm:mx-auto 
                  rounded-none sm:rounded-[1.25rem] border-0 overflow-hidden bg-gradient-to-b 
                  from-[#fcfbf9] to-[#f8f7f2] p-4 sm:p-6 shadow-lg fixed z-50 grid w-full 
                  gap-4 border bg-background duration-200"
        aria-describedby="journal-editor-description"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="journal-dialog-title" className="sr-only">Journal Entry Editor</h2>
        <p id="journal-editor-description" className="sr-only">
          Create or edit your journal entry with this editor.
        </p>
        
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-8 w-8 bg-background/80 
                    backdrop-blur-sm rounded-full"
          onClick={handleCloseClick}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Editor Content */}
        <div className="journal-interface custom-scrollbar overflow-y-auto max-h-[calc(100vh-4rem)] sm:max-h-[calc(90vh-4rem)]">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Entry Title"
              className="w-full text-xl font-medium bg-transparent border-none focus:outline-none 
                        focus:ring-0 placeholder:text-muted-foreground/50"
              value={form.getValues('title')}
              onChange={(e) => form.setValue('title', e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Word Count */}
          <div className="flex justify-end mb-4">
            <div className="text-xs text-muted-foreground/80 font-medium bg-background/40 
                          backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              {wordCount} / {wordLimit} words 
              {!isPremium && wordCount >= wordLimit * 0.9 && (
                <span className="text-destructive font-semibold"> (Free limit)</span>
              )}
            </div>
          </div>
          
          {/* Sentence Starters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Today I felt...', "I'm grateful for...", 'Looking forward to...'].map((starter, index) => (
              <motion.button 
                key={index}
                className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary 
                          hover:bg-primary/20 transition-all shadow-sm"
                onClick={() => addSentenceStarter(starter)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.3 } }}
              >
                {starter}
              </motion.button>
            ))}
          </div>
          
          {/* Journal Entry Textarea */}
          <textarea
            className="w-full min-h-[200px] p-3 mb-6 bg-white/60 rounded-xl border border-gray-200 
                      placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/50 
                      text-gray-700 resize-none transition-all duration-300"
            placeholder={currentPrompt}
            value={form.getValues('content')}
            onChange={handleContentChange}
            onClick={(e) => e.stopPropagation()}
            ref={textareaRef}
            aria-label="Journal entry content"
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
                  className="bg-primary/20 hover:bg-primary/30 text-primary rounded-full h-8 w-8 
                            shadow-sm backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
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
            className="flex justify-between items-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex space-x-3">
              {/* Camera Button */}
              <motion.button 
                type="button"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-5 w-5" />
                <input 
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="hidden"
                  value=""
                />
              </motion.button>
              
              {/* AI Assistance Button */}
              <motion.button 
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  getAIAssistance();
                }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.button>
            </div>
            
            {/* Submit Button */}
            <motion.button 
              className={cn(
                "px-4 py-2 rounded-full bg-primary text-white flex items-center gap-2", 
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
              whileHover={form.getValues('content') && !entryMutation.isPending ? { scale: 1.05 } : {}}
              whileTap={form.getValues('content') && !entryMutation.isPending ? { scale: 0.98 } : {}}
            >
              {entryMutation.isPending ? "Saving..." : "Save"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}