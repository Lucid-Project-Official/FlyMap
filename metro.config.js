const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { transformer, resolver } = require('react-native-svg-transformer');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    ...transformer,
    // S'assurer que tous les fichiers .js sont transformes par Babel (pour Flow)
    // react-native-svg-transformer sera utilise uniquement pour les .svg
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...resolver,
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);

