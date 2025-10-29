import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkAndUpdateVersion, forceReload, APP_VERSION } from '@/utils/cacheManager';
import { registerServiceWorker, updateServiceWorker } from '@/utils/serviceWorkerManager';

/**
 * UpdateNotification - Shows a banner when app needs to be updated
 */
export const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ oldVersion: string | null; newVersion: string; forceUpdate: boolean } | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

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
        const info = {
          oldVersion: result.oldVersion || null,
          newVersion: result.newVersion,
          forceUpdate: result.forceUpdate || false
        };
        setUpdateInfo(info);
        setShowUpdate(true);
        
        // If force update, start countdown immediately
        if (info.forceUpdate) {
          setIsCountingDown(true);
        }
      }
    };

    checkVersion();

    // Check for updates every 24 hours
    const interval = setInterval(checkVersion, 24 * 60 * 60 * 1000);
    
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

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <Card className="bg-luxury-gold/95 backdrop-blur-xl border-white/20 shadow-elegant">
        <div className="p-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <RefreshCw className="h-6 w-6 text-white animate-spin" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              {updateInfo?.forceUpdate ? 'Critical Update Required' : 'Update Available'}
            </h3>
            <p className="text-xs text-white/90">
              {isCountingDown 
                ? `Updating in ${countdown} seconds...`
                : updateInfo?.forceUpdate
                  ? 'A critical update is required. The app will update automatically.'
                  : 'A new version is available with the latest features and fixes.'
              }
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
                {!updateInfo?.forceUpdate && (
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
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-white text-luxury-gold hover:bg-white/90 shadow-md"
              >
                Update Now ({countdown}s)
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
