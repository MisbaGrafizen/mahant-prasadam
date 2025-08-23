import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { selectCartTotalItems } from '../store/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
interface HeaderProps {
  title: string;
  onCartPress?: () => void;
  showCart?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onCartPress, showCart = true }) => {
  const cartTotalItems = useSelector(selectCartTotalItems);

  return (
    <>

           <View style={styles.header}>

                    <View style={styles.headerLeft}>
                        <View style={styles.profileIconContainer}>
                            <Icon name="person" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Swamibapa</Text>
                            <Text style={styles.headerSubtitle}>Mandal Sanchalak</Text>
                        </View>
                    </View>
    
                    <TouchableOpacity
                        style={styles.notificationButton}
             
                        activeOpacity={0.7}
                    >
                        <Icon name="notifications" size={24} color="#FFFFFF" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>
    </>
  );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop:"14%",
        borderWidth:1,
        borderColor: '#5b57574a',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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


   headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF9800',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF9800',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5722',
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
