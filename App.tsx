import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, ActivityIndicator, Text, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import { AuthService } from './src/services/auth';

// Console.log pour débogage
const log = (message: string, data?: any) => {
  console.log(`[FlyMap App] ${message}`, data || '');
};

// Error Boundary pour capturer les erreurs et éviter les crashes
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    log('ErrorBoundary: Erreur capturée', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log('ErrorBoundary: Détails de l\'erreur', { error, errorInfo });
    console.error('[FlyMap App] Erreur non gérée:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#FF0000' }}>
            Oups ! Une erreur s'est produite
          </Text>
          <ScrollView style={{ maxHeight: 300 }}>
            <Text style={{ color: '#666', marginBottom: 10 }}>
              {this.state.error?.message || 'Erreur inconnue'}
            </Text>
            <Text style={{ color: '#999', fontSize: 12, fontFamily: 'monospace' }}>
              {this.state.error?.stack}
            </Text>
          </ScrollView>
          <Text style={{ marginTop: 20, color: '#007AFF', fontSize: 14 }}>
            Relancez l'application pour réessayer
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import AddSpotScreen from './src/screens/AddSpotScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SpotDetailScreen from './src/screens/SpotDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Firebase est initialisé automatiquement via google-services.json (Android) et GoogleService-Info.plist (iOS)
// Aucune configuration manuelle n'est nécessaire
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
  
  try {
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
  } catch (error) {
    log('MainTabs: Erreur lors du rendu', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FF0000' }}>
          Erreur lors du chargement
        </Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </Text>
      </View>
    );
  }
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

