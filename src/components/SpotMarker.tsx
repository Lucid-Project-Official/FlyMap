import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SpotCategory } from '../types';

interface SpotMarkerProps {
  category: SpotCategory;
  rating: number;
  photos: string[];
}

export default function SpotMarker({ category, rating, photos }: SpotMarkerProps) {
  const getCategoryColor = () => {
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
  };

  return (
    <View style={styles.container}>
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
        <Text style={styles.categoryText}>
          {category.substring(0, 3).toUpperCase()}
        </Text>
      </View>
      <View style={styles.content}>
        {photos.length > 0 && (
          <Image source={{ uri: photos[0] }} style={styles.photo} />
        )}
        <View style={styles.rating}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  rating: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

