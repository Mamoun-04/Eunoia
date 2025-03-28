import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { SubscriptionDialog } from './subscription-dialog';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface UpgradeButtonProps extends ButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium';
  showIcon?: boolean;
  className?: string;
}

export function UpgradeButton({ 
  size = 'default',
  variant = 'premium',
  showIcon = true,
  className,
  children,
  ...props
}: UpgradeButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Check user's subscription status
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 60000,
    refetchOnWindowFocus: true
  });

  // Don't render the button for premium users
  if (userData?.subscriptionStatus === 'active') {
    return null;
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setDialogOpen(true)}
        className={cn(
          variant === 'premium' && 'bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white border-0',
          className
        )}
        {...props}
      >
        {showIcon && <Sparkles className="mr-2 h-4 w-4" />}
        {children || 'Upgrade to Premium'}
      </Button>
      
      <SubscriptionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
}