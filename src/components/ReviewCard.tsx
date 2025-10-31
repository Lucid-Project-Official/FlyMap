import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {review.userPhotoURL ? (
            <Image source={{ uri: review.userPhotoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={24} color="#666" />
            </View>
          )}
          <Text style={styles.userName}>{review.userName}</Text>
        </View>
        <View style={styles.rating}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{review.rating}</Text>
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      {review.photos && review.photos.length > 0 && (
        <View style={styles.photosContainer}>
          {review.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.reviewPhoto} />
          ))}
        </View>
      )}
      <Text style={styles.date}>
        {review.createdAt.toLocaleDateString('fr-FR')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
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
  comment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

