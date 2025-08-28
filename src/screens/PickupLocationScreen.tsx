import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PickupDateModal from '../components/OthersModal/NormalDateModal';
import Header from '../components/Header';
import { ApiGet, ApiPost } from '../helper/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Location {
  id: string;
  name: string;
  image?: string;
}

interface PickupLocationScreenProps {
  navigation?: any;
}

const PickupLocationScreen: React.FC<PickupLocationScreenProps> = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // 27/08/2025
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);


  useEffect(() => {
    const fetchLocations = async () => {
      const prasadType = await AsyncStorage.getItem('prasadType');
      console.log('prasadType', prasadType)

      try {
        const response = await ApiGet(`/admin/premvati`);
        console.log('response', response)
        if (response?.status === 'success') {
          const normalized: Location[] = (response.data || []).map((loc: any) => ({
            id: String(loc._id ?? loc.id ?? ''),
            name: String(loc.name ?? 'Unnamed'),
            image: loc.image ?? undefined,
          }));
          setLocations(normalized);
        } else {
          console.warn('Failed to fetch locations:', response);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);
  // const locations: Location[] = [
  //   {
  //     id: 'kalawad-road',
  //     name: 'Kalawad Road',
  //     image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-23%20at%2010.15.50%E2%80%AFAM-uDdkAWV5ZEOmPQhnvFT8hh7iK9YlDW.png', // Replace with actual image
  //     available: true,
  //   },
  //   {
  //     id: 'university',
  //     name: 'University',
  //      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-23%20at%2010.15.50%E2%80%AFAM-uDdkAWV5ZEOmPQhnvFT8hh7iK9YlDW.png', // Replace with actual image
  //     available: true,
  //   },
  //   {
  //     id: 'mavdi',
  //     name: 'Mavdi',
  //  image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-23%20at%2010.15.50%E2%80%AFAM-uDdkAWV5ZEOmPQhnvFT8hh7iK9YlDW.png', // Replace with actual image
  //     available: true,
  //   },
  //   {
  //     id: 'pramukhrvatika',
  //     name: 'Pramukhrvatika',
  //  image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-23%20at%2010.15.50%E2%80%AFAM-uDdkAWV5ZEOmPQhnvFT8hh7iK9YlDW.png', // Replace with actual image
  //     available: true,
  //   },
  // ];

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleLocationSelect = (locationId: string): void => {
    setSelectedLocation(locationId);
  };

  const handleDatePress = (): void => {
    setShowDateModal(true);
  };

  const handleDateSave = (data: any): void => {
    setSelectedDate(data.date);
    setShowDateModal(false);
  };

  const handleBackPress = (): void => {
    navigation?.goBack();
  };

  const handleOrderSummary = (): void => {
    if (!selectedLocation) {
      Alert.alert('Please select a pickup location');
      return;
    }

    console.log('Proceeding with:', {
      location: selectedLocation,
      date: selectedDate,
    });

    // Navigate to order summary
    // navigation?.navigate('OrderSummary', { location: selectedLocation, date: selectedDate });
  };

  const handleBack = () => {
    navigation.goBack();
  };

const handleContinue = async () => {
  if (!selectedLocation) {
    Alert.alert('Select Location', 'Please select a pickup location.');
    return;
  }

  try {
    setSubmitting(true);

    // 1) Read selection & basics
    const [storedServing, userId, prasadType, pickupDate] = await Promise.all([
      AsyncStorage.getItem('selectedServingItems'),
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('prasadType'),
      AsyncStorage.getItem('pickupDetails'), 
    ]);
    console.log('pickupDate', pickupDate)

    if (!userId || !prasadType) {
      Alert.alert('Missing info', 'User or prasad type not found.');
      return;
    }

    // 2) Ensure serving methods selected (robust parse)
    let selectedServing: any[] = [];
    try {
      selectedServing = storedServing ? JSON.parse(storedServing) : [];
    } catch {
      selectedServing = [];
    }

    const selected = (selectedServing || [])
      .map((it: any) => ({
        _id: String(it?._id ?? it?.id ?? ''),
        quantity: Number(it?.quantity ?? 0),
      }))
      .filter((it: any) => it._id && it.quantity > 0);

    if (!selected.length) {
      Alert.alert('Select serving', 'Please add at least one serving method.');
      return;
    }

    // 3) Build payload for backend
    const servingMethodId = selected.map((it: any) => ({
      servingMethod: it._id,
      quantity: it.quantity,
    }));

    // 4) Create order
    const path = `/${prasadType}/create_order`;
    const res = await ApiPost(path, { userId, servingMethodId });

    const ok =
      res?.status === 201 ||
      res?.data?.message === 'Order created successfully' ||
      res?.data?.status === 'success';

    if (!ok) {
      Alert.alert('Order failed', res?.data?.message ?? 'Could not create order.');
      return;
    }

    const orderPayload = res?.data?.data ?? res?.data ?? {};
    const orderId = String(orderPayload?._id ?? orderPayload?.id ?? '');

    // 5) Persist pickup meta and order for later screens
    await Promise.all([
      AsyncStorage.setItem('selectedPickupLocation', selectedLocation),
      AsyncStorage.setItem('lastCreatedOrder', JSON.stringify(orderPayload)),
    ]);

    // 6) Navigate to Order Summary with state
    navigation.navigate('Ordersummary', {
      pickupLocationId: selectedLocation,
      pickupDate: pickupDate?.pickupDate?.toISOString(),
      order: orderPayload,
      orderId,
    });
  } catch (error: any) {
    console.error('Error on continue/create order:', error);
    Alert.alert('Error', error?.response?.data?.message ?? 'Something went wrong while creating the order.');
  } finally {
    setSubmitting(false);
  }
};



  console.log('Location', locations)

    const renderLocationCard = (location: Location) => {
    const isSelected = selectedLocation === location.id;

    return (
      <TouchableOpacity
        key={location.id}
        style={[
          styles.locationCard,
          isSelected && styles.selectedLocationCard,
        ]}
        onPress={() => handleLocationSelect(location.id)}
        activeOpacity={0.7}
      >
        {location.image ? (
          <View style={styles.cardImageContainer}>
            <Image source={{ uri: location.image }} style={styles.cardImage} resizeMode="cover" />
          </View>
        ) : (
          <View style={styles.cardPlaceholder} />
        )}

        <View style={[styles.cardLabel, styles.availableLabel]}>
          <Text style={styles.cardLabelText}>{location.name}</Text>
          {isSelected && <Icon name="check-circle" size={20} color="#FFFFFF" />}
        </View>

        {/* Always show Coming Soon */}
        {/* <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Coming Soon</Text>
        </View> */}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={{ marginTop: "-14%" }}>
        <Header />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Buttons */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.locationHeaderButton} activeOpacity={0.8}>
            <Text style={styles.locationHeaderText}>Select your location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateHeaderButton}
            onPress={handleDatePress}
            activeOpacity={0.8}
          >
            <Icon name="event" size={20} color="#FFFFFF" style={styles.calendarIcon} />
            <Text style={styles.dateHeaderText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Location Grid */}
        <View style={styles.locationGrid}>
          {locations.map((location) => renderLocationCard(location))}
        </View>

        {/* Bottom Buttons */}

      </ScrollView>
      <View style={styles.stickyBar}>
        <TouchableOpacity style={styles.backFab} onPress={handleBack} activeOpacity={0.8}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.ctaText}>{submitting ? 'Placing…' : 'Order Summary'}</Text>
        </TouchableOpacity>
      </View>
      {/* Date Picker Modal */}
      <PickupDateModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSave={handleDateSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginHorizontal: 10
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  locationHeaderButton: {
    flex: 2,
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9800',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  locationHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dateHeaderButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FF9800',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  locationCard: {
    width: (width - 53) / 2, // 2 columns with gaps
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedLocationCard: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
  },
  unavailableCard: {
    opacity: 0.6,
  },
  cardImageContainer: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cardLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableLabel: {
    backgroundColor: '#FF9800',
  },
  unavailableLabel: {
    backgroundColor: '#CCCCCC',
  },
  cardLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 'auto',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '500',
  },
  orderSummaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  orderSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
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

export default PickupLocationScreen;