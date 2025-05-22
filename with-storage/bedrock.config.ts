import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-storage',
  plugins: [
    appsInToss({
      brand: {
        displayName: '저장소 예제', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
        primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: 'https://static.toss.im/appsintoss/73/a64708de-3d04-4209-acf5-2038a85a8aba.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
        bridgeColorMode: 'basic',
      },
      permissions: [],
    }),
  ],
});
