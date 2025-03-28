import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  const [isMobilePlatform, setIsMobilePlatform] = React.useState<boolean>(false)
  const [isIOS, setIsIOS] = React.useState<boolean>(false)
  const [isAndroid, setIsAndroid] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Comprehensive device and platform detection
    const detectDeviceAndPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // iOS detection (includes iPad in iOS 13+ which reports as Mac)
      const isIPad = /iPad/.test(userAgent) || 
        (/Macintosh/.test(userAgent) && 'ontouchend' in document);
      const isIPhone = /iPhone|iPod/.test(userAgent);
      const isIOSDevice = (isIPad || isIPhone) && !(window as any).MSStream;
      
      // Additional iOS detection for browsers using webkitTouchAPI on iOS 
      const isMacWithTouch = /safari/i.test(userAgent) && 
                             /apple computer/i.test(userAgent) && 
                             'ontouchend' in document;
      
      // Android detection - more comprehensive
      const isAndroidDevice = /android/i.test(userAgent) || 
                              /Android/i.test(userAgent);
      
      // Set platform states
      setIsIOS(isIOSDevice || isMacWithTouch);
      setIsAndroid(isAndroidDevice);
      setIsMobilePlatform(isIOSDevice || isAndroidDevice || isMacWithTouch);
      
      // Log the detection for debugging (optional)
      console.debug('Device detection:', { 
        userAgent, 
        isIOS: isIOSDevice || isMacWithTouch, 
        isAndroid: isAndroidDevice 
      });
    }
    
    // Listen for screen size changes
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
    } else {
      // Fallback for older browsers
      mql.addListener(onChange);
    }
    
    // Set initial states
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    detectDeviceAndPlatform()
    
    // Cleanup
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange);
      } else {
        // Fallback for older browsers
        mql.removeListener(onChange);
      }
    }
  }, [])

  // Return both screen size and platform info with memoized values
  return {
    isMobileView: !!isMobile,
    isMobilePlatform,
    isIOS,
    isAndroid
  }
}
