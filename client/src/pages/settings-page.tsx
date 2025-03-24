
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import {
  LogOut,
  Settings,
  PenSquare,
  BookOpen,
  Home,
  Crown,
  Sparkles
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isPremium, setIsPremium] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  // Check if the user has premium access
  useEffect(() => {
    if (user) {
      setIsPremium(user.subscriptionStatus === 'active');
    }
  }, [user]);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      />
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">Your Insights</p>
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
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Customize your experience</p>
            </div>
            <Badge variant={isPremium ? "default" : "outline"} className="text-sm px-3 py-1.5">
              {isPremium ? (
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  <span>Premium</span>
                </div>
              ) : (
                <span>Free Plan</span>
              )}
            </Badge>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Theme</h2>
                <p className="text-sm text-muted-foreground">
                  {isPremium 
                    ? "Choose from 22 different color schemes" 
                    : "Toggle between light and dark mode"}
                </p>
              </div>
              <ThemeToggle />
            </div>

            {!isPremium && (
              <div className="mt-4 bg-muted/50 p-4 rounded-lg border border-muted/80 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Premium Feature
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upgrade to Premium for access to 20 additional color schemes
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowSubscriptionDialog(true)}>
                  Upgrade
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Account</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-sm text-muted-foreground">Current Plan:</p>
                    <p className="text-sm font-medium">{isPremium ? "Premium" : "Free"}</p>
                  </div>
                </div>
                {!isPremium && (
                  <Button 
                    variant="outline" 
                    className="gap-1.5" 
                    onClick={() => setShowSubscriptionDialog(true)}
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="font-medium">Sign out</h3>
                  <p className="text-sm text-muted-foreground">Log out of your account</p>
                </div>
                <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
                  Logout
                </Button>
              </div>
            </div>
          </Card>
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
                  variant="ghost"
                  size="icon"
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
