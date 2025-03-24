
import { Entry } from "@shared/schema";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "./ui/button";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
}

const EntryCard = ({ entry, onEdit }: EntryCardProps) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (entry.imageUrl && imageRef.current) {
      const img = new Image();
      img.src = entry.imageUrl;
      img.onload = () => {
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
    }
  }, [entry.imageUrl]);

  const isWide = dimensions && dimensions.width > dimensions.height;
  const hasImage = Boolean(entry.imageUrl);

  return (
    <div 
      className={`group relative bg-card rounded-xl overflow-hidden border transition-shadow hover:shadow-lg
        ${hasImage ? (isWide ? 'col-span-2' : 'col-span-1') : 'col-span-1'}
        ${hasImage ? 'row-span-2' : 'row-span-1'}`}
    >
      {hasImage ? (
        <>
          <div className="relative overflow-hidden aspect-[3/4]">
            <img 
              ref={imageRef}
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
                  onEdit(entry);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium line-clamp-1">{entry.title}</h3>
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(entry.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </>
      ) : (
        <div className="p-5 flex flex-col h-full">
          <div className="flex-grow">
            <h3 className="text-lg font-medium line-clamp-2 mb-2">
              {entry.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {entry.content}
            </p>
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
                onEdit(entry);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const EntryMasonryGrid = ({ 
  entries,
  onEditEntry
}: { 
  entries: Entry[];
  onEditEntry: (entry: Entry) => void;
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEditEntry} />
      ))}
    </div>
  );
};
