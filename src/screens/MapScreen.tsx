import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirestoreService } from '../services/firestore';
import { Spot } from '../types';
import SpotMarker from '../components/SpotMarker';

export default function MapScreen({ navigation }: any) {
  console.log('[MapScreen] Composant rendu');
  
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 46.6034,
    longitude: 1.8883,
    latitudeDelta: 5.0,
    longitudeDelta: 5.0,
  });

  useEffect(() => {
    console.log('[MapScreen] useEffect déclenché');
    try {
      loadSpots();
      requestLocationPermission();
    } catch (error) {
      console.error('[MapScreen] Erreur dans useEffect:', error);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      console.log('[MapScreen] Demande de permission de localisation');
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      console.log('[MapScreen] Résultat permission:', result);
      if (result === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        console.warn('[MapScreen] Permission de localisation refusée:', result);
      }
    } catch (error) {
      console.error('[MapScreen] Erreur lors de la demande de permission:', error);
    }
  };

  const getCurrentLocation = () => {
    try {
      console.log('[MapScreen] Obtention de la position actuelle');
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('[MapScreen] Position obtenue:', position.coords);
          setRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        },
        (error) => {
          console.error('[MapScreen] Erreur lors de l\'obtention de la position:', error);
          // Continue avec la position par défaut
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('[MapScreen] Erreur dans getCurrentLocation:', error);
    }
  };

  const loadSpots = async () => {
    try {
      console.log('[MapScreen] Début du chargement des spots');
      setLoading(true);
      const allSpots = await FirestoreService.getAllSpots();
      console.log('[MapScreen] Spots chargés:', allSpots.length);
      setSpots(allSpots);
    } catch (error) {
      console.error('[MapScreen] Erreur lors du chargement des spots:', error);
      // Ne pas afficher d'alerte si Firestore n'est pas configuré
      if (error instanceof Error && !error.message.includes('not configured')) {
        Alert.alert('Erreur', 'Impossible de charger les spots');
      }
    } finally {
      setLoading(false);
      console.log('[MapScreen] Chargement terminé');
    }
  };

  const handleMarkerPress = (spot: Spot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}>
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            onPress={() => handleMarkerPress(spot)}>
            <SpotMarker
              category={spot.category}
              rating={spot.rating}
              photos={spot.photos}
            />
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}>
        <Icon name="my-location" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

