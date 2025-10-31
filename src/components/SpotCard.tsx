import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Spot } from '../types';

interface SpotCardProps {
  spot: Spot;
  onPress: () => void;
}

export default function SpotCard({ spot, onPress }: SpotCardProps) {
  const getCategoryColor = () => {
    switch (spot.category) {
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
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {spot.photos.length > 0 && (
        <Image source={{ uri: spot.photos[0] }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.categoryText}>{spot.category}</Text>
          </View>
          <View style={styles.rating}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({spot.ratingCount})</Text>
          </View>
        </View>
        <Text style={styles.name}>{spot.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {spot.description}
        </Text>
        <View style={styles.footer}>
          <Icon name="person" size={14} color="#666" />
          <Text style={styles.author}>{spot.userName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

