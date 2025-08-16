import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

const OrdersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="receipt" size={80} color={colors.textSecondary} />
      <Text style={styles.title}>No Orders Yet</Text>
      <Text style={styles.subtitle}>
        Your order history will appear here once you place your first order
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OrdersScreen;
