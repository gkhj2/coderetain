const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm to the asset extensions so Metro can handle it
config.resolver.assetExts = config.resolver.assetExts || [];
config.resolver.assetExts.push('wasm');

// Add wasm to source extensions
config.resolver.sourceExts = config.resolver.sourceExts || [];

module.exports = config;
