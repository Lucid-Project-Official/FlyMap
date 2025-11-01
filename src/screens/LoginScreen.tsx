import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthService } from '../services/auth';

// Import Apple Auth avec gestion d'erreur
let appleAuth: any;
try {
  appleAuth = require('@invertase/react-native-apple-authentication').appleAuth;
} catch (e) {
  console.warn('[LoginScreen] Apple Auth non disponible');
  appleAuth = { isSupported: () => false };
}

export default function LoginScreen() {
  console.log('[LoginScreen] Composant rendu');
  
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await AuthService.signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      // Apple Sign-In n'est disponible que sur iOS
      if (Platform.OS !== 'ios') {
        Alert.alert('Non disponible', 'Apple Sign-In n\'est disponible que sur iOS');
        setLoading(false);
        return;
      }

      await AuthService.signInWithApple();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la connexion Apple');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>🚁</Text>
        </View>
        <Text style={styles.title}>FlyMap</Text>
        <Text style={styles.subtitle}>Vos meilleurs spots de vol</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading}>
          <Icon name="language" size={24} color="#4285F4" />
          <Text style={styles.buttonText}>Continuer avec Google</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={loading}>
            <Icon name="apple" size={24} color="#fff" />
            <Text style={[styles.buttonText, styles.appleButtonText]}>
              Continuer avec Apple
            </Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          En vous connectant, vous acceptez nos conditions d'utilisation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#007AFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  appleButtonText: {
    color: '#fff',
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

