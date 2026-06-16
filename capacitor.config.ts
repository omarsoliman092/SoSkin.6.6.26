import type { CapacitorConfig } from '@capacitor/cli';
// Build uses VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY from .env


const config: CapacitorConfig = {
  appId: 'app.lovable.soskin',
  appName: 'SoSkin',
  webDir: 'dist',
  server: {
    // Hot-reload from the live Lovable preview while developing.
    // Comment this block out (or run `cap copy` after a real build)
    // to ship a fully offline native build.
    url: 'https://91c29cd2-5e67-404a-95ee-f89a5c3c69cb.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#FFFFFF',
  },
  android: {
    backgroundColor: '#FFFFFF',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FFFFFF',
    },
  },
};

export default config;
