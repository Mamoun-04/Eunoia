import { Entry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { format } from "date-fns";

interface EntryMasonryGridProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onView: (id: string) => void;
}

export function EntryMasonryGrid({ entries, onEdit, onView }: EntryMasonryGridProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {entries.map((entry) => (
        <Card 
          key={entry.id}
          className="break-inside-avoid mb-4 overflow-hidden border border-border/40 hover:border-primary/20 hover:shadow-md 
            transition-all duration-300 cursor-pointer group rounded-xl"
          onClick={() => onView(entry.id)}
        >
          {entry.imageUrl && (
            <div className="relative">
              <img 
                src={entry.imageUrl} 
                alt="Journal entry"
                className="w-full object-cover"
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
          )}

          <div className="p-4">
            <h3 className="text-lg font-medium line-clamp-2 mb-2">
              {entry.title}
            </h3>
            {!entry.imageUrl && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {entry.content}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}