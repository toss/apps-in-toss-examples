import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'weekly-todo-react',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'rsbuild dev',
      build: 'rsbuild build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '위클리 투두 - 리액트',
    icon: 'https://static.toss.im/appsintoss/73/b6eb9bd4-5282-418f-92a5-bfffba9b9570',
    primaryColor: '#3B70E3',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
