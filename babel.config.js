module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Force le strip Flow même si le preset ne s'applique pas (sécurité)
    '@babel/plugin-transform-flow-strip-types',
  ],
};

