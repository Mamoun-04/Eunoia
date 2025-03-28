import { useState, useEffect } from 'react';

interface BrowserPlatform {
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
}

export function useBrowserPlatform(): BrowserPlatform {
  const [platform, setPlatform] = useState<BrowserPlatform>({
    isIOS: false,
    isAndroid: false,
    isMacOS: false,
    isWindows: false,
    isLinux: false,
    isMobile: false,
    isDesktop: false,
    isTablet: false,
  });

  useEffect(() => {
    // Only run this logic on the client
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      
      // Device detection
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMacOS = /macintosh|mac os x/.test(userAgent) && !isIOS;
      const isWindows = /windows/.test(userAgent);
      const isLinux = /linux/.test(userAgent) && !isAndroid;
      
      // Form factor detection
      const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
      const isTablet = /ipad/.test(userAgent) || 
                       (isAndroid && !/mobile/.test(userAgent)) ||
                       (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1); // iPad with iPadOS
                       
      const isDesktop = !isMobile && !isTablet;
      
      setPlatform({
        isIOS,
        isAndroid,
        isMacOS,
        isWindows,
        isLinux,
        isMobile,
        isDesktop,
        isTablet,
      });
    }
  }, []);

  return platform;
}