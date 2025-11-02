import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import StarRating from 'react-native-star-rating-widget';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirestoreService } from '../services/firestore';
import { StorageService, MediaService } from '../services/storage';
import { AuthService } from '../services/auth';
import { SpotCategory } from '../types';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const CATEGORIES: SpotCategory[] = ['Freestyle', 'Bando', 'Race', 'Cinematique', 'Autre'];

export default function AddSpotScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SpotCategory>('Freestyle');
  const [rating, setRating] = useState(3);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [location, setLocation] = useState({
    latitude: 46.6034,
    longitude: 1.8883,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [spotLocation, setSpotLocation] = useState({
    latitude: 46.6034,
    longitude: 1.8883,
  });
  const [loading, setLoading] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentUserLocation(newLocation);
        setSpotLocation(newLocation);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const centerOnCurrentLocation = () => {
    if (currentUserLocation) {
      setSpotLocation(currentUserLocation);
      setLocation({
        latitude: currentUserLocation.latitude,
        longitude: currentUserLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      getCurrentLocation();
    }
  };

  const pickImage = async () => {
    const uri = await MediaService.pickImage();
    if (uri) {
      setPhotos([...photos, uri]);
    }
  };

  const pickVideo = async () => {
    const uri = await MediaService.pickVideo();
    if (uri) {
      setVideos([...videos, uri]);
    }
  };

  const uploadMedia = async (spotId: string): Promise<string[]> => {
    const user = AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const uploadedPhotos = await Promise.all(
      photos.map(async (localUri, index) => {
        const filename = `photo_${Date.now()}_${index}.jpg`;
        return await StorageService.uploadImage(localUri, user.uid, spotId, filename);
      })
    );

    return uploadedPhotos;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Crée le spot avec des URLs temporaires
      const spotId = await FirestoreService.createSpot({
        userId: user.uid,
        userName: user.displayName || 'Utilisateur',
        userPhotoURL: user.photoURL || undefined,
        name: name.trim(),
        description: description.trim(),
        latitude: spotLocation.latitude,
        longitude: spotLocation.longitude,
        category,
        rating,
        ratingCount: 1,
        photos: [], // Temporaire
        videos: [], // Pas encore géré
      });

      // Upload les photos
      const uploadedPhotos = await uploadMedia(spotId);

      // Met à jour le spot avec les vraies URLs
      await FirestoreService.updateSpot(spotId, {
        photos: uploadedPhotos,
      });

      Alert.alert('Succès', 'Spot ajouté avec succès!');
      
      // Reset form
      setName('');
      setDescription('');
      setPhotos([]);
      setVideos([]);
      setRating(3);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'ajout du spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Nom du spot *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Château abandonné"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez ce spot..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            style={styles.picker}>
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Votre note</Text>
        <StarRating
          rating={rating}
          onChange={setRating}
          starSize={32}
          starStyle={styles.star}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Photos</Text>
        <View style={styles.mediaContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <Icon name="add-photo-alternate" size={32} color="#007AFF" />
            <Text style={styles.mediaButtonText}>Ajouter photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
            <Icon name="videocam" size={32} color="#007AFF" />
            <Text style={styles.mediaButtonText}>Ajouter vidéo</Text>
          </TouchableOpacity>
        </View>
        {photos.length > 0 && (
          <View style={styles.previewContainer}>
            {photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.previewImage} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Position du spot</Text>
        <Text style={styles.hint}>
          Appuyez longuement sur le point pour le déplacer ou utilisez le bouton pour centrer sur votre position
        </Text>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={location}
            onRegionChangeComplete={setLocation}
            onPress={(e) => {
              // Permettre de placer le spot en cliquant sur la carte
              setSpotLocation(e.nativeEvent.coordinate);
            }}>
            {/* Marker pour la position actuelle de l'utilisateur */}
            {currentUserLocation && (
              <Marker
                coordinate={currentUserLocation}
                title="Ma position"
                pinColor="#007AFF"
              />
            )}
            {/* Marker draggable pour le spot */}
            <Marker
              coordinate={spotLocation}
              draggable={true}
              onDragEnd={(e) => {
                setSpotLocation(e.nativeEvent.coordinate);
              }}
              title="Position du spot">
              <View style={styles.spotMarker}>
                <View style={styles.spotMarkerDot} />
                <View style={styles.spotMarkerPulse} />
              </View>
            </Marker>
          </MapView>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={centerOnCurrentLocation}>
            <Icon name="my-location" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Publier le spot</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  star: {
    marginHorizontal: 4,
  },
  mediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  mediaButton: {
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    width: '45%',
  },
  mediaButtonText: {
    marginTop: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  spotMarker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotMarkerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 2,
  },
  spotMarkerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    opacity: 0.3,
    zIndex: 1,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

