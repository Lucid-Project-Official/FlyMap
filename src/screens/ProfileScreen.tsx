import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthService } from '../services/auth';
import { FirestoreService } from '../services/firestore';
import { User, Spot, UserActivity } from '../types';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [userSpots, setUserSpots] = useState<Spot[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const firebaseUser = AuthService.getCurrentUser();
      if (firebaseUser) {
        // Charge les spots de l'utilisateur
        const allSpots = await FirestoreService.getAllSpots();
        const mySpots = allSpots.filter(spot => spot.userId === firebaseUser.uid);
        setUserSpots(mySpots);

        // Charge les activités
        const myActivities = await FirestoreService.getUserActivities(firebaseUser.uid);
        setActivities(myActivities);

        // Crée un objet User à partir de firebaseUser
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Utilisateur',
          photoURL: firebaseUser.photoURL || undefined,
          provider: 'google', // Simplification
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.signOut();
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* En-tête profil */}
      <View style={styles.profileHeader}>
        {user.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={60} color="#666" />
          </View>
        )}
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userSpots.length}</Text>
          <Text style={styles.statLabel}>Spots créés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activities.length}</Text>
          <Text style={styles.statLabel}>Activités</Text>
        </View>
      </View>

      {/* Mes spots */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes spots ({userSpots.length})</Text>
        {userSpots.length === 0 ? (
          <Text style={styles.emptyText}>Aucun spot créé</Text>
        ) : (
          userSpots.map((spot) => (
            <View key={spot.id} style={styles.spotItem}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <View style={styles.spotMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(spot.category) }]}>
                  <Text style={styles.categoryText}>{spot.category}</Text>
                </View>
                <View style={styles.rating}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.spotDate}>
                {spot.createdAt.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Historique */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique ({activities.length})</Text>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>Aucune activité</Text>
        ) : (
          activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name={getActivityIcon(activity.action)} size={24} color="#007AFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  {getActivityText(activity.action)} {activity.spotName}
                </Text>
                <Text style={styles.activityDate}>
                  {activity.createdAt.toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Bouton déconnexion */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
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

function getActivityIcon(action: string) {
  switch (action) {
    case 'created':
      return 'add-location';
    case 'rated':
      return 'star';
    case 'reviewed':
      return 'rate-review';
    case 'visited':
      return 'visibility';
    default:
      return 'history';
  }
}

function getActivityText(action: string) {
  switch (action) {
    case 'created':
      return 'Vous avez créé';
    case 'rated':
      return 'Vous avez noté';
    case 'reviewed':
      return 'Vous avez commenté';
    case 'visited':
      return 'Vous avez visité';
    default:
      return 'Activité sur';
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
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  spotItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  spotName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  spotMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  spotDate: {
    fontSize: 12,
    color: '#999',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

