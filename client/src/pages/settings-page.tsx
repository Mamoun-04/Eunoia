
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen,
  Home,
  Trash2,
  Sparkles,
  CreditCard
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Check if user has premium subscription
  const isPremium = user?.subscriptionStatus === "active";
  
  // Format the subscription end date if available
  const formatSubscriptionEndDate = () => {
    if (!user?.subscriptionEndDate) return null;
    
    const endDate = new Date(user.subscriptionEndDate);
    return endDate.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cancel-subscription");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription cancelled",
        description: "Your premium access will continue until the end of your billing period.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your experience</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Theme</h2>
                <p className="text-sm text-muted-foreground">Choose from available themes</p>
              </div>
              <ThemeToggle />
            </div>
            
            <Separator className="my-6" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
              <Button variant="outline" onClick={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
            
            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Delete Account</h2>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
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

      {/* Delete Account Dialog */}
      <DeleteAccountDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      
      
    </div>
  );
}
