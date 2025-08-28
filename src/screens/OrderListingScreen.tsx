"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from "react-native"
import Header from "../components/Header"

interface Order {
  id: string
  orderId: string
  orderDate: string
  orderFor: string
  pickupLocation: string
  status: "paid" | "unpaid"
  items: Array<{
    name: string
    quantity: number
    amount: number
  }>
  grandTotal: number
}

interface OrderListingScreenProps {
  navigation?: any
}

const OrderListingScreen: React.FC<OrderListingScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid">("unpaid")

  const orders: Order[] = [
    {
      id: "1",
      orderId: "68a7f7536a84f5a00a0f9191",
      orderDate: "08/22/2025",
      orderFor: "August 27th 2025, 5:30:00 am",
      pickupLocation: "Kalawad Road",
      status: "unpaid",
      items: [
        { name: "BISC. BADAM PISTA 250 GM", quantity: 2, amount: 120 },
        { name: "test", quantity: 2, amount: 8 },
      ],
      grandTotal: 128,
    },
    {
      id: "2",
      orderId: "679db6794db1ac8ad97f14a4",
      orderDate: "08/22/2025",
      orderFor: "February 4th 2025, 5:30:00 am",
      pickupLocation: "Mavdi",
      status: "unpaid",
      items: [{ name: "BISC. BADAM PISTA 250 GM", quantity: 2, amount: 120 }],
      grandTotal: 120,
    },
    {
      id: "3",
      orderId: "68a7f76a6a84f5a00a0f9ff0",
      orderDate: "08/22/2025",
      orderFor: "08/27/2025",
      pickupLocation: "Pramukhvatika",
      status: "paid",
      items: [
        { name: "BISC. BADAM PISTA 250 GM", quantity: 2, amount: 120 },
        { name: "test", quantity: 2, amount: 8 },
      ],
      grandTotal: 128,
    },
  ]

  const filteredOrders = orders.filter((order) => order.status === activeTab)

  const handleOrderPress = (order: Order): void => {
    navigation?.navigate("OrderDetail", { order })
  }

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
      activeOpacity={0.7}
    >
      <View style={styles.orderContent}>
        <Text style={styles.orderIdText}>Order ID - {order.orderId}</Text>
        <Text style={styles.orderDetailText}>Order on - {order.orderDate}</Text>
        <Text style={styles.orderDetailText}>Order for - {order.orderFor}</Text>
        <Text style={styles.orderDetailText}>Pickup location - {order.pickupLocation}</Text>
      </View>

      <View style={[styles.statusBadge, order.status === "paid" ? styles.paidBadge : styles.unpaidBadge]}>
        <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Header />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>
              Order list &gt; {activeTab === "unpaid" ? "Unpaid order list" : "Paid order list"}
            </Text>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "unpaid" ? styles.activeUnpaidTab : styles.inactiveTab]}
              onPress={() => setActiveTab("unpaid")}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === "unpaid" ? styles.activeTabText : styles.inactiveTabText]}>
                Unpaid order list
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "paid" ? styles.activePaidTab : styles.inactiveTab]}
              onPress={() => setActiveTab("paid")}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === "paid" ? styles.activeTabText : styles.inactiveTabText]}>
                Paid order list
              </Text>
            </TouchableOpacity>
          </View>

          {/* Order List */}
          <View style={styles.orderList}>{filteredOrders.map((order) => renderOrderCard(order))}</View>

          {filteredOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No {activeTab} orders found</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {

    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  breadcrumb: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeUnpaidTab: {
    backgroundColor: "#F44336",
  },
  activePaidTab: {
    backgroundColor: "#4CAF50",
  },
  inactiveTab: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  inactiveTabText: {
    color: "#666666",
  },
  orderList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  orderContent: {
    paddingRight: 80,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    lineHeight: 20,
  },
  statusBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paidBadge: {
    backgroundColor: "#4CAF50",
  },
  unpaidBadge: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
})

export default OrderListingScreen
