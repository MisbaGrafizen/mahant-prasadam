import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

import { MenuItem } from '../types';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import { addItem, incrementItem, decrementItem, selectCartItemQuantity } from '../store/slices/cartSlice';
import { RootState } from '../store';
import RatingStars from './RatingStars';
import Tag from './Tag';

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const dispatch = useDispatch();
  const quantity = useSelector((state: RootState) =>
    selectCartItemQuantity(state, item.id)
  );

  const handleAddToCart = () => {
    dispatch(addItem(item));
  };

  const handleIncrement = () => {
    dispatch(incrementItem(item.id));
  };

  const handleDecrement = () => {
    dispatch(decrementItem(item.id));
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={item.isVeg ? 'checkbox-blank' : 'checkbox-blank-outline'}
            size={16}
            color={item.isVeg ? colors.success : colors.error}
          />
          <Text style={styles.name}>{item.name}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.ratingContainer}>
          <RatingStars rating={item.rating} size={14} />
          <Text style={styles.ratingText}>({item.rating})</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
        >
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tagWrapper}>
              <Tag text={tag} />
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatINR(item.price)}</Text>

          {quantity === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.quantityButton} onPress={handleDecrement}>
                <MaterialCommunityIcons name="minus" size={16} color={colors.primary} />
              </TouchableOpacity>

              <Text style={styles.quantity}>{quantity}</Text>

              <TouchableOpacity style={styles.quantityButton} onPress={handleIncrement}>
                <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tagWrapper: {
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quantityButton: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 12,
  },
});

export default MenuItemCard;
