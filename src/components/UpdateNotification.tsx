import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkAndUpdateVersion, forceReload, APP_VERSION } from '@/utils/cacheManager';

/**
 * UpdateNotification - Shows a banner when app needs to be updated
 */
export const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ oldVersion: string | null; newVersion: string } | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      const result = await checkAndUpdateVersion();
      
      if (result.updated) {
        setUpdateInfo({
          oldVersion: result.oldVersion || null,
          newVersion: result.newVersion
        });
        setShowUpdate(true);
      }
    };

    checkVersion();

    // Check for updates every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    forceReload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
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
              Update Available
            </h3>
            <p className="text-xs text-white/90">
              A new version is available. Please refresh to get the latest features and fixes.
            </p>
            {updateInfo?.oldVersion && (
              <p className="text-xs text-white/70 mt-1">
                v{updateInfo.oldVersion} → v{updateInfo.newVersion}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleUpdate}
              size="sm"
              className="bg-white text-luxury-gold hover:bg-white/90 shadow-md"
            >
              Update Now
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
