module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowImportProcessEnv: true,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
