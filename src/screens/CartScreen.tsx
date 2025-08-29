import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';

import { addOrderFromCart } from '../store/slices/ordersSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import {
  selectCartItems,
  selectCartTotalAmount,
  selectCartTotalItems,
  incrementItem,
  decrementItem,
  removeItem,
  clearCart
} from '../store/slices/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import Header from '../components/Header';
import { ApiGet, ApiPut } from '../helper/axios';

const CartScreen: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const totalItems = useSelector(selectCartTotalItems);
const navigation = useNavigation();
  const cartItemsArray = Object.values(cartItems);

  const handleIncrement = (itemId: string) => {
    dispatch(incrementItem(itemId));
  };

  const handleDecrement = (itemId: string) => {
    dispatch(decrementItem(itemId));
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeItem(itemId));
  };

  useEffect(() => {
  const fetchCart = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const prasadType = await AsyncStorage.getItem('prasadType');
      if (!userId) return;

      const res = await ApiGet(`/${prasadType}/cart/${userId}`);

      console.log('res', res)
      const serverCartItems = res.data?.items || [];
      const cartId = res.data?._id;
      console.log('cartId', cartId)

      if (cartId) {
        await AsyncStorage.setItem('cartId', cartId);
      }

      const formattedCart = serverCartItems.map(item => ({
        menuItem: {
          id: item.foodItem?._id,
          name: item.foodItem.name,
          price: Number(item.foodItem.price),
          image: item.foodItem.image || '',
        },
        quantity: Number(item.quantity),
      }));

      // Optionally update Redux here if needed
      // dispatch(loadCart(formattedCart));

    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  fetchCart();
}, []);

const handleCheckout = async () => {
  try {
    const prasadType = await AsyncStorage.getItem('prasadType');
    const userId = await AsyncStorage.getItem('userId');
    const cartId = await AsyncStorage.getItem('cartId');

    if (!userId || !prasadType || !cartId) {
      Alert.alert('Error', 'Missing cart or user information.');
      return;
    }

    console.log('cartItemsArray', cartItemsArray)
    const items = cartItemsArray.map(({ menuItem, quantity }) => ({
      foodItem: menuItem?._id,
      quantity: quantity.toString(),
    }));

    const payload = { items, userId };

    console.log('Updating cart:', payload);

    // PATCH request to update the cart with cartId in the URL
    const res = await ApiPut(`/${prasadType}/cart/update`, payload);

    console.log('res-update', res)

    if (res.cart) {
      // Navigate based on prasadType
      if (prasadType === 'self-service') {
        // @ts-expect-error
        navigation.navigate('Serving');
      } else {
        // @ts-expect-error
        navigation.navigate('Location');
      }
    } else {
      Alert.alert('Error', 'Failed to update cart.');
    }
  } catch (err) {
    console.error('Cart update failed:', err);
    Alert.alert('Error', 'Something went wrong while updating the cart.');
  }
};


  if (cartItemsArray.length === 0) {
    return (
      <>
      <View style={styles.container}>

       <Header />
      <View style={styles.emptyContainer}>
     
        <MaterialCommunityIcons name="cart-outline" size={80} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some delicious items from the menu</Text>
      </View>
            </View>
      </>
    );
  }

  const deliveryFee = 5000; // 50 rupees in paise
  const gst = Math.round(totalAmount * 0.18); // 18% GST
  const finalTotal = totalAmount + deliveryFee + gst;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cartItemsArray.map(({ menuItem, quantity }) => (
          <View key={menuItem._id} style={styles.cartItem}>
            <Image source={{ uri: menuItem.image }} style={styles.itemImage} />

            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{menuItem.name}</Text>
              <Text style={styles.itemPrice}>₹{menuItem.price}</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(menuItem.id)}
                >
                  <MaterialCommunityIcons name="minus" size={16} color={colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantity}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(menuItem.id)}
                >
                  <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>
                ₹{menuItem.price * quantity}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(menuItem.id)}
              >
                <MaterialCommunityIcons name="delete" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bill Summary */}
      <View style={styles.billContainer}>
        {/* <Text style={styles.billTitle}>Bill Summary</Text> */}

        {/* <View style={styles.billRow}>
          <Text style={styles.billLabel}>Item Total ({totalItems} items)</Text>
          <Text style={styles.billValue}>{formatINR(totalAmount)}</Text>
        </View> */}

        {/* <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={styles.billValue}>{formatINR(deliveryFee)}</Text>
        </View> */}
{/* 
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>GST (18%)</Text>
          <Text style={styles.billValue}>{formatINR(gst)}</Text>
        </View> */}

        {/* <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatINR(finalTotal)}</Text>
        </View> */}

        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>
            Continue ₹{totalAmount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 12,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  removeButton: {
    padding: 8,
  },
  billContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: 14,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
