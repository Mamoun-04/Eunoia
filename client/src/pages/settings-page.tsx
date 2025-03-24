import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";


export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [reason, setReason] = useState('');
  const toast = useToast();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleDeleteAccount = async () => {
    try {
      //  Add your actual delete account logic here.  This is a placeholder.
      console.log("Deleting account with reason:", reason);
      toast({ title: 'Account deleted successfully!', description: 'Your account has been deleted.', type: 'success' });
      setShowFeedbackDialog(false);
      setShowDeleteDialog(false);
      // Add redirect to login page here
    } catch (error) {
      toast({ title: 'Error deleting account', description: error.message, type: 'error' });
    }
  };

  const handleFeedbackSubmit = () => {
    //Submit feedback here
    setShowFeedbackDialog(false);
    setShowDeleteDialog(true);
  };

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
                <p className="text-sm text-muted-foreground">Toggle light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
              <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
                Logout
              </Button>
            </div>
          </Card>

          {/* Delete Account Section */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanent actions that can't be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all your data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowFeedbackDialog(true)}
                    className="min-w-[120px] justify-center"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} onSubmit={handleFeedbackSubmit} />
          <DeleteAccountDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onDelete={handleDeleteAccount}
            setReason={setReason}
          />
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

function DeleteAccountDialog({ open, onOpenChange, onDelete, setReason }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Delete Account</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <DialogDescription>
          Are you sure you want to delete your account? This action is irreversible.
        </DialogDescription>
        <Label htmlFor="reason">Reason for leaving:</Label>
        <Textarea
          id="reason"
          placeholder="Please tell us why you're leaving..."
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="destructive" onClick={onDelete}>Delete Account</Button>
      </DialogFooter>
    </Dialog>
  );
}

function FeedbackDialog({ open, onOpenChange, onSubmit }) {
  const [feedback, setFeedback] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const reasons = [
    { value: 'betterApp', label: 'I found a better app' },
    { value: 'privacy', label: 'Privacy concerns' },
    { value: 'notUseful', label: 'Not useful' },
    { value: 'expensive', label: 'Too expensive' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Why are you leaving?</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <Select value={selectedReason} onValueChange={setSelectedReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedReason === 'other' && (
          <div>
            <Label htmlFor="feedback">Other reason:</Label>
            <Textarea id="feedback" placeholder="Please specify your reason..." onChange={(e) => setFeedback(e.target.value)}/>
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="destructive" onClick={() => {onSubmit(); setReason(selectedReason === 'other' ? feedback : selectedReason)}}>Delete Account</Button>
      </DialogFooter>
    </Dialog>
  );
}