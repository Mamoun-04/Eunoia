import React from 'react';
import { isIOS } from '@/utils/platform-detector';
import { StripeSubscription } from './stripe-subscription';
import { IOSSubscription } from './ios-subscription';

interface CrossPlatformSubscriptionProps {
  onComplete?: () => void;
}

/**
 * A component that renders the appropriate subscription UI based on the detected platform
 */
export const CrossPlatformSubscription: React.FC<CrossPlatformSubscriptionProps> = ({ onComplete }) => {
  // Detect iOS platform
  const iOS = isIOS();
  
  return (
    <>
      {iOS ? (
        <IOSSubscription onComplete={onComplete} />
      ) : (
        <StripeSubscription onComplete={onComplete} />
      )}
    </>
  );
};