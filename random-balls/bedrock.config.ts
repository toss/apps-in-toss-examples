import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'random-balls',
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '랜덤 볼',
    icon: 'https://static.toss.im/appsintoss/73/5d3c5039-585e-4ddb-a3fa-9cd260ab55b9.png',
    primaryColor: '#3B70E3',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'game',
  },
});
