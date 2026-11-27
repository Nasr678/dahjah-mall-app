import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ye.dajjahmall.app',
  appName: 'ضجة مول',
  webDir: 'dist',
  backgroundColor: '#F8F9FA',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#F8F9FA',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;
