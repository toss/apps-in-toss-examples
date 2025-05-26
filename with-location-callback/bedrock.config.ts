import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-location-callback',
  plugins: [
    appsInToss({
      permissions: [
        {
          name: 'geolocation',
          access: 'access',
        },
      ],
      brand: {
        displayName: '위치 변경 시 콜백 예제',
        icon: 'https://static.toss.im/appsintoss/73/d76096b4-cfd5-4255-ac4d-ac74bb19d71b',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
