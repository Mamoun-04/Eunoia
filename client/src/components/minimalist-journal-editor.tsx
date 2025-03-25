import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrySchema, Entry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";

type Props = {
  onClose: () => void;
  initialCategory?: string;
  entry?: Entry | null;
};

export function MinimalistJournalEditor({ onClose, initialCategory, entry }: Props) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(entry?.imageUrl || null);
  const [wordLimit, setWordLimit] = useState<number>(250);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<string>(entry?.content || "");

  // Removed cycling prompts and mood field
  const form = useForm({
    resolver: zodResolver(insertEntrySchema),
    defaultValues: {
      title: entry?.title || "",
      content: entry?.content || "",
      category: entry?.category || initialCategory || "Daily Reflection",
      imageUrl: entry?.imageUrl || "",
    },
  });

  const wordCountMemo = useMemo(() => {
    const content = form.getValues("content");
    return content ? content.trim().split(/\s+/).filter((word) => word.length > 0).length : 0;
  }, [form.getValues("content")]);

  // Check user subscription status and adjust word limit
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("/api/user", { credentials: "include" });
        if (response.ok) {
          const user = await response.json();
          setIsPremium(user.subscriptionStatus === "active");
          setWordLimit(user.subscriptionStatus === "active" ? 1000 : 250);
        }
      } catch (error) {
        console.error("Failed to fetch user status:", error);
      }
    };
    checkUserStatus();
  }, []);

  // Update word count and auto-resize textarea on content changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "content" || name === undefined) {
        const content = (value.content as string) || "";
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        setWordCount(words);

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Initialize textarea height on mount
  useEffect(() => {
    if (textareaRef.current && form.getValues("content")) {
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Handle image upload without closing the editor
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
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

    // Set local preview for immediate feedback
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setImagePreview(imageDataUrl);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Image upload failed");
      const data = await response.json();
      form.setValue("imageUrl", data.url);
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add a sentence starter to the content
  const addSentenceStarter = (starter: string) => {
    const currentContent = form.getValues("content");
    const newContent = currentContent
      ? `${currentContent}\n\n${starter} `
      : `${starter} `;
    form.setValue("content", newContent);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = newContent.length;
      textareaRef.current.selectionEnd = newContent.length;
    }
  };

  // Submit entry mutation
  const entryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!data.title) {
        const content = data.content;
        const firstLine = content.split("\n")[0].trim();
        data.title = firstLine.length > 30 ? firstLine.substring(0, 30) + "..." : firstLine;
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
    <Dialog
      open
      onOpenChange={() => {}} // Disable auto-closing
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
    >
      <DialogContent
        className="sm:max-w-[min(600px,90vw)] min-h-[100dvh] sm:min-h-0 sm:max-h-[90vh] mx-0 sm:mx-auto rounded-none sm:rounded-[1.25rem] border-0 overflow-hidden bg-gradient-to-b from-[#fcfbf9] to-[#f8f7f2] p-4 sm:p-6 shadow-lg"
        aria-describedby="journal-editor-description"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="journal-dialog-title" className="sr-only">
          Journal Entry Editor
        </h2>
        <p id="journal-editor-description" className="sr-only">
          Create or edit your journal entry with this editor.
        </p>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="journal-interface custom-scrollbar overflow-y-auto max-h-[calc(100vh-4rem)] sm:max-h-[calc(90vh-4rem)]">
          {/* Progress Bar */}
          <div className="journal-progress">
            <div
              className="journal-progress-bar"
              style={{ width: wordLimit ? `${Math.min((wordCount / wordLimit) * 100, 100)}%` : "0%" }}
            ></div>
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
              {wordCount} / {wordLimit} words{" "}
              {!isPremium && wordCount >= wordLimit * 0.9 && (
                <span className="text-destructive font-semibold"> (Free limit)</span>
              )}
            </div>
          </div>

          {/* Sentence Starters */}
          <div className="sentence-starters-container">
            <div className="sentence-starters">
              {["Today I felt...", "I'm grateful for...", "Looking forward to..."].map(
                (starter, index) => (
                  <motion.button
                    key={index}
                    className="sentence-starter"
                    onClick={() => addSentenceStarter(starter)}
                    whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.05, duration: 0.3 },
                    }}
                  >
                    {starter}
                  </motion.button>
                )
              )}
            </div>
          </div>

          {/* Journal Entry Textarea */}
          <textarea
            ref={textareaRef}
            className="journal-textarea"
            placeholder="Begin writing here..."
            {...form.register("content", {
              onChange: (e) => {
                const newValue = e.target.value;
                const newWords = newValue.trim() ? newValue.trim().split(/\s+/).length : 0;
                if (newWords <= wordLimit || newValue.length < contentRef.current.length || isPremium) {
                  form.setValue("content", newValue);
                  contentRef.current = newValue;
                } else {
                  toast({
                    title: "Word limit reached",
                    description: isPremium
                      ? "You've reached the maximum word count of 1000 words."
                      : "You've reached the free limit of 250 words. Upgrade to Premium for up to 1000 words.",
                    variant: "destructive",
                    duration: 5000,
                  });
                }
              },
            })}
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
                onClick={(e: React.MouseEvent) => {
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
                  onChange={handleImageUpload}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden"
                />
              </motion.button>
            </div>

            {/* Submit Button */}
            <motion.button
              className={cn(
                "submit-button",
                (!form.getValues("content") || entryMutation.isPending) && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                if (form.getValues("content") && !entryMutation.isPending) {
                  entryMutation.mutate(form.getValues());
                }
              }}
              disabled={!form.getValues("content") || entryMutation.isPending}
              data-tooltip="Save entry"
              whileHover={
                form.getValues("content") && !entryMutation.isPending
                  ? { scale: 1.08, y: -2, transition: { duration: 0.2 } }
                  : {}
              }
              whileTap={
                form.getValues("content") && !entryMutation.isPending ? { scale: 0.95 } : {}
              }
            >
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
