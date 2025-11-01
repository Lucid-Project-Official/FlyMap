module.exports = function (api) {
  api.cache(true);
  
  // Plugin Flow qui DOIT etre applique en PREMIER pour transformer component(
  const flowSyntaxPlugin = require('@babel/plugin-syntax-flow');
  const flowStripPlugin = [
    require('@babel/plugin-transform-flow-strip-types'),
    {
      allowDeclareFields: true,
      requireDirective: false,
    },
  ];
  
  return {
    presets: [
      [
        'module:metro-react-native-babel-preset',
        {
          unstable_allowRequireContext: true,
        },
      ],
    ],
    overrides: [
      {
        // CRITIQUE: Override pour react-native qui DOIT etre en PREMIER
        // pour transformer component( AVANT toute autre transformation
        test: /node_modules[\/\\]react-native[\/\\].*\.js$/,
        plugins: [
          // L'ordre est CRITIQUE: syntax-flow doit etre AVANT transform-flow-strip-types
          flowSyntaxPlugin,
          flowStripPlugin,
        ],
      },
    ],
    plugins: [
      // Plugin Flow global pour tous les autres fichiers aussi
      flowSyntaxPlugin,
      flowStripPlugin,
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
          },
        },
      ],
      // react-native-reanimated doit etre le dernier plugin
      // Desactive temporairement car newArchEnabled=false
      // 'react-native-reanimated/plugin',
    ],
  };
};

