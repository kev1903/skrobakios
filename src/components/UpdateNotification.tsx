import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkAndUpdateVersion, forceReload, APP_VERSION } from '@/utils/cacheManager';
import { registerServiceWorker, updateServiceWorker } from '@/utils/serviceWorkerManager';
import { supabase } from '@/integrations/supabase/client';

/**
 * UpdateNotification - Shows a banner when app needs to be updated
 * Only visible after authentication
 */
export const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ 
    oldVersion: string | null; 
    newVersion: string; 
    forceUpdate: boolean;
    message?: string;
    minCountdown?: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [initialCountdown, setInitialCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker().then(reg => {
      if (reg) {
        setSwRegistration(reg);
      }
    });

    // Listen for service worker updates
    const handleSWUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Service worker update detected');
      setSwRegistration(customEvent.detail.registration);
      setShowUpdate(true);
      setUpdateInfo({
        oldVersion: APP_VERSION,
        newVersion: 'latest',
        forceUpdate: false
      });
    };

    window.addEventListener('swUpdateAvailable', handleSWUpdate);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleSWUpdate);
    };
  }, []);

  useEffect(() => {
    const checkVersion = async () => {
      const result = await checkAndUpdateVersion();
      
      if (result.updated) {
        const minCountdown = result.minCountdown || 10;
        const info = {
          oldVersion: result.oldVersion || null,
          newVersion: result.newVersion,
          forceUpdate: result.forceUpdate || false,
          message: result.message,
          minCountdown
        };
        setUpdateInfo(info);
        setShowUpdate(true);
        setCountdown(minCountdown);
        setInitialCountdown(minCountdown);
        
        // If force update, start countdown immediately
        if (info.forceUpdate) {
          setIsCountingDown(true);
        }
      }
    };

    checkVersion();

    // Check for updates every 1 hour (aggressive auto-update strategy)
    const interval = setInterval(checkVersion, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown <= 0) {
      forceReload();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isCountingDown]);

  const handleUpdate = async () => {
    // If we have a service worker waiting, activate it
    if (swRegistration?.waiting) {
      await updateServiceWorker(swRegistration);
    } else {
      forceReload();
    }
  };

  const handlePostpone = () => {
    if (updateInfo?.forceUpdate) {
      // Can't postpone force updates
      return;
    }
    setShowUpdate(false);
    setIsCountingDown(false);
    setCountdown(10);
  };

  const handleUpdateLater = () => {
    if (updateInfo?.forceUpdate) {
      // Can't postpone force updates
      return;
    }
    setIsCountingDown(true);
  };

  if (!showUpdate || !isAuthenticated) return null;

  const progress = initialCountdown > 0 ? ((initialCountdown - countdown) / initialCountdown) * 100 : 0;
  const isCritical = updateInfo?.forceUpdate;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-md">
      <Card className={`backdrop-blur-xl border-white/20 shadow-elegant transition-all duration-300 ${
        isCritical 
          ? 'bg-rose-500/95 animate-pulse' 
          : 'bg-luxury-gold/95'
      }`}>
        <div className="p-4 flex items-center gap-4">
          <div className="flex-shrink-0 relative">
            {isCountingDown && isCritical ? (
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-white/20"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                    className="text-white transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{countdown}</span>
                </div>
              </div>
            ) : (
              <RefreshCw className={`h-6 w-6 text-white ${isCritical ? 'animate-spin' : 'animate-pulse'}`} />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              {isCritical ? '🚨 Critical Update Required' : '✨ Update Available'}
            </h3>
            <p className="text-xs text-white/90">
              {updateInfo?.message || (
                isCountingDown 
                  ? `Updating in ${countdown} seconds...`
                  : isCritical
                    ? 'A critical update is required. The app will update automatically.'
                    : 'A new version is available with the latest features and fixes.'
              )}
            </p>
            {updateInfo?.oldVersion && (
              <p className="text-xs text-white/70 mt-1">
                v{updateInfo.oldVersion} → v{updateInfo.newVersion}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isCountingDown ? (
              <>
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-white text-luxury-gold hover:bg-white/90 shadow-md"
                >
                  Update Now
                </Button>
                {!isCritical && (
                  <>
                    <Button
                      onClick={handleUpdateLater}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                    >
                      Later
                    </Button>
                    <Button
                      onClick={handlePostpone}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-white text-luxury-gold hover:bg-white/90 shadow-md"
                >
                  Update Now
                </Button>
                {!isCritical && (
                  <Button
                    onClick={handlePostpone}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
