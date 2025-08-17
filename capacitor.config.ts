import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9e8e7d3f739b468c8264e51262cc4144',
  appName: 'skrobakios',
  webDir: 'dist',
  server: {
    url: 'https://9e8e7d3f-739b-468c-8264-e51262cc4144.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    }
  }
};

export default config;