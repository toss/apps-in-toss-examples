import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-clipboard-text',
  plugins: [
    appsInToss({
      permissions: [
        {
          name: 'clipboard',
          access: 'read',
        },
        {
          name: 'clipboard',
          access: 'write',
        },
      ],
      brand: {
        displayName: '클립보드 텍스트 예제',
        icon: 'https://static.toss.im/appsintoss/73/e530da74-0c4e-4d7a-af80-f98678f7f4aa',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
