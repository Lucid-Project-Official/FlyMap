module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      [
        'module:metro-react-native-babel-preset',
        {
          unstable_allowRequireContext: true,
        },
      ],
    ],
    plugins: [
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

