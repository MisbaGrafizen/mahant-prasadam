import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { selectCartTotalItems } from '../store/slices/cartSlice';

interface HeaderProps {
  title: string;
  onCartPress?: () => void;
  showCart?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onCartPress, showCart = true }) => {
  const cartTotalItems = useSelector(selectCartTotalItems);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showCart && (
        <TouchableOpacity style={styles.cartButton} onPress={onCartPress}>
          <MaterialCommunityIcons name="cart" size={24} color={colors.text} />
          {cartTotalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartTotalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
