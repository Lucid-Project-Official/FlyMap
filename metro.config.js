const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { transformer, resolver } = require('react-native-svg-transformer');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    // Utiliser le transformer react-native-svg-transformer qui delegue
    // automatiquement au transformer Babel par defaut pour les fichiers .js
    ...transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...resolver,
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);

