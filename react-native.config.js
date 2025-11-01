module.exports = {
  project: {
    android: {
      packageName: 'com.flymap',
    },
  },
  dependencies: {
    // Exclure react-native-reanimated pour app Hello World (necessite newArchEnabled=true)
    'react-native-reanimated': {
      platforms: {
        android: null, // Exclure Android
      },
    },
    // Exclure react-native-worklets pour app Hello World (necessite newArchEnabled=true)
    'react-native-worklets': {
      platforms: {
        android: null, // Exclure Android
      },
    },
  },
};
