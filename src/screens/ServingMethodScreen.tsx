// src/screens/ServingMethodScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, StatusBar,
  TouchableOpacity, ScrollView, SectionList, ViewToken,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../theme/colors';
import { RootState } from '../store';
import Header from '../components/Header';
import PickupDateModal from '../components/PickupDateModal';
import ServingCard from '../components/ServingCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiGet, ApiPost } from '../helper/axios';

const PILL_HEIGHT = 44;
let HAS_SHOWN_PICKUP_MODAL = false;

const ServingMethodScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Pull from store (serving catalog)
  const { data: serving } = useSelector((s: RootState) => s.serving);

  // One-time modal (memory)
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (!HAS_SHOWN_PICKUP_MODAL) setModalVisible(true);
  }, []);
  const handleCloseModal = () => { setModalVisible(false); HAS_SHOWN_PICKUP_MODAL = true; };
  const handleSaveData = () => { setModalVisible(false); HAS_SHOWN_PICKUP_MODAL = true; };

  // Section list + pills logic
  const sectionListRef = useRef<SectionList<any>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [servingMethods, setServingMethods] = useState<any[]>([]);
  const jumpingRef = useRef(false);
  const [qtyById, setQtyById] = useState<Record<string, number>>({});


  const normalizeId = (it: any) => String(it?._id ?? it?.id ?? '');
  const getItemQty = (it: any) => qtyById[normalizeId(it)] ?? 0;
  const setItemQty = (it: any, next: number) => {
    const id = normalizeId(it);
    if (!id) return;
    setQtyById(prev => {
      const q = Math.max(0, next);
      const copy = { ...prev };
      if (q === 0) delete copy[id];
      else copy[id] = q;
      return copy;
    });
  };
  const incItem = (it: any) => setItemQty(it, getItemQty(it) + 1);
  const decItem = (it: any) => setItemQty(it, getItemQty(it) - 1);

  const mergeQuantity = (it: any) => {
    const id = normalizeId(it);
    const quantity = qtyById[id] ?? Number(it?.quantity ?? 0) ?? 0;
    return {
      ...(it || {}),
      id: it?.id ?? it?._id,   // keep both keys for downstream
      _id: it?._id ?? it?.id,
      quantity,
    };
  };

  const getAllItemsWithQty = () => {
    const all = servingMethods.flatMap((s: any) => s?.items ?? []);
    return all.map(mergeQuantity);
  };

  const getSelectedItems = () => {
    return getAllItemsWithQty().filter((it: any) => (Number(it.quantity) || 0) > 0);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const prasadType = await AsyncStorage.getItem('prasadType');


        const categoryRes = await ApiGet(`/${prasadType}/servingCategories`);
        console.log('categoryRes', categoryRes)
        const fetchedCategories = categoryRes.data || [];
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0]);
        }
      } catch (err) {
        console.error('Failed to fetch serving categories:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMethods = async () => {
      if (!selectedCategory) return;
      try {
        const prasadType = await AsyncStorage.getItem('prasadType');
        const methodRes = await ApiGet(`/${prasadType}/serving-method/${selectedCategory._id}`);
        console.log('methodRes', methodRes)
        const items = methodRes.data || [];
        setServingMethods([
          {
            name: selectedCategory.name || 'Items',
            items: items
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch serving methods:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, [selectedCategory]);

  // ✅ 3) PREFILL QUANTITIES from AsyncStorage (put in a useEffect once)
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('selectedServingItems');
        if (stored) {
          const parsed = JSON.parse(stored) as any[];
          const qmap: Record<string, number> = {};
          (parsed || []).forEach(it => {
            const id = normalizeId(it);
            const q = Number(it?.quantity ?? 0);
            if (id && q > 0) qmap[id] = q;
          });
          setQtyById(qmap);
        }
      } catch (e) {
        console.log('Prefill serving qty failed', e);
      }
    })();
  }, []);


  // Safely map data to sections (supports categories or sections shape)
  const sections = useMemo(() => {
    return servingMethods.map((section: any) => ({
      title: section.name ?? '',
      data: Array.isArray(section.items) ? section.items : [],
    }));
  }, [servingMethods]);

  const goToSection = (index: number) => {
    if (categories[index]) setSelectedCategory(categories[index]); // ⬅️ added
    const section = sections[index];
    if (!section || !section.data || section.data.length === 0) return;
    setActiveIndex(index);
    jumpingRef.current = true;
    sectionListRef.current?.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      viewPosition: 0,
      animated: true,
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


  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };


  const handleBack = () => navigation.goBack();

  // ✅ Continue — persist only the selected serving methods and navigate
  const handleContinue = async () => {
    try {
      const all = servingMethods.flatMap((s: any) => s?.items ?? []);

      const selected = all
        .map((it: any) => {
          const id = normalizeId(it);
          const q = qtyById[id] ?? Number(it?.quantity ?? 0) ?? 0;
          return { ...it, _id: it?._id ?? it?.id, id, quantity: q };
        })
        .filter((it: any) => Number(it.quantity) > 0);

      if (!selected.length) {
        Alert.alert('Select serving', 'Please add at least one serving method.');
        return;
      }

      // Store ONLY the selected serving methods with their quantities
      await AsyncStorage.setItem('selectedServingItems', JSON.stringify(selected));

      // Optional: also keep last selection for convenience
      await AsyncStorage.setItem('lastServingSelection', JSON.stringify(qtyById));

      // Navigate forward (no order creation here)
      navigation.navigate('Location', { selectedServingItems: selected });
    } catch (err: any) {
      console.error('Persist serving selection error:', err);
      Alert.alert('Error', 'Something went wrong while saving your selection.');
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading serving catalog…</Text>
      </View>
    );
  }

  if (!categories.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load serving catalog</Text>
        {/* <PickupDateModal visible={modalVisible} onClose={handleCloseModal} onSave={handleSaveData} /> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header />

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsWrap}>
        {categories.map((cat, i) => {
          const active = cat._id === selectedCategory?._id;
          return (
            <TouchableOpacity
              key={cat._id}
              onPress={() => goToSection(i)}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.9}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {cat.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Items */}
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServingCard
            item={item}
            quantity={getItemQty(item)}
            onIncrease={() => incItem(item)}
            onDecrease={() => decItem(item)}
          />
        )}
        renderSectionHeader={() => <View style={{ height: 8 }} />}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 /* space for sticky bar */ }]}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={() => { jumpingRef.current = false; }}
        onScrollEndDrag={() => { jumpingRef.current = false; }}
        scrollEventThrottle={16}
      />

      {/* Sticky bottom bar */}
      <View style={styles.stickyBar}>
        <TouchableOpacity style={styles.backFab} onPress={handleBack} activeOpacity={0.8}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.ctaText}>Continue to Location</Text>
        </TouchableOpacity>
      </View>

      {/* One-time modal */}

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
    height: PILL_HEIGHT,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: '#036197', borderColor: 'rgba(0,0,0,0.15)' },
  pillText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },

  // Sticky footer styles
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
    fontSize: 16,
  },
});

export default ServingMethodScreen;
