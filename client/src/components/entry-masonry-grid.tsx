
import { Entry } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";

interface EntryMasonryGridProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onView: (id: string) => void;
}

export function EntryMasonryGrid({ entries, onEdit, onView }: EntryMasonryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[200px] gap-4">
      {entries.map((entry) => (
        <Card 
          key={entry.id}
          className={`
            overflow-hidden border border-border/40 hover:border-primary/20 hover:shadow-md 
            transition-all duration-300 cursor-pointer group rounded-xl flex flex-col
            ${entry.imageUrl ? 'row-span-2' : ''}
          `}
          onClick={() => onView(entry.id)}
        >
          {entry.imageUrl ? (
            <>
              <div className="relative h-[60%] overflow-hidden">
                <img 
                  src={entry.imageUrl} 
                  alt="Journal entry"
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
              <div className="p-4 flex-grow flex flex-col justify-between">
                <h3 className="text-lg font-medium line-clamp-1">{entry.title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(entry.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium line-clamp-1">{entry.title}</h3>
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
              <p className="text-sm text-muted-foreground flex-grow line-clamp-4">{entry.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(entry.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
