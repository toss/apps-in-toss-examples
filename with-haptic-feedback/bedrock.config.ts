import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-haptic-feedback',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '진동 알림 예제',
        icon: 'https://static.toss.im/appsintoss/73/2ee9c880-dcb8-42d1-b828-462aadfd6a6f',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
