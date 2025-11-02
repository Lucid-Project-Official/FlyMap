module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    // sécurité : strip Flow
    '@babel/plugin-transform-flow-strip-types',
  ],
};