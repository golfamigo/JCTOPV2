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

module.exports = config;