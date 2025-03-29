/**
 * Utility functions to detect the user's platform
 */

/**
 * Detects if the current platform is iOS (iPhone, iPad, iPod)
 * @returns boolean - True if the platform is iOS
 */
export function isIOS(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Check for iOS devices: iPhone, iPad, iPod
  const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  // Check for iOS in iPad with desktop mode
  const isIPadOS = navigator.maxTouchPoints > 0 && 
                 /MacIntel/.test(navigator.platform);
  
  return isiOS || isIPadOS;
}

/**
 * Detects if the current platform is Android
 * @returns boolean - True if the platform is Android
 */
export function isAndroid(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  return /android/i.test(userAgent);
}

/**
 * Detects if the current platform is a mobile device
 * @returns boolean - True if the platform is mobile
 */
export function isMobile(): boolean {
  return isIOS() || isAndroid();
}

/**
 * Detects if the current platform is a desktop device
 * @returns boolean - True if the platform is desktop
 */
export function isDesktop(): boolean {
  return !isMobile();
}

/**
 * Gets the name of the current platform
 * @returns string - 'ios', 'android', or 'desktop'
 */
export function getPlatformName(): 'ios' | 'android' | 'desktop' {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
}