const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    // ⚠️ Force le transformer officiel qui gère Flow
    babelTransformerPath: require.resolve('@react-native/metro-babel-transformer'),
  },
  resolver: {
    // Conserve les extensions par défaut
    assetExts: defaultConfig.resolver.assetExts,
    sourceExts: defaultConfig.resolver.sourceExts,
  },
};

module.exports = mergeConfig(defaultConfig, config);