import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firebase from '@react-native-firebase/app';
import { AuthService } from './src/services/auth';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function MainTabs() {
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

  useEffect(() => {
    // Initialise les services
    AuthService.initialize().then(() => {
      // Écoute les changements d'authentification
      const unsubscribe = AuthService.onAuthStateChanged((user) => {
        setAuthenticated(!!user);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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

