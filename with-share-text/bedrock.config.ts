import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-share-text',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '텍스트 공유 예제',
        icon: 'https://static.toss.im/appsintoss/73/4130cd5e-58b6-44cd-ba33-972599c4a4e6.png',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
