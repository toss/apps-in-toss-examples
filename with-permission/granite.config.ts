import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'with-permission',
  plugins: [
    appsInToss({
      brand: {
        displayName: 'with-permission', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
        primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: 'https://static.toss.im/appsintoss/73/f6ee90c3-8e37-41d2-b7ec-70fc1cc8acad.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
        bridgeColorMode: 'basic',
      },
      permissions: [
        {
          name: 'camera',
          access: 'access',
        },
      ],
    }),
  ],
});
