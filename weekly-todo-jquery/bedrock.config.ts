import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'weekly-todo-jquery',
  web: {
    host: 'localhost',
    port: 8080,
    commands: {
      dev: 'webpack serve --mode development',
      build: 'webpack',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '위클리 투두 - 제이쿼리',
    icon: 'https://static.toss.im/appsintoss/73/6d1726a1-ad8a-430f-a532-b872500ed539',
    primaryColor: '#3B70E3',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
