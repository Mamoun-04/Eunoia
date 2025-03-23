import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrySchema, categoryOptions, Entry } from "@shared/schema";
import { MoodSelector } from "./mood-selector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";


type Props = {
  onClose: () => void;
  initialCategory?: string;
  entry?: Entry | null; // Added for editing existing entries, can be null
};

export function JournalEditor({ onClose, initialCategory, entry }: Props) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(entry?.imageUrl || null);
  const [wordCount, setWordCount] = useState<number>(
    entry?.content ? entry.content.trim().split(/\s+/).length : 0
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Update word count when content changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'content' || name === undefined) {
        const content = value.content as string || '';
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        setWordCount(words);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Set local preview for immediate feedback
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setImagePreview(imageDataUrl);
    };
    reader.readAsDataURL(file);
    
    // Upload the file to the server
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const data = await response.json();
      form.setValue("imageUrl", data.url);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    toast({
      title: "Image removed",
      description: "The image has been removed from your entry.",
      variant: "default",
    });
  };

  // Create or update entry mutation
  const entryMutation = useMutation({
    mutationFn: async (data: any) => {
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
      // Check if it's a free user limit error
      const errorMessage = error.message;
      const isLimitError = 
        errorMessage.includes("Free users") && 
        (
          errorMessage.includes("entries per day") || 
          errorMessage.includes("words per entry") ||
          errorMessage.includes("image per day")
        );
      
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
                  // Here we would open the subscription dialog
                  // You could implement a state/context to control this
                  // For simplicity, we'll just show another toast for now
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] p-5 md:p-7 rounded-xl shadow-lg border-0 bg-gradient-to-b from-background to-background/95">
        <h2 className="text-lg font-semibold text-center mb-5 text-primary/90">
          {entry ? "Edit Journal Entry" : "New Journal Entry"}
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => entryMutation.mutate(data))}
            className="space-y-5 overflow-y-auto max-h-[calc(90vh-10rem)] pr-1.5 custom-scrollbar"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Entry title..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling?</FormLabel>
                  <FormControl>
                    <MoodSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Image Upload Field */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview ? (
                        <div className="relative overflow-hidden rounded-lg transition-all group">
                          <div className="aspect-video w-full max-w-full overflow-hidden rounded-lg">
                            <img 
                              src={imagePreview} 
                              alt="Entry preview" 
                              className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 hover:bg-background shadow-sm transition-all"
                            onClick={removeImage}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 md:p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              // Create a synthetic event object with the file
                              const syntheticEvent = {
                                target: {
                                  files: e.dataTransfer.files
                                }
                              } as React.ChangeEvent<HTMLInputElement>;
                              
                              handleImageUpload(syntheticEvent);
                            }
                          }}
                        >
                          <UploadCloud className="h-8 w-8 mx-auto mb-3 text-primary/60 group-hover:text-primary/80 transition-all duration-200 group-hover:scale-110" />
                          <p className="text-sm font-medium group-hover:text-primary/90 transition-colors">Drag and drop or click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1.5 group-hover:text-primary/70 transition-colors">JPG, PNG or GIF (max 5MB)</p>
                        </div>
                      )}
                      <input 
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        // Don't use {...field} as it would override ref and onChange
                        value="" // Reset the value to allow the same file to be selected again
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Your thoughts</FormLabel>
                    <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded-full">
                      {wordCount} / 300 words {wordCount > 300 && 
                        <span className="text-destructive font-semibold"> (Free limit)</span>
                      }
                    </div>
                  </div>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[180px] max-h-[350px] resize-y rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all leading-relaxed"
                      placeholder="Write your thoughts here... What's on your mind today?"
                      style={{ 
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.02)"
                      }}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={entryMutation.isPending}
              >
                {entry ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}