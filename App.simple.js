// Version ultra-simple pour déboguer
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

console.log('[App.simple] Module chargé avec succès');

export default function App() {
  console.log('[App.simple] Fonction App appelée');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
      <Text style={styles.subtitle}>FlyMap - Version Simple</Text>
      <Text style={styles.info}>Si vous voyez ce message, le bundle JS fonctionne !</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    color: '#333',
    marginBottom: 40,
  },
  info: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

