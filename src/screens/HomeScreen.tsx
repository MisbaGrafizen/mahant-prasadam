import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { loadRestaurantData } from '../store/slices/restaurantSlice';
import { RootState, AppDispatch } from '../store';
import RatingStars from '../components/RatingStars';
import Tag from '../components/Tag';
import MenuItemCard from '../components/MenuItemCard';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { data: restaurant, loading } = useSelector((state: RootState) => state.restaurant);

  useEffect(() => {
    dispatch(loadRestaurantData());
  }, [dispatch]);

  const handleViewFullMenu = () => {
    navigation.navigate('Restaurant' as never);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load restaurant data</Text>
      </View>
    );
  }

  // Get recommended items (first 3 items from different categories)
  const recommendedItems = restaurant.sections
    .flatMap(section => section.items)
    .slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Restaurant Header */}
      <View style={styles.restaurantHeader}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>

          <View style={styles.restaurantMeta}>
            <View style={styles.ratingContainer}>
              <RatingStars rating={restaurant.rating} size={16} />
              <Text style={styles.ratingText}>({restaurant.rating})</Text>
            </View>
            <Text style={styles.deliveryTime}>• {restaurant.deliveryTime}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cuisinesContainer}
          >
            {restaurant.cuisines.map((cuisine, index) => (
              <View key={index} style={styles.cuisineTag}>
                <Tag text={cuisine} variant="primary" />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Recommended Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <TouchableOpacity onPress={handleViewFullMenu}>
            <Text style={styles.viewAllButton}>View Full Menu</Text>
          </TouchableOpacity>
        </View>

        {recommendedItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </View>

      {/* View Full Menu Button */}
      <View style={styles.fullMenuButtonContainer}>
        <TouchableOpacity style={styles.fullMenuButton} onPress={handleViewFullMenu}>
          <Text style={styles.fullMenuButtonText}>View Full Menu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  restaurantHeader: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  restaurantInfo: {
    gap: 8,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  restaurantDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  cuisinesContainer: {
    marginTop: 8,
  },
  cuisineTag: {
    marginRight: 8,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllButton: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  fullMenuButtonContainer: {
    padding: 16,
    paddingTop: 8,
  },
  fullMenuButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullMenuButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
