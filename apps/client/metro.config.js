const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix Windows path issues with Expo Router
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Simplified config for standalone client
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, './node_modules'),
];

// Web-specific configurations
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Ensure proper web polyfills
  'react-native$': 'react-native-web',
};

// Add source extensions for web
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.js',
  'web.jsx',
  'web.ts',
  'web.tsx',
];

// Exclude test files from the bundle
config.resolver.blockList = [
  /.*\.spec\.(js|jsx|ts|tsx)$/,
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\/__tests__\/.*/,
  /.*\/__mocks__\/.*/,
];

module.exports = config;