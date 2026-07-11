const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web ships a WebAssembly build that must be bundled as an asset.
config.resolver.assetExts.push('wasm');

module.exports = config;
