import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, StatusBar } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors';
import { selectOrders, Order } from '../store/slices/ordersSlice';
import { formatINR } from '../utils/currency';
import Header from '../components/Header';

const OrdersScreen: React.FC = () => {
  const orders = useSelector(selectOrders);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Header />

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={80} color={colors.textSecondary} />
          <Text style={styles.title}>No Orders Yet</Text>
          <Text style={styles.subtitle}>
            Your order history will appear here once you place your first order
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}                 // only this scrolls
          contentContainerStyle={styles.listContent}
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const when = new Date(order.createdAt).toLocaleString();

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        {order.items.slice(0, 3).map((it) => (
          <Image key={it.id} source={{ uri: it.image }} style={styles.itemImage} />
        ))}

        <View style={{ flex: 1 }}>
          <Text style={styles.orderTitle}>Order #{order.id.slice(0, 6).toUpperCase()}</Text>
          <Text style={styles.meta}>{when}</Text>
          <Text style={styles.meta}>{itemCount} items • {formatINR(order.subtotal)}</Text>
        </View>

        <Text style={styles.total}>{formatINR(order.total)}</Text>
      </View>

      <View style={styles.itemsWrap}>
        {order.items.slice(0, 3).map((it) => (
          <Text key={it.id} style={styles.itemLine}>
            {it.quantity} × {it.name} — {formatINR(it.lineTotal)}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.more}>+{order.items.length - 3} more</Text>
        )}
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.meta}>Delivery: {formatINR(order.deliveryFee)}</Text>
        <Text style={styles.meta}>GST: {formatINR(order.tax)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingVertical: 12 },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, paddingHorizontal: 32,
  },

  // cards
  card: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 12,
    backgroundColor: colors.card, padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemImage: { width: 80, height: 80, borderRadius: 6, marginRight: 16, backgroundColor: colors.surface },
  orderTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  total: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginLeft: 8 },
  itemsWrap: { marginTop: 10, marginBottom: 8 },
  itemLine: { fontSize: 13, color: colors.text },
  more: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  // empty view text
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});

export default OrdersScreen;
