import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gabrielcontreras.memorama',
  appName: 'Memorama',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 10000,
      launchAutoHide: false,
    },
    '@capacitor-community/native-audio': {
      enable: true,
    },
  },
};

export default config;
