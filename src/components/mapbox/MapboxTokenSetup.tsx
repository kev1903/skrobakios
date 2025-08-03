import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key, Map } from 'lucide-react';

export const MapboxTokenSetup = () => {
  return (
    <div className="w-full h-screen pt-[73px] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Map className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup Mapbox Integration</CardTitle>
          <CardDescription>
            Configure your Mapbox public token to enable interactive maps and geospatial features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Get Your Mapbox Token
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
              You'll need a Mapbox public token to use interactive maps. This token is safe to use in frontend applications.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Get Token from Mapbox
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Once you have your token, click below to securely store it in Supabase:
              </p>
              
              <Button 
                className="w-full"
                onClick={() => {
                  // This will be handled by Lovable's secret management
                  console.log('Opening secret form for MAPBOX_PUBLIC_TOKEN');
                }}
              >
                <Key className="w-4 h-4 mr-2" />
                Add Mapbox Token to Supabase Secrets
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">What's Next?</h4>
              <p className="text-green-800 dark:text-green-200 text-sm">
                After adding your token, this page will automatically display an interactive Mapbox map with your project locations and 3D visualizations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};