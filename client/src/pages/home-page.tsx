import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JournalEditor } from "@/components/journal-editor";
import { MoodSelector } from "@/components/mood-selector";
import { useState } from "react";
import {
  LayoutGrid,
  LogOut,
  PenSquare,
  BookOpen,
  Settings,
  CalendarDays,
  MessageSquare,
  Edit,
  Image
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [viewEntryId, setViewEntryId] = useState<number | null>(null);
  const [location] = useLocation();

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const navigation = [
    { name: "Today", href: "/", icon: CalendarDays },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">
            Welcome back, {user?.username}
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowSubscriptionDialog(true)}
          >
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">My Journal</h2>
            <Button onClick={() => setIsEditing(true)}>
              <PenSquare className="h-5 w-5 mr-2" />
              New Entry
            </Button>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <Card className="p-4">Loading entries...</Card>
            ) : entries.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Start Your Journey
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first journal entry to begin tracking your thoughts and moods.
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  Create Entry
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setViewEntryId(entry.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {entry.title}
                      </h3>
                      <MoodSelector value={entry.mood} readonly />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(entry.createdAt), "PPP")}
                    </p>
                    
                    {entry.imageUrl && (
                      <div className="relative aspect-video mb-2 overflow-hidden rounded-md">
                        <img 
                          src={entry.imageUrl} 
                          alt="Entry thumbnail" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {entry.content.length > 60 
                          ? `${entry.content.substring(0, 60)}...` 
                          : entry.content}
                      </span>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background lg:hidden">
        <nav className="flex justify-around p-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {isEditing && (
        <JournalEditor
          entry={selectedEntry}
          onClose={() => {
            setIsEditing(false);
            setSelectedEntry(null);
          }}
        />
      )}
      
      {/* Entry Viewing Dialog */}
      {viewEntryId !== null && (
        <Dialog open={viewEntryId !== null} onOpenChange={() => setViewEntryId(null)}>
          <DialogContent className="sm:max-w-2xl">
            {(() => {
              const entry = entries.find(e => e.id === viewEntryId);
              if (!entry) return null;
              
              return (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{entry.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "PPP")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MoodSelector value={entry.mood} readonly />
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsEditing(true);
                          setViewEntryId(null);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {entry.imageUrl && (
                    <img 
                      src={entry.imageUrl} 
                      alt="Entry image" 
                      className="w-full h-auto rounded-lg object-cover mx-auto" 
                    />
                  )}
                  
                  <div className="prose dark:prose-invert max-w-none">
                    {entry.content}
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      />
    </div>
  );
}