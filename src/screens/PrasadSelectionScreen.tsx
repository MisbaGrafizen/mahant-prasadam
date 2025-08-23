import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import packagingImage from '../assets/images/packaging.png'

const { width, height } = Dimensions.get('window');

interface PrasadSelectionScreenProps {
  navigation?: any;
}

const PrasadSelectionScreen: React.FC<PrasadSelectionScreenProps> = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);

const handleOptionSelect = (option: 'pre-packaged' | 'self-serving') => {
  setSelectedOption(option);

  if (option === 'self-serving') {
    // go straight to Home tab
    navigation.replace('MainTabs');
  } else if (option === 'pre-packaged') {
    // go to the full tab navigator (default tab will open)
    navigation.replace('MainTabs');
  }
};


  const handleBackPress = (): void => {
    navigation?.goBack();
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent /> */}
      
      {/* Background Image */}
      <ImageBackground
        source={packagingImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
          locations={[0, 0.7, 1]}
          style={styles.overlay}
        >
          {/* Back Button */}
          {/* <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity> */}

      
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Close Button */}
        

                {/* Modal Title */}
                <Text style={styles.modalTitle}>Select your prasad packaging</Text>

                {/* Selection Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.selectionButton,
                      selectedOption === 'pre-packaged' && styles.selectedButton
                    ]}
                    onPress={() => handleOptionSelect('pre-packaged')}
                    activeOpacity={0.8}
                  >
                    <Icon 
                      name="inventory" 
                      size={24} 
                      color="#FFFFFF" 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Pre-Packaged</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.selectionButton,
                      selectedOption === 'self-serving' && styles.selectedButton
                    ]}
                    onPress={() => handleOptionSelect('self-serving')}
                    activeOpacity={0.8}
                  >
                    <Icon 
                      name="restaurant" 
                      size={24} 
                      color="#FFFFFF" 
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Self Serving</Text>
                  </TouchableOpacity>
                </View>
    
              </View>
            </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
   height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    objectFit: 'cover',
    minHeight: height
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,

  },
  modalContent: {
    backgroundColor: '#FFFFFF',
 width: '91%',
 marginHorizontal: 16,

    borderRadius: 17,
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 130,
    position: 'absolute',
    marginVertical:0,
    bottom: "15%",
    left: 0,
    right: 0
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  selectionButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
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
    elevation: 8,
  },
  selectedButton: {
    backgroundColor: '#FF9800',
    transform: [{ scale: 0.98 }],
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  proceedButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PrasadSelectionScreen;