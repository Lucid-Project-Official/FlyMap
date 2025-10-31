import React, { useState } from 'react';
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
  const [isDraggable, setIsDraggable] = useState(true);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsDraggable(true);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
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
        latitude: location.latitude,
        longitude: location.longitude,
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
        <Text style={styles.label}>Position</Text>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={location}
            onRegionChangeComplete={setLocation}>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable={isDraggable}
              onDragEnd={(e) => {
                setLocation({
                  ...location,
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                });
              }}
            />
          </MapView>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}>
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

