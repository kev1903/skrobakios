import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { checkAndUpdateVersion, forceReload, APP_VERSION } from '@/utils/cacheManager';
import { registerServiceWorker, updateServiceWorker } from '@/utils/serviceWorkerManager';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

/**
 * UpdateIndicator - Compact update notification in menu bar
 * Shows a small icon that indicates when updates are available
 */
export const UpdateIndicator = () => {
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
  const [popoverOpen, setPopoverOpen] = useState(false);

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
        
        // If force update, start countdown immediately and open popover
        if (info.forceUpdate) {
          setIsCountingDown(true);
          setPopoverOpen(true);
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

  const handleUpdateLater = () => {
    if (updateInfo?.forceUpdate) {
      // Can't postpone force updates
      return;
    }
    setIsCountingDown(true);
  };

  const handleDismiss = () => {
    if (updateInfo?.forceUpdate) {
      // Can't dismiss force updates
      return;
    }
    setPopoverOpen(false);
  };

  if (!showUpdate || !isAuthenticated) return null;

  const progress = initialCountdown > 0 ? ((initialCountdown - countdown) / initialCountdown) * 100 : 0;
  const isCritical = updateInfo?.forceUpdate;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
            isCritical 
              ? "bg-rose-500 hover:bg-rose-600 animate-pulse" 
              : "bg-luxury-gold hover:bg-luxury-gold/90"
          )}
          title={isCritical ? "Critical update required!" : "Update available"}
        >
          {isCountingDown && isCritical ? (
            <div className="relative w-5 h-5">
              <svg className="w-5 h-5 transform -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-white/30"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 8}`}
                  strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                  className="text-white transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{countdown}</span>
              </div>
            </div>
          ) : (
            <>
              {isCritical ? (
                <AlertCircle className="w-4 h-4 text-white" />
              ) : (
                <RefreshCw className="w-4 h-4 text-white animate-pulse" />
              )}
              {!isCountingDown && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-luxury-gold" />
              )}
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-white/95 backdrop-blur-xl border border-border/30 shadow-elegant rounded-xl z-[12000]" 
        align="end"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isCritical ? (
                <AlertCircle className="h-5 w-5 text-rose-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-luxury-gold" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {isCritical ? '🚨 Critical Update Required' : '✨ Update Available'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {updateInfo?.message || (
                  isCountingDown 
                    ? `Updating in ${countdown} seconds...`
                    : isCritical
                      ? 'A critical update is required. The app will update automatically.'
                      : 'A new version is available with the latest features and fixes.'
                )}
              </p>
              {updateInfo?.oldVersion && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  v{updateInfo.oldVersion} → v{updateInfo.newVersion}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleUpdate}
              size="sm"
              className="flex-1 bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md"
            >
              Update Now
            </Button>
            {!isCritical && (
              <>
                {!isCountingDown && (
                  <Button
                    onClick={handleUpdateLater}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    Later (10s)
                  </Button>
                )}
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                >
                  Dismiss
                </Button>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
