import React, { useState } from 'react';
import { useSubscription, SubscriptionStatus } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, CheckCircle2, Calendar, CreditCard, ShieldCheck, X, Settings, Smartphone } from 'lucide-react';
import { isIOS } from '@/utils/platform-detector';
import { motion } from 'framer-motion';
import { CrossPlatformSubscription } from './cross-platform-subscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SubscriptionManagementProps {
  showUpgradeButton?: boolean;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ 
  showUpgradeButton = true 
}) => {
  const { 
    status, 
    isLoading, 
    error, 
    cancelStripeSubscription 
  } = useSubscription();
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const iOS = isIOS();
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle subscription cancellation
  const handleCancel = async () => {
    await cancelStripeSubscription();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 text-red-800 space-y-2">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Error Loading Subscription</h3>
        </div>
        <p className="text-sm">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // When no subscription status is available
  if (!status) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50 space-y-2">
        <p className="text-sm text-gray-600">Subscription information unavailable.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  // Ensure status exists and is correctly structured
  if (status && typeof status === 'object' && 'plan' in status && 'isActive' in status) {
    // Premium subscription UI
    if (status.plan === 'premium' && status.isActive) {
      // Create a typed status to avoid TypeScript errors
      const typedStatus = status as SubscriptionStatus;
      
      return (
        <>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-3"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-yellow-500" />
                    Premium Subscription
                  </CardTitle>
                  <CardDescription>
                    Your premium features are active
                  </CardDescription>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  Active
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Billing Period</span>
                  </div>
                  <span className="font-medium capitalize">{typedStatus.billingPeriod || 'N/A'}</span>
                </div>
                
                {typedStatus.expiresAt && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Next Billing Date</span>
                    </div>
                    <span className="font-medium">
                      {formatDate(typedStatus.expiresAt)}
                    </span>
                  </div>
                )}
                
                {iOS ? (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Managed By</span>
                    </div>
                    <span className="font-medium">App Store</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Managed By</span>
                    </div>
                    <span className="font-medium">Stripe</span>
                  </div>
                )}
                
                {typedStatus.cancelAtPeriodEnd && (
                  <div className="flex items-center p-3 bg-amber-50 rounded-md border border-amber-200 text-amber-800 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Your subscription will not renew after the current period ends.</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {iOS ? (
                <Button variant="outline" className="w-full" onClick={() => {
                  // This would typically open the App Store subscription management
                  window.location.href = 'https://apps.apple.com/account/subscriptions';
                }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage in App Store
                </Button>
              ) : typedStatus.cancelAtPeriodEnd === false && (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              )}
              <p className="text-xs text-gray-500 text-center mt-2">
                {iOS 
                  ? 'You can manage your subscription through the App Store.' 
                  : typedStatus.cancelAtPeriodEnd
                    ? 'Your subscription will remain active until the end of your billing period.'
                    : 'Your subscription will automatically renew. You can cancel anytime.'
                }
              </p>
            </CardFooter>
          </Card>
        
        {/* Upgrade dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upgrade Subscription</DialogTitle>
              <DialogDescription>
                Choose a premium plan to unlock all features
              </DialogDescription>
            </DialogHeader>
            <CrossPlatformSubscription onComplete={() => setShowUpgradeDialog(false)} />
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  // Free plan UI with upgrade option
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>
                Basic journaling features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
              <span>1 journal entry per day</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
              <span>Basic mood tracking</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
              <span>Up to 1 image per entry</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
            <p className="font-medium text-blue-800 mb-1">Premium Features Available</p>
            <div className="text-blue-700 space-y-1">
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-2 text-blue-600" />
                <span>Unlimited entries per day</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-2 text-blue-600" />
                <span>Advanced mood analysis & insights</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-2 text-blue-600" />
                <span>Premium templates & AI features</span>
              </div>
            </div>
          </div>
        </CardContent>
        {showUpgradeButton && (
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setShowUpgradeDialog(true)}
            >
              Upgrade to Premium
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Upgrade dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Choose a premium plan to unlock all features
            </DialogDescription>
          </DialogHeader>
          <CrossPlatformSubscription onComplete={() => setShowUpgradeDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};