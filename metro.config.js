const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve('@react-native/metro-babel-transformer'),
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts,
    sourceExts: defaultConfig.resolver.sourceExts,
  },
});