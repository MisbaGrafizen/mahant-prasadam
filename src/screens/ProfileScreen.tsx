import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface ProfileData {
    name: string;
    pravruti: string;
    kshetra: string;
    designation: string;
    phoneNo: string;
    age: string;
}

interface ProfileScreenProps {
    navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const [profileData] = useState<ProfileData>({
        name: 'Swamibapa',
        pravruti: 'Bal Mandal',
        kshetra: 'Rajkot - 1',
        designation: 'Mandal Sanchalak',
        phoneNo: '9924022911',
        age: '---',
    });

    const handleNotificationPress = (): void => {
        console.log('Notification pressed');
        // Handle notification navigation
    };

    const handleMyProfilePress = (): void => {
        console.log('My profile pressed');
        // Handle profile edit navigation
    };

    const handleBackPress = (): void => {
        navigation?.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
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
                    onPress={handleNotificationPress}
                    activeOpacity={0.7}
                >
                    <Icon name="notifications" size={24} color="#FFFFFF" />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}


                {/* My Profile Button */}
                <TouchableOpacity
                    style={styles.myProfileButton}
                    onPress={handleMyProfilePress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.myProfileText}>My profile</Text>
                    <Icon name="chevron-right" size={24} color="#666666" />
                </TouchableOpacity>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Profile Avatar */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Icon name="person" size={60} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Profile Details */}
                    <View style={styles.profileDetails}>
                        {/* Name */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Name:</Text>
                            <Text style={styles.detailValue}>{profileData.name}</Text>
                        </View>

                        {/* Pravruti */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Pravruti:</Text>
                            <Text style={styles.detailValue}>{profileData.pravruti}</Text>
                        </View>

                        {/* Kshetra */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Kshetra:</Text>
                            <Text style={styles.detailValue}>{profileData.kshetra}</Text>
                        </View>

                        {/* Designation */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Designation:</Text>
                            <Text style={styles.detailValue}>{profileData.designation}</Text>
                        </View>

                        {/* Phone Number */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phone no:</Text>
                            <Text style={styles.detailValue}>{profileData.phoneNo}</Text>
                        </View>

                        {/* Age */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Age:</Text>
                            <Text style={styles.detailValue}>{profileData.age}</Text>
                        </View>
                    </View>
                </View>

                {/* Back Navigation Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={20} color="#666666" />
                </TouchableOpacity>
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
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
    myProfileButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
             borderWidth:1,
        borderColor: '#5b57574a',
   
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    myProfileText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
             borderWidth:1,
        borderColor: '#5b57574a',
    
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF9800',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileDetails: {
        gap: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        color: '#666666',
        flex: 2,
        textAlign: 'right',
        fontWeight: '500',
    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default ProfileScreen;