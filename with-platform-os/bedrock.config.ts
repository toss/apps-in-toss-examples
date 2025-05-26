import { defineConfig } from 'react-native-bedrock/config';
import { appsInToss } from '@apps-in-toss/framework/plugins';

export default defineConfig({
  appName: 'with-platform-os',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '운영체제(OS) 예제',
        icon: 'https://static.toss.im/appsintoss/73/23adea4e-4737-4cbd-8406-112c90424a99',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
