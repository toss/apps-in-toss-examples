import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-camera',
  plugins: [
    appsInToss({
      permissions: [
        {
          name: 'camera',
          access: 'access',
        },
      ],
      brand: {
        displayName: '카메라 예제',
        icon: 'https://static.toss.im/appsintoss/73/649f3ce3-927a-4e77-8862-c5cc2fc0a8df',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
