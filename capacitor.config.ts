import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.rush.minigames',
  appName: 'RUSH',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: 'rush-release.keystore',
      keystoreAlias: 'rush',
    },
  },
  plugins: {
    // AdMob — décommenter quand le compte est créé sur admob.google.com
    // AdMob: {
    //   appId: {
    //     android: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
    //   },
    // },
  },
}

export default config
