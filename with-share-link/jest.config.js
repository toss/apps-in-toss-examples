// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('react-native-bedrock/jest').config({
  rootDir: __dirname,
  moduleNameMapper: {
    '@babel/runtime(.*)': `${path.dirname(require.resolve('@babel/runtime/package.json'))}$1`,
  },
});

module.exports = config;
