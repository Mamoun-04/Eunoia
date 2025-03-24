import { Entry } from "@shared/schema";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import Masonry from "react-masonry-css";
import clsx from "clsx";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
}

function EntryCard({ entry, onEdit }: EntryCardProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const cardClasses = clsx(
    "overflow-hidden group cursor-pointer hover:shadow-lg transition-all",
    "mb-4" // margin bottom so cards don't overlap in the same column
  );

  return (
    <Card className={cardClasses} onClick={() => onEdit(entry)}>
      {entry.imageUrl && (
        <img
          src={entry.imageUrl}
          alt={entry.title}
          onLoad={handleImageLoad}
          className="w-full h-auto" // Preserves natural aspect ratio
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold mb-1">{entry.title}</h3>
        <p className="text-sm text-muted-foreground">
          {new Date(entry.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}

interface EntryMasonryGridProps {
  entries: Entry[];
  onEditEntry: (entry: Entry) => void;
}

export function EntryMasonryGrid({ entries, onEditEntry }: EntryMasonryGridProps) {
  // Define responsive breakpoints for columns
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid flex -ml-4 w-auto"
      columnClassName="my-masonry-grid_column pl-4 bg-clip-padding"
    >
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEditEntry} />
      ))}
    </Masonry>
  );
}