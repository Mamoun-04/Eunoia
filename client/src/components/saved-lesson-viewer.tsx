import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from '@tanstack/react-query';
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { SavedLesson } from '@shared/schema';

interface SavedLessonViewerProps {
  savedLesson: SavedLesson;
  onBack: () => void;
}

export function SavedLessonViewer({ savedLesson, onBack }: SavedLessonViewerProps) {
  const [isPinned, setIsPinned] = useState(savedLesson.isPinnedToHome || false);
  const { toast } = useToast();
  
  // Format saved lesson content as sections
  const contentSections = savedLesson.userEntryText.split('\n\n');
  
  // Add mutation for pinning to home
  const pinToHomeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "PATCH", 
        `/api/saved-lessons/${savedLesson.id}/toggle-pin`, 
        {}
      );
      return res;
    },
    onSuccess: () => {
      setIsPinned(!isPinned);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-lessons"] });
      toast({
        title: isPinned ? "Removed from Home" : "Added to Home",
        description: isPinned 
          ? "This entry has been removed from your home dashboard." 
          : "This entry has been added to your home dashboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating this entry.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> 
          Back to Lessons
        </Button>
        
        <Button 
          variant="outline" 
          className={`gap-2 ${isPinned ? 'text-amber-500 border-amber-500' : ''}`}
          onClick={() => pinToHomeMutation.mutate()}
        >
          {isPinned ? (
            <>
              <BookmarkCheck className="h-4 w-4" /> 
              Pinned to Home
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" /> 
              Add to Home
            </>
          )}
        </Button>
      </div>
      
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">{savedLesson.title}</h1>
        
        <div className="text-sm text-muted-foreground mb-8">
          Completed on {new Date(savedLesson.completionTimestamp).toLocaleDateString()} at
          {' '}{new Date(savedLesson.completionTimestamp).toLocaleTimeString()}
        </div>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-8">
            {contentSections.map((section, index) => {
              // Split each section into prompt and answer
              const parts = section.split('\n');
              if (parts.length < 2) return null;
              
              return (
                <div key={index} className="space-y-2">
                  <h3 className="text-md font-medium text-primary">{parts[0]}</h3>
                  <div className="pl-4 border-l-2 border-muted py-1">
                    <p className="whitespace-pre-wrap">{parts.slice(1).join('\n')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}