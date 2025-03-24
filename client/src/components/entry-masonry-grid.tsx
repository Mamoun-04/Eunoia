import { useState } from "react";
import Masonry from "react-masonry-css";
import { Entry } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import { MoodSelector } from "@/components/mood-selector";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EntryMasonryGridProps = {
  entries: Entry[];
  onEntryClick: (entryId: number) => void;
  onEditClick: (entry: Entry) => void;
  className?: string;
};

export function EntryMasonryGrid({ 
  entries, 
  onEntryClick, 
  onEditClick, 
  className 
}: EntryMasonryGridProps) {
  // Responsive breakpoints for the masonry grid
  const breakpointColumnsObj = {
    default: 4,    // 4 columns on large desktop
    1536: 4,       // 4 columns on large desktop
    1280: 3,       // 3 columns on desktop
    1024: 3,       // 3 columns on small desktop
    768: 2,        // 2 columns on tablet
    640: 2,        // 2 columns on small tablet
    480: 1,        // 1 column on mobile
  };

  return (
    <div className={className}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onClick={() => onEntryClick(entry.id)}
            onEditClick={() => onEditClick(entry)}
          />
        ))}
      </Masonry>
    </div>
  );
}

type EntryCardProps = {
  entry: Entry;
  onClick: () => void;
  onEditClick: () => void;
};

function EntryCard({ entry, onClick, onEditClick }: EntryCardProps) {
  // Calculate the excerpt length based on whether there's an image
  const excerptLength = entry.imageUrl ? 100 : 150;
  
  // Create a short excerpt from the content
  const createExcerpt = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Style classes for the card based on whether it has an image
  const cardClasses = cn(
    "overflow-hidden border border-border/40 hover:border-primary/20 hover:shadow-md",
    "transition-all duration-300 cursor-pointer group rounded-xl mb-4",
    "flex flex-col h-full"
  );

  return (
    <Card
      className={cardClasses}
      onClick={onClick}
    >
      {entry.imageUrl ? (
        <>
          {/* Card with image */}
          <div className="relative overflow-hidden rounded-t-xl aspect-video">
            <img 
              src={entry.imageUrl} 
              alt={entry.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <Button 
                size="icon" 
                variant="ghost"
                className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium line-clamp-1">
                  {entry.title}
                </h3>
                <MoodSelector value={entry.mood} readonly />
              </div>
              {entry.content && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                  {createExcerpt(entry.content, excerptLength)}
                </p>
              )}
              <Badge variant="outline" className="mt-1">
                {entry.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {format(new Date(entry.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Card without image */}
          <div className="p-5 flex-grow flex flex-col h-full">
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium line-clamp-2">
                  {entry.title}
                </h3>
                <MoodSelector value={entry.mood} readonly />
              </div>
              {entry.content && (
                <p className="text-sm text-muted-foreground line-clamp-4 mb-2">
                  {createExcerpt(entry.content, excerptLength)}
                </p>
              )}
              <Badge variant="outline" className="mt-1">
                {entry.category}
              </Badge>
            </div>
            <div className="flex justify-between items-end mt-4">
              <p className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
              </p>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}