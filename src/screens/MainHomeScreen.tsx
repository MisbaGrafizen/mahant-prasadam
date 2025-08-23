// MainHomeScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, StatusBar,
  TouchableOpacity, ScrollView, SectionList, ViewToken
} from 'react-native';
import { useSelector } from 'react-redux';

import { colors } from '../theme/colors';
import { RootState } from '../store';
import MenuItemCard from '../components/MenuItemCard';
import Header from '../components/Header';
import PickupDateModal from '../components/PickupDateModal';

const PILL_HEIGHT = 44;

// ---- Dummy one-time flag (in-memory, per app run) ----
let HAS_SHOWN_PICKUP_MODAL = false;

const MainHomeScreen: React.FC = () => {
  const { data: restaurant, loading } = useSelector((s: RootState) => s.restaurant);

  // modal only once (per app run)
  const [modalVisible, setModalVisible] = useState(false);
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

  const sections = useMemo(
    () => restaurant ? restaurant.sections.map(s => ({ title: s.name, data: s.items })) : [],
    [restaurant]
  );

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

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (!restaurant) {
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
              onPress={() => goToSection(i)}
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
        keyExtractor={(item) => item.id}
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
});

export default MainHomeScreen;
