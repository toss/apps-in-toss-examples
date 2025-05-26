import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-location-tracking',
  plugins: [
    appsInToss({
      permissions: [{ name: 'geolocation', access: 'access' }],
      brand: {
        displayName: '실시간 위치 정보 예제',
        icon: 'https://static.toss.im/appsintoss/73/8c6afb74-57e1-4224-aa05-57e7e4718cf1',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
