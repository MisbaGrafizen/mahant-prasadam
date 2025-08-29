"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { launchImageLibrary } from "react-native-image-picker"
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
  servingMethods?: Array<{
    name: string
    quantity: number
    amount: number
  }>
  grandTotal: number
}

interface OrderDetailScreenProps {
  route?: any
  navigation?: any
}

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ route, navigation }) => {



  const [activeTab, setActiveTab] = useState<"receipt" | "payment">("receipt")
  const order: Order = route?.params?.order || {
    id: "1",
    orderId: "68a7f67e6a84f5a00a0f9115",
    orderDate: "08/22/2025",
    orderFor: "September 22nd 2025, 5:30:00 am",
    pickupLocation: "Kalawad Road",
    status: "unpaid",
    items: [
      { name: "BISC. BADAM PISTA 250 GM", quantity: 2, amount: 120 },
      { name: "test", quantity: 2, amount: 8 },
    ],
    grandTotal: 128,
  }
// useEffect(() => {
//   const fetchOrderReceipt = async () => {
//     const prasadType = await AsyncStorage.getItem("prasadType")
//     const id = route?.params?.order?.orderId

//     if (!id) return

//     try {
//       const response = await ApiGet(`${prasadType}/order-receipt/${id}`)

//       const formattedOrder = {
//         id: response?.data?.orderSummary?._id,
//         orderId: response?.data?.orderSummary?._id,
//         orderDate: response?.data?.orderSummary?.createdAt?.split("T")[0],
//         orderFor: response?.data?.orderSummary?.orderDate?.pickupDate?.split("T")[0],
//         pickupLocation: response?.data?.orderSummary?.pickupLocation?.name,
//         status: "unpaid",
//         items: response?.data?.orderSummary?.items.map((item: any) => ({
//           name: item.foodItem?.name,
//           quantity: item.quantity,
//           amount: item.totalPrice,
//         })),
//         servingMethods: response?.data?.orderSummary?.servingMethodId.map((method: any) => ({
//           name: method.servingMethod?.name,
//           quantity: method.quantity,
//           amount: method.totalPrice,
//         })),
//         grandTotal: response?.data?.totalAmount,
//       }

//       setOrders(formattedOrder)
//     } catch (error) {
//       console.error("Failed to fetch receipt:", error)
//       Alert.alert("Error", "Could not fetch receipt details.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   fetchOrderReceipt()
// }, [route?.params?.order?.orderId])

console.log('order', order)


  const handleBackToOrders = (): void => {
    navigation?.goBack()
  }

  const handleViewReceipt = (): void => {
    setActiveTab("receipt")
  }

  const handlePayOutstanding = (): void => {
    setActiveTab("payment")
  }

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, styles.itemsColumn]}>Items</Text>
      <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
      <Text style={[styles.tableHeaderText, styles.amtColumn]}>Amt</Text>
    </View>
  )

  const renderTableRow = (item: any, index: number) => (
    <View key={index} style={styles.tableRow}>
      <Text style={[styles.tableRowText, styles.itemsColumn]}>{item.name}</Text>
      <Text style={[styles.tableRowText, styles.qtyColumn]}>{item.quantity}</Text>
      <Text style={[styles.tableRowText, styles.amtColumn]}>{item.amount}</Text>
    </View>
  )

  const renderReceipt = () => (
    <View style={[styles.receiptCard, order.status === "unpaid" && styles.unpaidReceiptCard]}>
      {/* Order Details */}
      <View style={styles.orderDetails}>
        <Text style={styles.orderDetailText}>Order ID {order.orderId}</Text>
        <Text style={styles.orderDetailText}>Order on - {order.orderDate}</Text>
        <Text style={styles.orderDetailText}>Order for - {order.orderFor}</Text>
        <Text style={styles.orderDetailText}>Pickup location - {order.pickupLocation}</Text>
      </View>

      {/* Items Table */}
      {renderTableHeader()}
      {order.items.map((item, index) => renderTableRow(item, index))}

      <View style={styles.divider} />
      {order.servingMethods?.length > 0 && (
  <>
    <View style={styles.divider} />
    <Text style={[styles.orderDetailText, { marginTop: 12, fontWeight: "bold" }]}>
      Serving Methods
    </Text>
    {renderTableHeader()}
    {order.servingMethods.map((method, index) => renderTableRow(method, index))}
  </>
)}


      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={[styles.totalRowText, styles.itemsColumn]}>Total amount</Text>
        <Text style={[styles.totalRowText, styles.qtyColumn]}>N/A</Text>
        <Text style={[styles.totalRowText, styles.amtColumn]}>{order.grandTotal}</Text>
      </View>

      <View style={styles.grandTotalSection}>
        <View style={styles.grandTotalRow}>
          <Text style={[styles.grandTotalText, styles.itemsColumn]}>GRAND TOTAL</Text>
          <Text style={[styles.grandTotalText, styles.qtyColumn]}>N/A</Text>
          <Text style={[styles.grandTotalText, styles.amtColumn]}>{order.grandTotal}</Text>
        </View>
      </View>
    </View>
  )

  const PaymentForm: React.FC<{ order: any; navigation: any }> = ({ order, navigation }) => {
    const [cashierName, setCashierName] = useState("")
    const [paymentNumber, setPaymentNumber] = useState("")
    const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isWaitingApproval, setIsWaitingApproval] = useState(false)

    const handlePhotoUpload = (): void => {
      const options = {
        mediaType: "photo" as const,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      }

      launchImageLibrary(options, (response) => {
        if (response.didCancel || response.errorMessage) {
          return
        }

        if (response.assets && response.assets[0]) {
          setReceiptPhoto(response.assets[0].uri || null)
        }
      })
    }

    const handleSubmit = (): void => {
      if (!cashierName.trim()) {
        Alert.alert("Error", "Please enter cashier name")
        return
      }

      if (!paymentNumber.trim()) {
        Alert.alert("Error", "Please enter payment receipt number")
        return
      }

      if (!receiptPhoto) {
        Alert.alert("Error", "Please upload receipt photo")
        return
      }

      setIsSubmitting(true)

      // Simulate submission
      setTimeout(() => {
        setIsSubmitting(false)
        setIsWaitingApproval(true)
      }, 2000)
    }

    if (isWaitingApproval) {
      return (
        <View style={styles.waitingContainer}>
          <Icon name="hourglass-empty" size={64} color="#FF9800" />
          <Text style={styles.waitingTitle}>Payment Submitted</Text>
          <Text style={styles.waitingText}>Please wait for admin to accept your payment</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      )
    }

    return (
      <View style={styles.paymentFormContainer}>
        <View style={styles.fillDetailsHeader}>
          <Text style={styles.fillDetailsText}>Fill the details</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cashier name</Text>
            <TextInput
              style={styles.textInput}
              value={cashierName}
              onChangeText={setCashierName}
              placeholder="Enter cashier name"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payment receipt number</Text>
            <TextInput
              style={styles.textInput}
              value={paymentNumber}
              onChangeText={setPaymentNumber}
              placeholder="Enter payment receipt number"
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.photoUploadContainer} onPress={handlePhotoUpload} activeOpacity={0.7}>
            {receiptPhoto ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: receiptPhoto }} style={styles.photoPreview} />
                <Text style={styles.photoUploadedText}>Receipt photo uploaded</Text>
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </View>
            ) : (
              <View style={styles.photoUploadPlaceholder}>
                <Icon name="camera-alt" size={32} color="#666666" />
                <Text style={styles.photoUploadText}>Tap to upload receipt photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submittingButton,
              (!cashierName.trim() || !paymentNumber.trim() || !receiptPhoto) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !cashierName.trim() || !paymentNumber.trim() || !receiptPhoto}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.submittingContent}>
                <Icon name="hourglass-empty" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>
              Order list &gt; {order.status === "unpaid" ? "Unpaid order list" : "Paid order list"} &gt; Detail
            </Text>
          </View>

          {/* Order Summary Card */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.orderIdText}>Order ID {order.orderId}</Text>
            <Text style={styles.orderDetailText}>Order on - {order.orderDate}</Text>
            <Text style={styles.orderDetailText}>Order for - {order.orderFor}</Text>
            <Text style={styles.orderDetailText}>Pickup location - {order.pickupLocation}</Text>
          </View>

          {/* Action Buttons */}
          {order.status === "unpaid" ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.receiptButton, activeTab === "receipt" && styles.activeReceiptButton]}
                onPress={handleViewReceipt}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionButtonText, activeTab === "receipt" && styles.activeButtonText]}>
                  Click to view receipt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.paymentButton, activeTab === "payment" && styles.activePaymentButton]}
                onPress={handlePayOutstanding}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionButtonText, activeTab === "payment" && styles.activeButtonText]}>
                  Pay outstanding now
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.paidReceiptButton]}
              onPress={handleViewReceipt}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Click to view receipt</Text>
            </TouchableOpacity>
          )}

          {/* Content */}
          {activeTab === "receipt" ? renderReceipt() : <PaymentForm order={order} navigation={navigation} />}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToOrders} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#666666" />
            <Text style={styles.backButtonText}>Click here to go back to order list</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 16,

  },
  breadcrumb: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  orderSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  actionButtons: {
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
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptButton: {
    backgroundColor: "#FF9800",
  },
  activeReceiptButton: {
    backgroundColor: "#F57C00",
  },
  paymentButton: {
    backgroundColor: "#4CAF50",
  },
  activePaymentButton: {
    backgroundColor: "#388E3C",
  },
  paidReceiptButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  receiptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  unpaidReceiptCard: {
    borderColor: "#F44336",
    borderWidth: 1,
  },
  orderDetails: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
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
    marginTop: 16,
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
  paymentFormContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  fillDetailsHeader: {
    backgroundColor: "#666666",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  fillDetailsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  formContainer: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  inputWrapper: {
    paddingVertical: 8,
  },
  inputText: {
    fontSize: 16,
    color: "#333333",
    paddingBottom: 8,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  photoUploadContainer: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    gap: 12,
  },
  photoUploadedText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#666666",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submittingButton: {
    backgroundColor: "#999999",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  waitingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 16,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  waitingText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "transparent",
  },
  photoUploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  photoUploadText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  photoPreviewContainer: {
    alignItems: "center",
    gap: 12,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  changePhotoText: {
    fontSize: 12,
    color: "#999999",
    fontStyle: "italic",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  submittingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9800",
  },
  dot1: {
    animationDelay: "0s",
  },
  dot2: {
    animationDelay: "0.2s",
  },
  dot3: {
    animationDelay: "0.4s",
  },
})

export default OrderDetailScreen
