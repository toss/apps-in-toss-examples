import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'examples',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '예제 모음',
        icon: 'https://static.toss.im/appsintoss/73/bc40c541-0441-4431-9409-3a692c2f66f7.png',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
