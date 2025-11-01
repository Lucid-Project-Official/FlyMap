import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { AuthService } from '../services/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

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
      const isAppleAvailable = appleAuth.isSupported();
      if (!isAppleAvailable) {
        Alert.alert('Non disponible', 'Apple Sign-In n\'est pas disponible sur cet appareil');
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
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>FlyMap</Text>
        <Text style={styles.subtitle}>Vos meilleurs spots de vol</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading}>
          <Image
            source={require('../../assets/google-logo.png')}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Continuer avec Google</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={loading}>
            <Image
              source={require('../../assets/apple-logo.png')}
              style={styles.buttonIcon}
            />
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
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

