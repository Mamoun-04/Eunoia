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
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";


type Props = {
  onClose: () => void;
  initialCategory?: string;
  entry?: Entry | null; // Added for editing existing entries, can be null
};

export function JournalEditor({ onClose, initialCategory, entry }: Props) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(entry?.imageUrl || null);
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
      
      toast({
        title: "Image uploaded",
        description: "Your image has been added to the entry.",
        variant: "default",
      });
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
      toast({
        title: entry ? "Failed to update entry" : "Failed to save entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-4 md:p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => entryMutation.mutate(data))}
            className="space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)] pr-1"
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
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 md:p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Click to upload an image</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max 5MB)</p>
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
                  <FormLabel>Your thoughts</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[150px] max-h-[300px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                      placeholder="Write your thoughts here..."
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