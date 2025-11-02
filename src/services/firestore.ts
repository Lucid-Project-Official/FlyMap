import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Spot, Review, UserActivity, FilterOptions, SpotCategory } from '../types';

export class FirestoreService {
  /**
   * CRUD Spots
   */
  static async createSpot(spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await firestore().collection('spots').add({
        ...spot,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating spot:', error);
      throw error;
    }
  }

  static async getSpot(spotId: string): Promise<Spot | null> {
    try {
      const doc = await firestore().collection('spots').doc(spotId).get();
      if (!doc.exists) return null;
      
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
      } as Spot;
    } catch (error) {
      console.error('Error getting spot:', error);
      throw error;
    }
  }

  static async getAllSpots(): Promise<Spot[]> {
    try {
      console.log('[FirestoreService] Début getAllSpots');
      const snapshot = await firestore().collection('spots').orderBy('createdAt', 'desc').get();
      console.log('[FirestoreService] Spots récupérés:', snapshot.docs.length);
      const spots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
      })) as Spot[];
      return spots;
    } catch (error: any) {
      console.error('[FirestoreService] Erreur getAllSpots:', error);
      // Si Firebase n'est pas configuré, retourner un tableau vide au lieu de planter
      if (error?.code === 'unavailable' || error?.message?.includes('not configured') || error?.message?.includes('initialize')) {
        console.warn('[FirestoreService] Firebase non configuré, retour tableau vide');
        return [];
      }
      throw error;
    }
  }

  static async getFilteredSpots(filters: FilterOptions): Promise<Spot[]> {
    try {
      let query: FirebaseFirestoreTypes.Query = firestore().collection('spots');

      // Filtre par catégorie
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      let spots = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
      })) as Spot[];

      // Filtre par rayon géographique (côté client car Firestore ne permet qu'un filtre d'inégalité par requête)
      if (filters.location) {
        const { latitude, longitude, radiusKm } = filters.location;
        const distanceThreshold = radiusKm / 111; // Approximation en degrés
        
        // Fonction de calcul de distance (formule de Haversine simplifiée)
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 6371; // Rayon de la Terre en km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        spots = spots.filter(spot => {
          const distance = calculateDistance(
            latitude,
            longitude,
            spot.latitude,
            spot.longitude
          );
          return distance <= radiusKm;
        });
      }

      // Filtre par mot-clé (recherche textuelle)
      if (filters.searchQuery) {
        const queryLower = filters.searchQuery.toLowerCase();
        spots = spots.filter(spot =>
          spot.name.toLowerCase().includes(queryLower) ||
          spot.description.toLowerCase().includes(queryLower)
        );
      }

      return spots;
    } catch (error) {
      console.error('Error getting filtered spots:', error);
      throw error;
    }
  }

  static async updateSpot(spotId: string, updates: Partial<Spot>): Promise<void> {
    try {
      await firestore().collection('spots').doc(spotId).update({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating spot:', error);
      throw error;
    }
  }

  static async deleteSpot(spotId: string): Promise<void> {
    try {
      await firestore().collection('spots').doc(spotId).delete();
    } catch (error) {
      console.error('Error deleting spot:', error);
      throw error;
    }
  }

  /**
   * CRUD Reviews
   */
  static async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await firestore().collection('reviews').add({
        ...review,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Met à jour la note moyenne du spot
      await this.updateSpotRating(review.spotId);

      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  static async getSpotReviews(spotId: string): Promise<Review[]> {
    try {
      const snapshot = await firestore()
        .collection('reviews')
        .where('spotId', '==', spotId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
        updatedAt: doc.data()?.updatedAt?.toDate() || new Date(),
      })) as Review[];
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  private static async updateSpotRating(spotId: string): Promise<void> {
    try {
      const reviews = await this.getSpotReviews(spotId);
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      await this.updateSpot(spotId, {
        rating: averageRating,
        ratingCount: reviews.length,
      });
    } catch (error) {
      console.error('Error updating spot rating:', error);
      throw error;
    }
  }

  /**
   * User Activity
   */
  static async addUserActivity(activity: Omit<UserActivity, 'createdAt'>): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(activity.spotId.split('_')[0]) // Simplification
        .collection('activities')
        .add({
          ...activity,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error adding user activity:', error);
      throw error;
    }
  }

  static async getUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('activities')
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
      })) as UserActivity[];
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }
}

