import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-contacts',
  plugins: [
    appsInToss({
      permissions: [
        {
          name: 'contacts',
          access: 'read',
        },
      ],
      brand: {
        displayName: '연락처 예제',
        icon: 'https://static.toss.im/appsintoss/73/d2fb357b-025b-4885-8286-487ca041c61f',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
