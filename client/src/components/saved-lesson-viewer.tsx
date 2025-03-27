import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from 'lucide-react';
import { SavedLesson } from '@shared/schema';

interface SavedLessonViewerProps {
  savedLesson: SavedLesson;
  onBack: () => void;
}

export function SavedLessonViewer({ savedLesson, onBack }: SavedLessonViewerProps) {
  // Format saved lesson content as sections
  const contentSections = savedLesson.userEntryText.split('\n\n');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> 
          Back to Lessons
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