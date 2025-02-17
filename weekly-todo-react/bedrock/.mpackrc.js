const presets = require("react-native-bedrock/presets");

module.exports = {
  appName: "weekly-todo-bedrock",
  concurrency: 2,
  services: {
    sentry: {
      enabled: false,
    },
  },
  devServer: {
    presets: [presets.service()],
    build: {
      entry: "./src/_app.tsx",
    },
  },
  tasks: [
    {
      tag: "weekly-todo-bedrock-ios",
      presets: [presets.service()],
      build: {
        platform: "ios",
        entry: "./src/_app.tsx",
        outfile: "./dist/weekly-todo-bedrock.ios.js",
      },
    },
    {
      tag: "weekly-todo-bedrock-android",
      presets: [presets.service()],
      build: {
        platform: "android",
        entry: "./src/_app.tsx",
        outfile: "./dist/weekly-todo-bedrock.android.js",
      },
    },
  ],
};
