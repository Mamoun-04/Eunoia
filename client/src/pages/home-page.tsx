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
  MenuIcon,
  PenSquare,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SubscriptionDialog } from "@/components/subscription-dialog";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const navigation = [
    { name: "Home", href: "/", icon: LayoutGrid },
    { name: "Library", href: "/library", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 lg:hidden"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="flex flex-col gap-4 mt-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">
            Welcome back, {user?.username}
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          ))}
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
              entries.map((entry) => (
                <Card key={entry.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "PPP")}
                      </p>
                    </div>
                    <MoodSelector value={entry.mood} readonly />
                  </div>
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: entry.content }}
                  />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <JournalEditor
          onClose={() => setIsEditing(false)}
        />
      )}

      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      />
    </div>
  );
}
