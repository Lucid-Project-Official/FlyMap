export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'apple' | 'email';
  createdAt: Date;
  updatedAt: Date;
}

export interface Spot {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: SpotCategory;
  rating: number;
  ratingCount: number;
  photos: string[];
  videos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type SpotCategory = 'Freestyle' | 'Bando' | 'Race' | 'Cinematique' | 'Autre';

export interface Review {
  id: string;
  spotId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActivity {
  spotId: string;
  spotName: string;
  spotLatitude: number;
  spotLongitude: number;
  action: 'created' | 'rated' | 'reviewed' | 'visited';
  createdAt: Date;
}

export interface FilterOptions {
  searchQuery?: string;
  category?: SpotCategory;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

