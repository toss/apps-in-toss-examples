import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from 'react-native-bedrock/config';

export default defineConfig({
  appName: 'with-album-photos',
  plugins: [
    appsInToss({
      permissions: [
        {
          name: 'photos',
          access: 'read',
        },
      ],
      brand: {
        displayName: '앨범 사진 예제',
        icon: 'https://static.toss.im/appsintoss/73/9bdde45e-70ee-43ea-bc13-41984edf72d7',
        primaryColor: '#3B70E3',
        bridgeColorMode: 'basic',
      },
    }),
  ],
});
