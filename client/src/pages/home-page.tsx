import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JournalEditor } from "@/components/journal-editor";
import { MinimalistJournalEditor } from "@/components/minimalist-journal-editor";
import { MoodSelector } from "@/components/mood-selector";
import { useState } from "react";
import { EntryMasonryGrid } from "@/components/entry-masonry-grid";
import {
  LayoutGrid,
  LogOut,
  PenSquare,
  BookOpen,
  Settings,
  Home,
  MessageSquare,
  Edit,
  Image,
  Search,
  X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import { PremiumFeatureModal } from "@/components/premium-feature-modal";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [viewEntryId, setViewEntryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location] = useLocation();
  const [showPremiumFeatureModal, setShowPremiumFeatureModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<"image_upload" | "daily_entry" | "word_limit">("daily_entry");

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry => 
    searchQuery ? entry.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const navigation = [
    { name: "Home", href: "/", icon: Home },
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold">My Journal</h2>
            {user?.subscriptionStatus === "active" || (entries && entries.filter(entry => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const entryDate = new Date(entry.createdAt);
              entryDate.setHours(0, 0, 0, 0);
              return entryDate.getTime() === today.getTime();
            }).length === 0) ? (
              <Button onClick={() => setIsEditing(true)}>
                <PenSquare className="h-5 w-5 mr-2" />
                New Entry
              </Button>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" disabled>
                  <PenSquare className="h-5 w-5 mr-2" />
                  New Entry
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Daily limit reached. <button 
                    className="text-primary hover:underline" 
                    onClick={() => setShowSubscriptionDialog(true)}
                  >
                    Upgrade
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search entries by title..."
                className="pl-10 bg-background/50 border-muted focus-visible:ring-primary/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium mb-2">No matching entries</h3>
                <p className="text-muted-foreground">Try a different search term</p>
              </div>
            ) : (
              <EntryMasonryGrid 
                entries={filteredEntries}
                onEdit={(entry) => {
                  setSelectedEntry(entry);
                  setIsEditing(true);
                }}
                onView={(id) => setViewEntryId(id)}
              />
                        {/* Card with image */})
                        <div className="relative overflow-hidden rounded-t-xl aspect-square">
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
                                setSelectedEntry(entry);
                                setIsEditing(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <h3 className="text-lg font-medium line-clamp-1">
                            {entry.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Card without image */}
                        <div className="p-5 flex-grow flex flex-col h-full">
                          <div className="flex-grow">
                            <h3 className="text-lg font-medium line-clamp-2 mb-2">
                              {entry.title}
                            </h3>
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
                                setSelectedEntry(entry);
                                setIsEditing(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
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
        <MinimalistJournalEditor
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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
            {(() => {
              const entry = entries.find(e => e.id === viewEntryId);
              if (!entry) return null;

              return (
                <div className="flex flex-col h-full">
                  {entry.imageUrl && (
                    <div className="relative w-full">
                      <img 
                        src={entry.imageUrl} 
                        alt="Entry image" 
                        className="w-full h-auto object-cover max-h-[40vh]" 
                      />
                      <div className="absolute top-4 right-4">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
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
                  )}
                  
                  <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {!entry.imageUrl && (
                      <div className="flex justify-between items-start mb-2">
                        <div></div>
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
                    )}
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{entry.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "PPP")}
                      </p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      {entry.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
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