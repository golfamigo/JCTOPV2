const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix Windows path issues with Expo Router
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Ensure proper path resolution for monorepo
config.watchFolders = [
  path.resolve(__dirname, '../../packages'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, '../../node_modules'),
  path.resolve(__dirname, './node_modules'),
];

// Exclude test files from the bundle
config.resolver.blockList = [
  /.*\.spec\.(js|jsx|ts|tsx)$/,
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\/__tests__\/.*/,
  /.*\/__mocks__\/.*/,
];

module.exports = config;