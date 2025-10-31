import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import StarRating from 'react-native-star-rating-widget';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirestoreService } from '../services/firestore';
import { AuthService } from '../services/auth';
import { Spot, Review } from '../types';
import ReviewCard from '../components/ReviewCard';

export default function SpotDetailScreen({ route, navigation }: any) {
  const { spotId } = route.params;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(3);
  const [userComment, setUserComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpot();
    loadReviews();
  }, [spotId]);

  const loadSpot = async () => {
    try {
      const spotData = await FirestoreService.getSpot(spotId);
      setSpot(spotData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le spot');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const reviewsData = await FirestoreService.getSpotReviews(spotId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!userComment.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter un commentaire');
      return;
    }

    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      await FirestoreService.createReview({
        spotId,
        userId: user.uid,
        userName: user.displayName || 'Utilisateur',
        userPhotoURL: user.photoURL || undefined,
        rating: userRating,
        comment: userComment.trim(),
      });

      Alert.alert('Succès', 'Avis ajouté avec succès!');
      setUserComment('');
      setUserRating(3);
      loadReviews();
      loadSpot();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'ajout de l\'avis');
    }
  };

  if (loading || !spot) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Photos */}
      {spot.photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
          {spot.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photo} />
          ))}
        </ScrollView>
      )}

      {/* Infos principales */}
      <View style={styles.header}>
        <Text style={styles.name}>{spot.name}</Text>
        <View style={styles.categoryRating}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(spot.category) }]}>
            <Text style={styles.categoryText}>{spot.category}</Text>
          </View>
          <View style={styles.rating}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({spot.ratingCount})</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{spot.description}</Text>
      </View>

      {/* Carte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: spot.latitude,
              longitude: spot.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}>
            <Marker
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
            />
          </MapView>
        </View>
      </View>

      {/* Avis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
        
        {/* Formulaire d'avis */}
        <View style={styles.reviewForm}>
          <StarRating
            rating={userRating}
            onChange={setUserRating}
            starSize={28}
            starStyle={styles.star}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Ajoutez votre commentaire..."
            value={userComment}
            onChangeText={setUserComment}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
            <Text style={styles.submitButtonText}>Publier l'avis</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des avis */}
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </View>

      {/* Auteur */}
      <View style={styles.footer}>
        <Icon name="person" size={16} color="#666" />
        <Text style={styles.author}>Par {spot.userName}</Text>
      </View>
    </ScrollView>
  );
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'Freestyle':
      return '#FF6B6B';
    case 'Bando':
      return '#4ECDC4';
    case 'Race':
      return '#45B7D1';
    case 'Cinematique':
      return '#F9CA24';
    default:
      return '#95A5A6';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosContainer: {
    maxHeight: 300,
  },
  photo: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  reviewForm: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  star: {
    marginHorizontal: 4,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

