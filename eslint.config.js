// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      // resolve the "@/" alias defined in jsconfig.json
      'import/resolver': {
        typescript: { project: './jsconfig.json' },
      },
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
