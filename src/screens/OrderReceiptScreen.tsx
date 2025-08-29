"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import Header from "../components/Header"
import { useRoute } from "@react-navigation/native"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ApiGet } from "../helper/axios"


interface OrderItem {
  id: string
  name: string
  quantity: number
  amount: number
}

interface OrderSection {
  title: string
  items: OrderItem[]
  totalAmount: number
}

interface OrderReceiptData {
  orderId: string
  orderDate: string
  orderFor: string
  pickupLocation: string
  sections: OrderSection[]
  grandTotal: number
}

const OrderReceiptScreen: React.FC = () => {

  const [receiptData, setReceiptData] = useState<OrderReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  const route = useRoute<any>();
  const orderData = route?.params?.receipt;
  const orderId = orderData?.orderId;

  console.log('orderId', orderId)


  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const prasadType = await AsyncStorage.getItem("prasadType");
        const response = await ApiGet(`/${prasadType}/order-receipt/${orderId}`);
        console.log('response', response)

        if (response?.status === "success") {
          const data = response.data;

          const itemsSection = {
            title: "Items",
            totalAmount: data.totalFoodItemsPrice || 0,
            items: data.orderSummary.items?.map((item, index) => ({
              id: `${index}`,
              name: item.foodItem?.name || "Unknown Item",
              quantity: item.quantity,
              amount: item.totalPrice,
            })),
          };

          const servingSection = {
            title: "Serving Methods",
            totalAmount: data.totalServingMethodPrice || 0,
            items: data.orderSummary.servingMethodId?.map((serving, index) => ({
              id: `s-${index}`,
              name: serving.servingMethod?.name || "Serving",
              quantity: serving?.quantity,
              amount: serving?.totalPrice || 0,
            })),
          };

          setReceiptData({
            orderId: data.orderSummary._id,
            orderDate: data.orderSummary.createdAt,
            orderFor: data.orderSummary.orderDate?.pickupDate,
            pickupLocation: data.orderSummary.pickupLocation?.name,
            grandTotal: data.totalAmount,
            sections: [itemsSection, servingSection],
          });
        } else {
          Alert.alert("Failed", response?.data?.message || "Failed to fetch receipt");
        }
      } catch (err: any) {
        console.error("Receipt fetch failed", err);
        Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchReceipt();
  }, [orderId]);




  const handleBackToOrders = (): void => {
    console.log("Navigate back to orders listing")
  }

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, styles.itemsColumn]}>Items</Text>
      <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
      <Text style={[styles.tableHeaderText, styles.amtColumn]}>Amt</Text>
    </View>
  )

  const renderTableRow = (item: OrderItem) => (
    <View key={item.id} style={styles.tableRow}>
      <Text style={[styles.tableRowText, styles.itemsColumn]}>{item.name}</Text>
      <Text style={[styles.tableRowText, styles.qtyColumn]}>{item.quantity}</Text>
      <Text style={[styles.tableRowText, styles.amtColumn]}>{item.amount}</Text>
    </View>
  )

  const renderTotalRow = (totalAmount: number) => (
    <View style={styles.totalRow}>
      <Text style={[styles.totalRowText, styles.itemsColumn]}>Total amount</Text>
      <Text style={[styles.totalRowText, styles.qtyColumn]}>N/A</Text>
      <Text style={[styles.totalRowText, styles.amtColumn]}>{totalAmount}</Text>
    </View>
  )

  const renderSection = (section: OrderSection, index: number) => (
    <View key={index} style={styles.section}>
      {renderTableHeader()}
      {section.items?.map((item) => renderTableRow(item))}
      <View style={styles.divider} />
      {renderTotalRow(section.totalAmount)}
    </View>
  )

  return (
    <>
      <View style={styles.container}>
        <Header />

        <SafeAreaView style={styles.container}>

          <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerText}>Order confirmation receipt</Text>
            </View>

            {/* Receipt Card */}
            <View style={styles.receiptCard}>
              {/* Order Details */}
              <View style={styles.orderDetails}>
                <Text style={styles.orderDetailText}>Order ID {receiptData?.orderId}</Text>
                <Text style={styles.orderDetailText}>Order on - {receiptData?.orderDate}</Text>
                <Text style={styles.orderDetailText}>Order for - {receiptData?.orderFor}</Text>
                <Text style={styles.orderDetailText}>Pickup location - {receiptData?.pickupLocation}</Text>
              </View>

              {/* Order Sections */}
              {receiptData?.sections?.map((section, index) => renderSection(section, index))}

              {/* Grand Total */}
              <View style={styles.grandTotalSection}>
                <View style={styles.grandTotalRow}>
                  <Text style={[styles.grandTotalText, styles.itemsColumn]}>GRAND TOTAL</Text>
                  <Text style={[styles.grandTotalText, styles.qtyColumn]}>N/A</Text>
                  <Text style={[styles.grandTotalText, styles.amtColumn]}>{receiptData?.grandTotal}</Text>
                </View>
              </View>
            </View>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackToOrders} activeOpacity={0.8}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back to orders listing</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  receiptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  orderDetails: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderDetailText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  tableRowText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  totalRowText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  grandTotalSection: {
    marginTop: 1,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
  },
  grandTotalRow: {
    flexDirection: "row",
    paddingVertical: 16,
    backgroundColor: "#F0F8F0",
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  grandTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  itemsColumn: {
    flex: 3,
    textAlign: "left",
  },
  qtyColumn: {
    flex: 1,
    textAlign: "center",
  },
  amtColumn: {
    flex: 1,
    textAlign: "right",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    fontWeight: "800",

    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#F44336",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default OrderReceiptScreen
