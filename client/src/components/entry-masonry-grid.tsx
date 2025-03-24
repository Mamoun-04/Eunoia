import { Entry } from "@shared/schema";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import Masonry from "react-masonry-css";
import clsx from "clsx";

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
}

const EntryCard = ({ entry, onEdit }: EntryCardProps) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const img = event.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Optionally calculate dynamic styling based on image dimensions
  const isWide = dimensions && dimensions.width > dimensions.height;
  const isVeryWide = dimensions && dimensions.width > dimensions.height * 1.5;

  const cardClasses = clsx(
    "overflow-hidden group cursor-pointer hover:shadow-lg transition-all",
    {
      // You can adjust these classes based on your design
      "min-h-[200px]": !entry.imageUrl,
    },
  );

  return (
    <Card className={cardClasses} onClick={() => onEdit(entry)}>
      {entry.imageUrl ? (
        // Render image without fixed aspect ratio to reflect natural dimensions
        <img
          src={entry.imageUrl}
          alt={entry.title}
          onLoad={handleImageLoad}
          className="object-cover w-full"
        />
      ) : null}
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
  onEditEntry,
}: {
  entries: Entry[];
  onEditEntry: (entry: Entry) => void;
}) => {
  // Define breakpoints for the masonry grid
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-4" // adjust margins as needed
      columnClassName="pl-4 bg-clip-padding"
    >
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEditEntry} />
      ))}
    </Masonry>
  );
};
