import { env } from '@react-native-bedrock/plugin-env';
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-app-login',
  plugins: [
    appsInToss({
      permissions: [],
      brand: {
        displayName: '앱 로그인 예제',
        icon: 'https://static.toss.im/appsintoss/73/b1a2730f-7f95-430b-92be-5516479f4cec',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
    env({
      SERVER_BASE_URL: 'http://localhost:4000', // 로컬 서버 주소를 입력해 주세요.
    }),
  ],
});
