import React from 'react';
import { AppRegistry, View, Text } from 'react-native';
import { name as appName } from './app.json';

// Import de App avec gestion d'erreur
let App;
try {
  App = require('./App').default;
} catch (error) {
  console.error('[index.js] Erreur lors du chargement de App:', error);
  // Fallback si App ne peut pas être chargé
  App = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FF0000' }}>
        Erreur de chargement
      </Text>
      <Text style={{ textAlign: 'center', color: '#666' }}>
        {error?.message || 'Impossible de charger l\'application'}
      </Text>
    </View>
  );
}

// Wrapper avec gestion d'erreur globale pour éviter les crashes
const AppWithErrorBoundary = () => {
  try {
    return <App />;
  } catch (error) {
    console.error('[index.js] Erreur critique au démarrage:', error);
    // Affiche un écran d'erreur au lieu de crasher
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FF0000' }}>
          Erreur de démarrage
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          {error?.message || 'Erreur inconnue'}
        </Text>
      </View>
    );
  }
};

AppRegistry.registerComponent(appName, () => AppWithErrorBoundary);

