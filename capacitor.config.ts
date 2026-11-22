import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ye.dajjahmall.app',
  appName: 'ضجة مول',
  webDir: 'dist',
  backgroundColor: '#07060A',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#07060A',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;
