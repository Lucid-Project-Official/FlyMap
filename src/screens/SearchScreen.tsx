import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FirestoreService } from '../services/firestore';
import { Spot, SpotCategory, FilterOptions } from '../types';
import SpotCard from '../components/SpotCard';
import Geolocation from '@react-native-community/geolocation';

const CATEGORIES: SpotCategory[] = ['Freestyle', 'Bando', 'Race', 'Cinematique', 'Autre'];

export default function SearchScreen({ navigation }: any) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | undefined>();
  const [radiusKm, setRadiusKm] = useState(20);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadSpots();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, radiusKm, currentLocation]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error('Error getting location:', error)
    );
  };

  const loadSpots = async () => {
    try {
      const allSpots = await FirestoreService.getAllSpots();
      setSpots(allSpots);
    } catch (error) {
      console.error('Error loading spots:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const filters: FilterOptions = {};

      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }

      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      if (currentLocation) {
        filters.location = {
          ...currentLocation,
          radiusKm,
        };
      }

      const filteredSpots = await FirestoreService.getFilteredSpots(filters);
      setSpots(filteredSpots);
    } catch (error) {
      console.error('Error filtering spots:', error);
    }
  };

  const renderSpot = ({ item }: { item: Spot }) => (
    <SpotCard spot={item} onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un spot..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(selectedCategory === category ? undefined : category)}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Rayon de recherche: {radiusKm} km</Text>
        <View style={styles.radiusButtons}>
          {[5, 10, 20, 50, 100].map((km) => (
            <TouchableOpacity
              key={km}
              style={[styles.radiusButton, radiusKm === km && styles.radiusButtonSelected]}
              onPress={() => setRadiusKm(km)}>
              <Text
                style={[
                  styles.radiusButtonText,
                  radiusKm === km && styles.radiusButtonTextSelected,
                ]}>
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={spots}
        renderItem={renderSpot}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  categoriesContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  radiusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  radiusButtonSelected: {
    backgroundColor: '#007AFF',
  },
  radiusButtonText: {
    fontSize: 12,
    color: '#666',
  },
  radiusButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsContainer: {
    padding: 16,
  },
});

