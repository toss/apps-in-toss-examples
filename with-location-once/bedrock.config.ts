import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-location-once',
  plugins: [
    appsInToss({
      permissions: [
        {
          name: 'geolocation',
          access: 'access',
        },
      ],
      brand: {
        displayName: '현재 위치 정보 예제',
        icon: 'https://static.toss.im/appsintoss/73/6512da01-084b-4a42-a5e3-b06569fc443b',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
