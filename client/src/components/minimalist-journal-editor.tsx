import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/use-streak";
import { 
  Textarea
} from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Image, Sparkles, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { InsertEntry, Entry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface MinimalistJournalEditorProps {
  onClose: () => void;
  existingEntry?: Entry;
}

export function MinimalistJournalEditor({ 
  onClose,
  existingEntry
}: MinimalistJournalEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { refreshStreak } = useStreak();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // All users get premium features
  const isPremium = true;
  const WORD_LIMIT = 1000;
  
  // Form state
  const [title, setTitle] = useState(existingEntry?.title || "");
  const [content, setContent] = useState(existingEntry?.content || "");
  const [mood, setMood] = useState(existingEntry?.mood || "neutral");
  const [category, setCategory] = useState(existingEntry?.category || "general");
  const [imageUrl, setImageUrl] = useState(existingEntry?.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived state
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const wordCountProgress = (wordCount / WORD_LIMIT) * 100;
  const isOverLimit = wordCount > WORD_LIMIT;
  const imageSelected = !!imageFile || !!imageUrl;
  
  // Debounced content update to prevent typing lag
  const [debouncedContent, setDebouncedContent] = useState(content);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedContent(content);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [content]);
  
  // Handle image upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Display a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image selection error:", error);
      setErrorMessage("Image selection failed: There was an error selecting your image. Please try again.");
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  // Handle content change with limiting behavior
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    
    // Always update the content to show what user is typing
    setContent(newContent);
    
    // If they're trying to type beyond the limit, warn them
    // We use inline error messages now instead of toast
    // The handleKeyDown function prevents typing beyond the limit anyway
  };
  
  // Handle image upload to server
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("image", imageFile);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      setErrorMessage(error instanceof Error ? `Image upload failed: ${error.message}` : "Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Save the entry
  const saveEntry = async () => {
    try {
      setIsSaving(true);
      
      // Validate title
      if (!title.trim()) {
        setErrorMessage("Title is required. Please provide a title for your entry.");
        return;
      }
      
      // Validate content
      if (!content.trim()) {
        setErrorMessage("Content is required. Please write something in your journal entry.");
        return;
      }
      
      // Check word count limit
      if (wordCount > WORD_LIMIT) {
        setErrorMessage(`Word limit exceeded. Please reduce your entry to ${WORD_LIMIT} words or less.`);
        return;
      }
      
      // Upload image if there's a new one
      let finalImageUrl = imageUrl;
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          
          const data = await response.json();
          finalImageUrl = data.imageUrl;
          
          if (!finalImageUrl) {
            setErrorMessage('Failed to upload image');
            return;
          }
        } catch (error) {
          console.error('Image upload error:', error);
          setErrorMessage('Failed to upload image');
          return;
        }
      }
      
      // Prepare entry data
      const entryData: InsertEntry = {
        title: title.trim(),
        content,
        mood,
        category,
        imageUrl: finalImageUrl || undefined,
      };
      
      // Create or update the entry
      if (existingEntry) {
        // Update existing entry
        await apiRequest("PATCH", `/api/entries/${existingEntry.id}`, entryData);
        // Success is handled by closing the editor - no need for toast
      } else {
        // Create new entry
        await apiRequest("POST", "/api/entries", entryData);
        // Success is handled by closing the editor - no need for toast
      }
      
      // Refresh entries list
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      
      // For new entries, refresh the user streak
      if (!existingEntry) {
        await refreshStreak();
      }
      
      onClose();
    } catch (error) {
      console.error("Save entry error:", error);
      
      // Special handling for 403 Forbidden (daily entry limit or content limit)
      if (error instanceof Error && 'status' in error && (error as any).status === 403) {
        const message = (error as any).data?.message || "You've reached your limit. Upgrade to Premium for more features.";
        // Show modal but don't close the editor
        showPremiumFeatureModal("Entry Limit", message);
        return;
      }
      
      // Show error as an alert in the editor instead of toast
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };
  
  // State for premium feature notification
  const [premiumFeatureAlert, setPremiumFeatureAlert] = useState<{
    feature: string;
    message: string;
    visible: boolean;
  }>({
    feature: "",
    message: "",
    visible: false
  });
  
  // Show premium feature alert for non-premium users
  const showPremiumFeatureModal = (feature: string, message?: string) => {
    setPremiumFeatureAlert({
      feature,
      message: message || "Upgrade to Premium to access this feature",
      visible: true
    });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setPremiumFeatureAlert(prev => ({...prev, visible: false}));
    }, 8000);
  };
  
  // Disable typing when over word limit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If they're at the limit and trying to add more content, block most keys
    if (isOverLimit) {
      // Allow navigation keys, deletion keys, and keyboard shortcuts
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
        'ArrowUp', 'ArrowDown', 'Home', 'End'
      ];
      
      // Allow keyboard shortcuts (Ctrl/Cmd + key)
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      
      // Block typing if not an allowed key
      if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }
  };
  
  // Clear error message when user makes changes
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [title, content, mood, category, imageUrl, errorMessage]);

  return (
    <div className="space-y-4 p-4">
      {/* Sticky top bar with progress and actions */}
      <div className="sticky top-0 z-10 bg-background pt-1 pb-3 -mx-4 px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">
            {existingEntry ? "Edit Entry" : "New Entry"}
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Word count display with color feedback */}
            <span className={`text-sm font-medium ${
              isOverLimit ? 'text-destructive' : 
              wordCount > WORD_LIMIT * 0.9 ? 'text-amber-500' : 
              'text-muted-foreground'
            }`}>
              {wordCount} / {WORD_LIMIT}
            </span>
            
            {/* Save button */}
            <Button 
              onClick={saveEntry} 
              disabled={isSaving || isUploading || isOverLimit || !title.trim() || !content.trim()}
              className="ml-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Word count progress bar */}
        <Progress 
          value={Math.min(wordCountProgress, 100)} 
          className={`h-1 ${
            isOverLimit ? 'bg-destructive/20' : 
            wordCount > WORD_LIMIT * 0.9 ? 'bg-amber-100' : 
            'bg-secondary'
          }`}
        />
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mb-2">
          {errorMessage}
        </div>
      )}
      
      {/* No premium feature alerts needed as all features are available */}
      
      {/* Title input */}
      <div>
        <Input
          placeholder="Entry title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 text-foreground/90"
        />
      </div>
      
      {/* Image upload section (available to all users) */}
      <div className="space-y-2 mb-2">
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-border/60 mb-4">
            <img 
              src={imageUrl} 
              alt="Journal entry" 
              className="w-full h-auto max-h-[220px] object-cover" 
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={(e) => {
                // Prevent event from bubbling up (important)
                e.stopPropagation();
                
                setImageUrl("");
                setImageFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Remove
            </Button>
          </div>
        )}
        
        {!imageUrl && (
          <Button
            type="button"
            variant="outline"
            className="w-full py-6 border-dashed rounded-xl mb-4"
            onClick={(e) => {
              // Prevent the event from bubbling up and potentially closing dialogs
              e.stopPropagation();
              
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <div className="flex flex-col items-center text-muted-foreground">
              <Image className="h-8 w-8 mb-2" />
              <span className="text-sm">
                Add image
              </span>
            </div>
          </Button>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />
      </div>
      
      {/* Main journal text area */}
      <Textarea
        placeholder="Write your thoughts here..."
        value={content}
        onChange={handleContentChange}
        onKeyDown={handleKeyDown}
        className="journal-textarea min-h-[180px] resize-y p-4 text-base leading-relaxed w-full rounded-xl"
      />
    </div>
  );
}