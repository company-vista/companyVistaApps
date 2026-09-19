const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  maxWorkers: 2,
  resolver: {
    // Metro ko kisi bhi library ke build/android/gradle folders ko ignore karne bole
    blockList: [
      /.*\/android\/app\/build\/.*/,
      /.*\/android\/\.gradle\/.*/,
      /.*\/node_modules\/.*\/android\/build\/.*/,
      /.*\/node_modules\/.*\/ios\/build\/.*/,
    ],
  },
  // Windows EMFILE fix: file handles kam use ho
  watcher: {
    healthCheck: {
      enabled: true,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);