import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'weekly-todo-vue',
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vue-tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '위클리 투두 - 뷰',
    icon: 'https://static.toss.im/appsintoss/73/84501e18-9de6-4ee6-b2fa-0eb8278fd62d',
    primaryColor: '#3B70E3',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
