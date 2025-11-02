module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Par sécurité : strip Flow même si le preset n’est pas appliqué
    '@babel/plugin-transform-flow-strip-types',
  ],
};