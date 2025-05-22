import { defineConfig } from 'react-native-bedrock/config';
import { appsInToss } from '@apps-in-toss/framework/plugins';

export default defineConfig({
  appName: 'with-operational-environment',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '운영 환경 예제',
        icon: 'https://static.toss.im/appsintoss/73/d0212ebb-0de9-400a-ad5c-b18fbc47fcda',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
