import { Entry } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
}

const EntryCard = ({ entry, onEdit }: EntryCardProps) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (entry.imageUrl) {
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
  const isVeryWide = dimensions && dimensions.width > dimensions.height * 1.5;
  const cardClasses = entry.imageUrl
    ? `${isVeryWide ? 'col-span-2' : isWide ? 'col-span-2 sm:col-span-1' : ''}`
    : 'h-[200px]';

  return (
    <Card 
      className={`overflow-hidden group cursor-pointer hover:shadow-lg transition-all ${cardClasses}`}
      onClick={() => onEdit(entry)}
    >
      {entry.imageUrl && (
        <AspectRatio ratio={dimensions ? dimensions.width / dimensions.height : 4/3}>
          <img
            ref={imageRef}
            src={entry.imageUrl}
            alt={entry.title}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      )}
      <div className="p-4">
        <h3 className="font-semibold mb-1">{entry.title}</h3>
        <p className="text-sm text-muted-foreground">
          {new Date(entry.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEditEntry} />
      ))}
    </div>
  );
};