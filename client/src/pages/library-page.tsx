import { Card } from "@/components/ui/card";
import { categoryOptions } from "@shared/schema";
import { JournalEditor } from "@/components/journal-editor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { MenuIcon, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { logoutMutation } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu */}
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
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="ghost" className="w-full justify-start">
                Library
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <h1 className="text-2xl font-bold px-4">Journal Library</h1>
        <nav className="flex flex-col gap-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              Home
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="ghost" className="w-full justify-start">
              Library
            </Button>
          </Link>
        </nav>
        <Button
          variant="ghost"
          className="mt-auto w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Writing Topics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryOptions.map((category) => (
              <Card
                key={category}
                className="p-6 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                <h3 className="text-xl font-semibold mb-2">{category}</h3>
                <p className="text-sm text-muted-foreground">
                  Explore your thoughts about {category.toLowerCase()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {selectedCategory && (
        <JournalEditor
          initialCategory={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
