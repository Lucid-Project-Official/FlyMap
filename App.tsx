import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, ActivityIndicator, Text, ScrollView } from 'react-native';

// Imports avec gestion d'erreur pour éviter les crashes
let Icon: any;
try {
  Icon = require('react-native-vector-icons/MaterialIcons').default;
} catch (e) {
  console.warn('[App] react-native-vector-icons non disponible, utilisation d\'un fallback');
  Icon = ({ name, size, color, style }: any) => <View style={[{ width: size, height: size, backgroundColor: color }, style]} />;
}

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

// Screens avec gestion d'erreur pour éviter les crashes si un screen a un problème
let LoginScreen: any;
let MapScreen: any;
let SearchScreen: any;
let AddSpotScreen: any;
let ProfileScreen: any;
let SpotDetailScreen: any;

try {
  LoginScreen = require('./src/screens/LoginScreen').default;
} catch (e) {
  console.error('[App] Erreur lors du chargement de LoginScreen:', e);
  LoginScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Erreur de chargement</Text></View>;
}

try {
  MapScreen = require('./src/screens/MapScreen').default;
} catch (e) {
  console.error('[App] Erreur lors du chargement de MapScreen:', e);
  MapScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Erreur de chargement</Text></View>;
}

try {
  SearchScreen = require('./src/screens/SearchScreen').default;
} catch (e) {
  console.error('[App] Erreur lors du chargement de SearchScreen:', e);
  SearchScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Erreur de chargement</Text></View>;
}

try {
  AddSpotScreen = require('./src/screens/AddSpotScreen').default;
} catch (e) {
  console.error('[App] Erreur lors du chargement de AddSpotScreen:', e);
  AddSpotScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Erreur de chargement</Text></View>;
}

try {
  ProfileScreen = require('./src/screens/ProfileScreen').default;
} catch (e) {
  console.error('[App] Erreur lors du chargement de ProfileScreen:', e);
  ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Erreur de chargement</Text></View>;
}

try {
  SpotDetailScreen = require('./src/screens/SpotDetailScreen').default;
} catch (e) {
  console.error('[App] Erreur lors du chargement de SpotDetailScreen:', e);
  SpotDetailScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Erreur de chargement</Text></View>;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
    
    let unsubscribe: (() => void) | null = null;
    let mounted = true;
    
    // Initialise les services avec gestion d'erreur robuste
    (async () => {
      try {
        await AuthService.initialize();
        log('App: AuthService initialisé avec succès');
        
        if (!mounted) return;
        
        // Écoute les changements d'authentification
        unsubscribe = AuthService.onAuthStateChanged((user) => {
          if (!mounted) return;
          log('App: État d\'authentification changé', { 
            hasUser: !!user, 
            userId: user?.uid 
          });
          setAuthenticated(!!user);
          setLoading(false);
        });

        // Vérifie l'état initial
        try {
          const currentUser = AuthService.getCurrentUser();
          log('App: Utilisateur actuel', { 
            hasUser: !!currentUser, 
            userId: currentUser?.uid 
          });
          
          if (currentUser && mounted) {
            setAuthenticated(true);
          }
          if (mounted) {
            setLoading(false);
          }
        } catch (userError) {
          log('App: Erreur lors de la vérification de l\'utilisateur', userError);
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (err: any) {
        log('App: Erreur lors de l\'initialisation', err);
        if (mounted) {
          setError(err?.message || 'Erreur lors de l\'initialisation');
          setLoading(false);
          // Continue même en cas d'erreur pour permettre le mode hors ligne
        }
      }
    })();

    return () => {
      mounted = false;
      log('App: Nettoyage - désabonnement de onAuthStateChanged');
      if (unsubscribe) {
        unsubscribe();
      }
    };
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

