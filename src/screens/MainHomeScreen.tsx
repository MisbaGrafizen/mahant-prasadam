// MainHomeScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, StatusBar,
  TouchableOpacity, ScrollView, SectionList, ViewToken,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { RootState } from '../store';
import MenuItemCard from '../components/MenuItemCard';
import Header from '../components/Header';
import PickupDateModal from '../components/PickupDateModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiGet, ApiPost } from '../helper/axios';


const PILL_HEIGHT = 44;

// ---- Dummy one-time flag (in-memory, per app run) ----
let HAS_SHOWN_PICKUP_MODAL = false;

const MainHomeScreen: React.FC = () => {

  // modal only once (per app run)
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<any>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const navigation = useNavigation();


  useEffect(() => {
    if (!HAS_SHOWN_PICKUP_MODAL) {
      setModalVisible(true);
    }
  }, []);

  const handleCloseModal = () => {
    setModalVisible(false);
    HAS_SHOWN_PICKUP_MODAL = true; // mark as shown
  };
  const handleSaveData = (payload: any) => {
    // do something with payload if needed
    setModalVisible(false);
    HAS_SHOWN_PICKUP_MODAL = true; // mark as shown
  };

  // keep hook order stable
  const sectionListRef = useRef<SectionList<any>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const jumpingRef = useRef(false);
  const sections = useMemo(() => {
    return categories.map((category: any) => ({
      id: category._id,
      title: category.name,
      data: category._id === selectedCategoryId ? items : [],
    }));
  }, [categories, items, selectedCategoryId]);


  console.log('selectedCategoryId', selectedCategoryId)



  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const prasadType = await AsyncStorage.getItem('prasadType');
        if (!prasadType) throw new Error('No prasad type found.');

        const url = `/${prasadType}/foods`; // Adjust based on your backend route
        const response = await ApiGet(url);

        console.log('response', response)

        if (!Array.isArray(response.data)) {
          throw new Error('Invalid categories format');
        }

        setCategories(response.data);

        if (response.data.length > 0) {
          const firstCategoryId = response.data[0]._id;
          setSelectedCategoryId(firstCategoryId);
          fetchItemsForCategory(firstCategoryId);

        }
      } catch (err: any) {
        console.error('Category fetch failed:', err);
        Alert.alert('Error', 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);


  const fetchItemsForCategory = async (categoryId: string) => {
    try {
      const prasadType = await AsyncStorage.getItem('prasadType');
      if (!prasadType) throw new Error('No prasad type found.');

      const url = `/${prasadType}/food-item/${categoryId}`;
      const response = await ApiGet(url);

      console.log('response', response)

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid items format');
      }

      setItems(response.data);
      setSelectedCategoryId(categoryId);
    } catch (err) {
      console.error('Failed to fetch items for category:', err);
      // Alert.alert('Error', 'Could not load items for this category.');
    }
  };

const cartItems = useSelector((state: RootState) => Object.values(state.cart.items));

const handleContinue = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    const prasadType = await AsyncStorage.getItem('prasadType');
    if (!userId) throw new Error('User ID not found');

    console.log('cartItems', cartItems)
    const items = cartItems.map(item => ({
      foodItem: item.menuItem?._id, // or item.menuItem._id if nested
      quantity: item.quantity.toString(), // required as string in your schema
    }));

    const payload = { userId, items };
    console.log('Sending cart:', payload);

    const res = await ApiPost(`/${prasadType}/cart`, payload);
    console.log('Cart created:', res.data);

    navigation.navigate('Cart');
  } catch (error: any) {
    console.error('Cart creation failed:', error);
    Alert.alert('Error', error?.response?.data?.message || 'Cart creation failed');
  }
};

  const totalItems = cartItems.reduce((sum, item) => {
    const quantity = Number(item?.quantity || 0);
    return sum + quantity;
  }, 0);

  const totalAmount = cartItems.reduce((sum, item) => {
    const quantity = Number(item?.quantity || 0);
    const price = Number(item?.menuItem?.price || 0);
    return sum + (quantity * price);
  }, 0);


  const goToSection = (index: number) => {
    setActiveIndex(index);
    jumpingRef.current = true;
    sectionListRef.current?.scrollToLocation({
      sectionIndex: index, itemIndex: 0, animated: true, viewPosition: 0
    });
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (jumpingRef.current) return;
      const header = viewableItems.find(v => v.section && v.index == null);
      if (header?.section) {
        const idx = sections.findIndex(s => s.title === header.section.title);
        if (idx >= 0 && idx !== activeIndex) setActiveIndex(idx);
      }
    }
  ).current;
  // const handleContinue = () => {
  //   // Change "Location" to your actual route name if different
  //   navigation.navigate('Ordersummary');
  // };
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (!categories) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load menu</Text>
        {/* Modal can still show first time even if data failed */}
        <PickupDateModal visible={modalVisible} onClose={handleCloseModal} onSave={handleSaveData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header />

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsWrap}>
        {sections.map((s, i) => {
          const active = i === activeIndex;
          return (
            <TouchableOpacity
              key={s.title}
              onPress={() => {
                fetchItemsForCategory(s.id);
                goToSection(i);
              }}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {s.title.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item, index) => item?._id?.toString() || `item-${index}`}
        renderItem={({ item }) => <MenuItemCard item={item} />}
        renderSectionHeader={() => <View style={{ height: 8 }} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={() => { jumpingRef.current = false; }}
        onScrollEndDrag={() => { jumpingRef.current = false; }}
        scrollEventThrottle={16}
      />
      <View style={styles.stickyBar}>

        <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.9}>
          <View style={styles.cartRow}>
            <Icon name="shopping-cart" size={26} color="#fff" style={{ marginRight: 8 }} />

            <Text style={styles.ctaText}>Go to Cart</Text>

            <View style={styles.cartInfo}>
              <Text style={styles.cartDetails}>Items: ({totalItems})</Text>
              <Text style={styles.cartDetails}> ₹{totalAmount} </Text>
            </View>
          </View>
        </TouchableOpacity>

      </View>
      {/* One-time modal (dummy/in-memory) */}
      <PickupDateModal visible={modalVisible} onClose={handleCloseModal} onSave={handleSaveData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.text },
  errorText: { fontSize: 16, color: colors.error, textAlign: 'center' },
  contentContainer: { paddingBottom: 16 },
  pillsWrap: { paddingHorizontal: 16, paddingBottom: 6 },
  pill: {
    height: PILL_HEIGHT, paddingHorizontal: 22, borderRadius: 8,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    marginRight: 12, marginBottom: 15, alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: '#F6A313', borderColor: 'rgba(0,0,0,0.15)' },
  pillText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },

  stickyBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
    padding: 12,
    // backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // elevation (Android)
    elevation: 10,
  },
  backFab: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#f28c27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,



  },



  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    width: '100%',
  },



  cartInfo: {
    flexDirection: 'row',
    gap: 0,
    alignItems: 'center',
  },

  cartDetails: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 3,
    alignItems: "center"
  },

});

export default MainHomeScreen;
