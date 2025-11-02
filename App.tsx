import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import AddSpotScreen from './src/screens/AddSpotScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SpotDetailScreen from './src/screens/SpotDetailScreen';

// Services
import { AuthService } from './src/services/auth';

// Types
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  SpotDetail: { spotId: string };
  AddSpot: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'AddSpot') {
            iconName = 'add-location';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Carte',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Recherche',
        }}
      />
      <Tab.Screen
        name="AddSpot"
        component={AddSpotScreen}
        options={{
          title: 'Ajouter un Spot',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[App] Initialisation de l\'application');

    // Initialise AuthService
    AuthService.initialize()
      .then(() => {
        console.log('[App] AuthService initialisé');

        // Vérifie si un utilisateur est déjà connecté
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
          console.log('[App] État d\'authentification changé:', user ? 'connecté' : 'non connecté');
          setIsAuthenticated(!!user);
          setIsLoading(false);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error('[App] Erreur lors de l\'initialisation:', error);
        setIsLoading(false);
        setIsAuthenticated(false);
      });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="flight" size={80} color="#007AFF" />
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="SpotDetail"
              component={SpotDetailScreen}
              options={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                title: 'Détails du Spot',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 20,
  },
});

