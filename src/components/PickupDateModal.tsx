import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  Dimensions, Animated, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiPost } from '../helper/axios';


const { height } = Dimensions.get('window');

interface PickupDateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: PickupData) => void;
}

interface PickupData {
  date: Date;
  time: Date;
  eventType: string;
}

const PickupDateModal: React.FC<PickupDateModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  // which modal picker is open?
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // dropdown animation (unchanged)
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const eventOptions = [
    { label: 'Parasabha', value: 'parasabha' },
    { label: 'Parayan', value: 'parayan' },
    { label: 'Utsav', value: 'utsav' },
    { label: 'Vishesh Sabha', value: 'visheshsabha' },
    // { label: 'Other', value: 'other' },
  ];

  const formatDate = (date: Date): string =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

  const formatTime = (time: Date): string =>
    time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const toggleDropdown = (): void => {
    const toValue = dropdownOpen ? 0 : 1;
    Animated.parallel([
      Animated.timing(dropdownAnimation, { toValue, duration: 300, useNativeDriver: false }),
      Animated.timing(rotateAnimation, { toValue, duration: 300, useNativeDriver: true }),
    ]).start();
    setDropdownOpen(!dropdownOpen);
  };

  const selectEventType = (option: { label: string; value: string }): void => {
    setSelectedEventType(option.value);
    toggleDropdown();
  };

const handleSave = async (): Promise<void> => {
  if (!selectedDate) {
    Alert.alert('Error', 'Please select a date');
    return;
  }

  if (!selectedTime) {
    Alert.alert('Error', 'Please select a time');
    return;
  }

  // if (!selectedEventType) {
  //   Alert.alert('Error', 'Please select an event type');
  //   return;
  // }

  try {
    const packageType = await AsyncStorage.getItem('prasadType');

    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    const formattedTime = selectedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const body = {
      pickupDate: formattedDate,
      pickupTime: formattedTime,
      eventName: selectedEventType,
    };

    const url = `/${packageType}/date`;
    const response = await ApiPost(url, body);

    console.log('response', response)

    await AsyncStorage.setItem('pickupDetails', JSON.stringify(response?.data?.data));

    Alert.alert('Success', 'Pickup date saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setSelectedEventType('');
          onClose();
        },
      },
    ]);
  } catch (error: any) {
    console.error('Pickup date save error:', error);
    Alert.alert('Error', error?.response?.data?.message || 'Failed to save pickup date.');
  }
};



  const dropdownHeight = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, eventOptions.length * 50],
  });

  const rotateArrow = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const getSelectedLabel = (): string => {
    const selected = eventOptions.find(o => o.value === selectedEventType);
    return selected ? selected.label : 'Select Event Type';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        // optional guard
        onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select the date of Pick-up</Text>
          </View>

          {/* Date & Time buttons */}
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setTimePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateTimeText}>{formatTime(selectedTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* Event description */}
          <Text style={styles.descriptionText}>Would you like to describe your event?</Text>

          {/* Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown} activeOpacity={0.7}>
              <Text style={[styles.dropdownButtonText, !selectedEventType && styles.placeholderText]}>
                {getSelectedLabel()}
              </Text>
              <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
                <Icon name="keyboard-arrow-down" size={24} color="#666666" />
              </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.dropdownList, { height: dropdownHeight }]}>
              {eventOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.dropdownOption, index === eventOptions.length - 1 && styles.lastOption]}
                  onPress={() => selectEventType(option)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownOptionText}>{option.label}</Text>
                  {selectedEventType === option.value && <Icon name="check" size={20} color="#FF9800" />}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveButton, !selectedEventType && styles.disabledButton]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!selectedEventType}
          >
            <Text style={styles.saveButtonText}>Save the date</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom sheet DATE picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={selectedDate}
        minimumDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
        onConfirm={(d) => { setSelectedDate(d); setDatePickerVisible(false); }}
        onCancel={() => setDatePickerVisible(false)}
      // Looks like a bottom modal by default; tweak if you want:
      // pickerContainerStyleIOS={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      // headerTextIOS="Pick a date"
      />

      {/* Bottom sheet TIME picker */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        date={selectedTime}
        onConfirm={(t) => { setSelectedTime(t); setTimePickerVisible(false); }}
        onCancel={() => setTimePickerVisible(false)}
      // headerTextIOS="Pick a time"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 400,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 16,
  },
  modalHeader: { backgroundColor: '#FF9800', paddingVertical: 20, paddingHorizontal: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  dateTimeContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 32, gap: 16 },
  dateTimeButton: {
    flex: 1, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 8,
    paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#FAFAFA',
  },
  dateTimeText: { fontSize: 16, fontWeight: '600', color: '#333333' },
  descriptionText: { fontSize: 16, color: '#666666', textAlign: 'center', marginTop: 32, marginBottom: 24, paddingHorizontal: 24 },
  dropdownContainer: { paddingHorizontal: 24, marginBottom: 32 },
  dropdownButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#FAFAFA',
  },
  dropdownButtonText: { fontSize: 16, fontWeight: '500', color: '#333333' },
  placeholderText: { color: '#999999' },
  dropdownList: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderTopWidth: 0,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  lastOption: { borderBottomWidth: 0 },
  dropdownOptionText: { fontSize: 16, color: '#333333' },
  saveButton: {
    backgroundColor: '#4CAF50', paddingVertical: 18, marginHorizontal: 24, marginBottom: 24,
    borderRadius: 8, alignItems: 'center', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  disabledButton: { backgroundColor: '#CCCCCC', shadowOpacity: 0, elevation: 0 },
  saveButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});

export default PickupDateModal;
