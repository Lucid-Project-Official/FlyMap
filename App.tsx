import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, ActivityIndicator, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import { AuthService } from './src/services/auth';

// Console.log pour débogage
const log = (message: string, data?: any) => {
  console.log(`[FlyMap App] ${message}`, data || '');
};

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import AddSpotScreen from './src/screens/AddSpotScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SpotDetailScreen from './src/screens/SpotDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configuration Firebase (à remplacer par vos propres clés)
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Initialise Firebase si ce n'est pas déjà fait
try {
  log('Initialisation Firebase...');
  if (!firebase.apps.length) {
    log('Firebase non initialisé, initialisation...');
    // Pour l'instant, Firebase est initialisé automatiquement via google-services.json
    // Ne pas réinitialiser manuellement car cela peut causer des erreurs
    log('Firebase sera initialisé automatiquement via google-services.json');
  } else {
    log('Firebase déjà initialisé');
  }
} catch (error) {
  log('Erreur lors de l\'initialisation Firebase:', error);
  // Ne pas faire planter l'app si Firebase n'est pas configuré
}

function MainTabs() {
  log('MainTabs: Composant rendu');
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Add') {
            iconName = 'add-location';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName || 'help'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}>
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Recherche' }}
      />
      <Tab.Screen
        name="Add"
        component={AddSpotScreen}
        options={{ title: 'Ajouter un spot' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    log('App: Début de l\'initialisation');
    
    // Initialise les services avec gestion d'erreur
    AuthService.initialize()
      .then(() => {
        log('App: AuthService initialisé avec succès');
        
        // Écoute les changements d'authentification
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
          log('App: État d\'authentification changé', { 
            hasUser: !!user, 
            userId: user?.uid 
          });
          setAuthenticated(!!user);
          setLoading(false);
        });

        // Vérifie l'état initial
        const currentUser = AuthService.getCurrentUser();
        log('App: Utilisateur actuel', { 
          hasUser: !!currentUser, 
          userId: currentUser?.uid 
        });
        
        if (currentUser) {
          setAuthenticated(true);
        }
        setLoading(false);

        return () => {
          log('App: Nettoyage - désabonnement de onAuthStateChanged');
          unsubscribe();
        };
      })
      .catch((err) => {
        log('App: Erreur lors de l\'initialisation', err);
        setError(err?.message || 'Erreur lors de l\'initialisation');
        setLoading(false);
        // Continue même en cas d'erreur pour permettre le mode hors ligne
      });
  }, []);

  if (loading) {
    log('App: Affichage de l\'écran de chargement');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    log('App: Affichage de l\'écran d\'erreur', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FF0000' }}>
          Erreur
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
          {error}
        </Text>
        <Text style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          L'application peut continuer en mode hors ligne
        </Text>
      </View>
    );
  }

  log('App: Rendu de l\'application', { authenticated, loading });
  
  if (!authenticated) {
    log('App: Navigation vers écran de connexion');
  } else {
    log('App: Navigation vers onglets principaux');
  }
  
  return (
    <NavigationContainer
      onReady={() => log('App: NavigationContainer prêt')}
      onStateChange={() => log('App: État de navigation changé')}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!authenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="SpotDetail"
              component={SpotDetailScreen}
              options={{
                headerShown: true,
                title: 'Détails du spot',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

