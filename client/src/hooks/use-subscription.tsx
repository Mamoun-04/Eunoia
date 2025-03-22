
import { useAuth } from './use-auth';

interface SubscriptionFeatures {
  canAttachImages: boolean;
  maxEntriesPerDay: number;
  hasAiAssistant: boolean;
  hasAdvancedAnalytics: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  
  const getFeatures = (): SubscriptionFeatures => {
    const plan = user?.subscriptionPlan || 'free';
    
    switch (plan) {
      case 'yearly':
      case 'monthly':
        return {
          canAttachImages: true,
          maxEntriesPerDay: Infinity,
          hasAiAssistant: true,
          hasAdvancedAnalytics: true
        };
      default:
        return {
          canAttachImages: false,
          maxEntriesPerDay: 3,
          hasAiAssistant: false,
          hasAdvancedAnalytics: false
        };
    }
  };

  const isTrialing = user?.isTrialing || false;
  const isSubscribed = user?.subscriptionStatus === 'active';
  const currentPlan = user?.subscriptionPlan || 'free';
  const features = getFeatures();

  return {
    isTrialing,
    isSubscribed,
    currentPlan,
    features
  };
}
