import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LogOut, PenSquare, BookOpen, Settings, Home, Edit, Search, X, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { SubscriptionDialog } from "@/components/subscription-dialog";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location] = useLocation();

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const filteredEntries = entries.filter((entry) =>
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
          <p className="text-sm text-muted-foreground px-4">Welcome back, {user?.username}</p>
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
          <Button variant="outline" className="w-full" onClick={() => setShowSubscriptionDialog(true)}>
            Upgrade to Pro
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold">My Journal</h2>
            <Button onClick={() => setIsEditing(true)}>
              <PenSquare className="h-5 w-5 mr-2" />
              New Entry
            </Button>
          </div>
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
                <Button variant="ghost" size="icon" className="h-8 w-8 absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}>
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
                <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                <p className="text-muted-foreground mb-4">Create your first journal entry to begin tracking your thoughts.</p>
                <Button onClick={() => setIsEditing(true)}>Create Entry</Button>
              </Card>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium mb-2">No matching entries</h3>
                <p className="text-muted-foreground">Try a different search term</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
                {filteredEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="group mb-5 break-inside-avoid overflow-hidden border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer rounded-xl"
                    onClick={() => {} /* implement view/edit behavior */}
                  >
                    {entry.imageUrl && (
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={entry.imageUrl}
                          alt="Journal entry"
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-medium line-clamp-1">{entry.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Dialog */}
      <SubscriptionDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog} />

      {/* Editor Modal */}
      {isEditing && (
        <MinimalistJournalEditor
          entry={selectedEntry}
          onClose={() => {
            setIsEditing(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
}
