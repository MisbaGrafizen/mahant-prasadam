// src/screens/ServingMethodScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, StatusBar,
  TouchableOpacity, ScrollView, SectionList, ViewToken
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../theme/colors';
import { RootState } from '../store';
import Header from '../components/Header';
import PickupDateModal from '../components/PickupDateModal';
import ServingCard from '../components/ServingCard';

const PILL_HEIGHT = 44;
let HAS_SHOWN_PICKUP_MODAL = false;

const ServingMethodScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Pull from store (serving catalog)
  const { data: serving, loading } = useSelector((s: RootState) => s.serving);

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
  const jumpingRef = useRef(false);

  // Safely map data to sections (supports categories or sections shape)
  const sections = useMemo(() => {
    const d = serving;
    if (!d) return [];
    if (Array.isArray((d as any).categories)) {
      return (d as any).categories.map((c: any) => ({
        title: c.name ?? '',
        data: Array.isArray(c.items) ? c.items : [],
      }));
    }
    if (Array.isArray((d as any).sections)) {
      return (d as any).sections.map((s: any) => ({
        title: s.name ?? '',
        data: Array.isArray(s.items) ? s.items : [],
      }));
    }
    return [];
  }, [serving]);

  const goToSection = (index: number) => {
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

  // Handlers for sticky footer
  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    // Change "Location" to your actual route name if different
    navigation.navigate('Location');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading serving catalog…</Text>
      </View>
    );
  }

  if (!sections.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load serving catalog</Text>
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

      {/* Items */}
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServingCard item={item} />}
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
