import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-network-status',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '네트워크 상태 예제',
        icon: 'https://static.toss.im/appsintoss/73/95e0d2a1-55ed-418c-8315-60df3e4f3178',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
