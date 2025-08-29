"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from "react-native"
import Header from "../components/Header"
import { ApiGet } from "../helper/axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  const [paidOrders, setPaidOrders] = useState<Order[]>([])
const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([])
const [loading, setLoading] = useState(true)


const filteredOrders = activeTab === "paid" ? paidOrders : unpaidOrders

 const formatOrder = (order: any): Order => ({
  id: order._id,
  orderId: order?.orderId?._id || "",
  orderDate: order.createdAt?.split("T")[0] || "",
  orderFor: order.orderDate?.pickupDate?.split("T")[0] || "",
  pickupLocation: order.pickupLocation?.name || "N/A",
  status: order.orderType === "paid" ? "paid" : "unpaid",

  items: (order?.orderId?.items || []).map((item: any) => ({
    name: item?.foodItem?.name || "Unnamed",
    quantity: item?.quantity || 0,
    amount: item?.totalPrice || 0,
    price: item?.foodItem?.price || 0,
    id: item?._id,
    foodItemId: item?.foodItem?._id,
  })),

  servingMethods: (order?.orderId?.servingMethodId || []).map((method: any) => ({
    name: method?.servingMethod?.name || "Unknown",
    quantity: method?.quantity || 0,
    amount: method?.totalPrice || 0,
    price: method?.servingMethod?.price || 0,
    id: method?._id,
    servingMethodId: method?.servingMethod?._id,
  })),

  user: {
    id: order?.userId?._id,
    name: order?.userId?.name,
  },

  pickupDetails: {
    id: order?.orderDate?._id,
    pickupDate: order?.orderDate?.pickupDate,
    pickupTime: order?.orderDate?.pickupTime,
  },

  totalFoodItemsPrice: (order?.orderId?.items || []).reduce((sum: number, item: any) => sum + (item?.totalPrice || 0), 0),

  totalServingMethodPrice: (order?.orderId?.servingMethodId || []).reduce((sum: number, method: any) => sum + (method?.totalPrice || 0), 0),

  totalAmount: order?.orderId?.totalAmount || 0,

  createdAt: order?.orderId?.createdAt,
  updatedAt: order?.orderId?.updatedAt,
})



  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const prasadType = await AsyncStorage.getItem("prasadType")
      const userId = await AsyncStorage.getItem("userId")
      if (!userId || !prasadType) return

      // Unpaid Orders
      const unpaidRes = await ApiGet(`/${prasadType}/order-receipts/unpaid/${userId}`)
      console.log('unpaidRes', unpaidRes)
      if (unpaidRes?.status === "success") {
        const formattedUnpaid = unpaidRes.data?.map(formatOrder)
        console.log('formattedUnpaid', formattedUnpaid)
        setUnpaidOrders(formattedUnpaid)
      }

      // Paid Orders
      const paidRes = await ApiGet(`/${prasadType}/order-receipts/paid/${userId}`)
      if (paidRes?.status === "success") {
        const formattedPaid = paidRes.data?.map(formatOrder)
        setPaidOrders(formattedPaid)
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchOrders()
}, [])


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
