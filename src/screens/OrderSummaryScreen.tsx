"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, StatusBar, ScrollView, Dimensions, Alert } from "react-native"
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from "react-native-vector-icons/MaterialIcons"
import Header from "../components/Header"
import { colors } from "../theme/colors";
import { formatINR } from '../utils/currency';
import {
    selectCartItems,
    selectCartTotalAmount,
    selectCartTotalItems,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart
} from '../store/slices/cartSlice';
import PickupDateModal from "../components/PickupDateModal";
import NormalDateModal from "../components/OthersModal/NormalDateModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiGet, ApiPost, ApiPut } from "../helper/axios";
import { useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window")

interface OrderItem {
    id: string
    name: string
    price: number
    quantity: number
}

interface ServingItem {
    id: string
    name: string
    price: number
    quantity: number
}

interface Props {
    navigation: any;
}

const OrderSummaryScreen: React.FC<Props> = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()) // 27/08/2025
    const route = useRoute();
    const { pickupLocationId, pickupDate, order, orderId } = route.params;

    const [showDateModal, setShowDateModal] = useState<boolean>(false);

    // const [orderId, setOrderId] = useState<string | null>(null)
    const [orderTotal, setOrderTotal] = useState<number>(0)
    const [orderFoodTotal, setOrderFoodTotal] = useState<number>(0)
    const [orderServingTotal, setOrderServingTotal] = useState<number>(0)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [prasadType, setPrasadType] = useState<string | null>(null);



    const [orderItems, setOrderItems] = useState<Item[]>([])
    const [servingItems, setServingItems] = useState<Item[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    

    const persistServing = async (items: Item[]) => {
        try {
            await AsyncStorage.setItem("selectedServingItems", JSON.stringify(items))
        } catch (e) {
            console.error("Failed to persist selectedServingItems", e)
        }
    }

    useEffect(() => {
        const loadData = async () => {
               const pickupStorage = await AsyncStorage.getItem("pickupDetails");
      if (pickupStorage) {
        const parsed = JSON.parse(pickupStorage);
        if (parsed?.pickupDate) {
          const parsedDate = new Date(parsed.pickupDate);
          setSelectedDate(parsedDate);
        }
      }
            try {
                const [userId, loadedPrasadType] = await Promise.all([
                    AsyncStorage.getItem("userId"),
                    AsyncStorage.getItem("prasadType"),
                ])

                setPrasadType(loadedPrasadType);

                if (!userId || !loadedPrasadType) {
                    Alert.alert("Missing info", "User or prasad type not found.")
                    setLoading(false)
                    return
                }

                // 1) Fetch CART by user
                // Expected response shape example:
                // { cart: { items: [{ foodItem: {_id,name,price,image}, quantity }] } }
                const cartRes = await ApiGet(`/${loadedPrasadType}/cart/${userId}`)
                const serverCartItems = cartRes?.data?.items ?? []

                const mappedOrderItems: Item[] = serverCartItems.map((row: any) => ({
                    id: String(row?.foodItem?._id ?? row?.foodItem?.id ?? ""),
                    name: String(row?.foodItem?.name ?? "Item"),
                    price: Number(row?.foodItem?.price ?? 0),
                    image: row?.foodItem?.image ?? undefined,
                    quantity: Number(row?.quantity ?? 0),
                }))
                setOrderItems(mappedOrderItems)

                const storedServing = await AsyncStorage.getItem("selectedServingItems")
                console.log('storedServing', storedServing)
                if (storedServing) {
                    const parsed = JSON.parse(storedServing) as any[]
                    const mappedServing: Item[] = (parsed || []).map((it: any, idx: number) => ({
                        id: String(it._id ?? it.id ?? idx),
                        name: String(it.name ?? "Serving item"),
                        price: Number(it.price ?? 0),
                        quantity: Number(it.quantity ?? 0),
                        image: it.image ?? undefined,
                    }))
                    setServingItems(mappedServing)
                } else {
                    setServingItems([])
                }
            } catch (err) {
                console.error("Failed to load order summary:", err)
                Alert.alert("Error", "Unable to load your order summary.")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const updateOrderItemQuantity = (itemId: string, change: number): void => {
        setOrderItems((prev) =>
            prev
                .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
                .filter((item) => item.quantity > 0),
        )
    }

    const updateServingItemQuantity = (itemId: string, change: number): void => {
        setServingItems(prev => {
            const next = prev
                .map(item =>
                    item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
                )
                .filter(item => item.quantity > 0)
            persistServing(next) // save latest serving selection
            return next
        })
    }

    const handleDatePress = (): void => {
        setShowDateModal(true);
    }

    const handlePickupLocation = (): void => {
        console.log("Navigate to pickup location")
    }

    const handlePlaceOrder = (): void => {
        console.log("Place order")
    }

    const itemCount = orderItems.reduce((sum, i) => sum + i.quantity, 0)
    const servingCount = servingItems.reduce((sum, i) => sum + i.quantity, 0)
    const totalItems = itemCount + servingCount

const handleDateSave = async (data: any): Promise<void> => {
  const selected = data.date;
  setSelectedDate(selected);
  setShowDateModal(false);

  try {
    await AsyncStorage.setItem(
      'pickupDetails',
      JSON.stringify({ pickupDate: selected.toISOString() })
    );
    console.log('📦 Saved pickup date:', selected.toISOString());
  } catch (error) {
    console.error('❌ Failed to save pickup date:', error);
  }
};


    const renderQuantityControls = (quantity: number, onDecrease: () => void, onIncrease: () => void) => (
        <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={onDecrease} activeOpacity={0.7}>
                <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>QTY: {quantity}</Text>
            </View>

            <TouchableOpacity style={[styles.quantityButton, styles.increaseButton]} onPress={onIncrease} activeOpacity={0.7}>
                <Text style={[styles.quantityButtonText, styles.increaseButtonText]}>+</Text>
            </TouchableOpacity>
        </View>
    )

    // const updateItemQuantity = (
    //     items: Item[],
    //     setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    //     itemId: string,
    //     change: number
    // ) => {
    //     setItems((prev) =>
    //         prev
    //             .map((item) =>
    //                 item.id === itemId
    //                     ? { ...item, quantity: Math.max(0, item.quantity + change) }
    //                     : item
    //             )
    //             .filter((item) => item.quantity > 0)
    //     )
    // }

    // Calculate totals

    const updateItemQuantity = (
        items: Item[],
        setItems: React.Dispatch<React.SetStateAction<Item[]>>,
        itemId: string,
        change: number
    ) => {
        setItems(prev => {
            const next = prev
                .map(item =>
                    item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
                )
                .filter(item => item.quantity > 0)
            return next
        })
    }
    const itemTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const servingTotal = servingItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
    )
    const subTotal = itemTotal + servingTotal
    console.log('subTotal', subTotal)
    const deliveryFee = 20
    const gst = Math.round(subTotal * 0.18)
    const grandTotal = subTotal + deliveryFee + gst

    const handleConfirmOrder = async () => {
        try {
            setSubmitting(true);

            const prasadType = await AsyncStorage.getItem("prasadType");
            const pickupDateRawString = await AsyncStorage.getItem("pickupDetails");
            const pickupDateRaw = pickupDateRawString ? JSON.parse(pickupDateRawString) : null;
            const userId = await AsyncStorage.getItem("userId");

            if (!prasadType || !pickupDateRaw || !pickupLocationId || !orderId || !userId) {
                Alert.alert("Missing Info", "Required fields are missing.");
                return;
            }

            console.log('pickupDateRaw', pickupDateRaw)

            // Prepare order summary items
            const selectedItems = servingItems.filter(item => item.quantity > 0);
            if (!selectedItems.length) {
                Alert.alert('Empty Cart', 'Please add at least one item.');
                return;
            }

            const items = selectedItems.map(item => ({
                foodItem: item._id || item.id,
                quantity: item.quantity,
                price: item.price, 
            }));

            console.log("🛠 Update Order Payload", {
                orderSummaryId: orderId,
                userId,
                items,
            });

            // const updateRes = await ApiPut(`/${prasadType}/order_summary/update`, {
            //     orderSummaryId: orderId,
            //     userId,
            //     items,
            // });

            // console.log('updateRes', updateRes)
            // if (updateRes?.data?._id !== "Order summary updated successfully") {
            //   Alert.alert("Update Error", updateRes?.message ?? "Order summary update failed.");
            //   return;
            // }

            // ✅ Create Receipt
            const receiptPayload = {
                orderId,
                orderDate: pickupDateRaw?._id,
                pickupLocation: pickupLocationId,
            };

            console.log('receiptPayload', receiptPayload)

            const receiptRes = await ApiPost(`/${prasadType}/create-reciept`, receiptPayload);

            console.log('receiptRes', receiptRes)

            if (receiptRes?.data?.status !== "success") {
                Alert.alert("Receipt Error", receiptRes?.data?.message ?? "Could not create receipt.");
                return;
            }

            const receipt = receiptRes?.data?.data;
            console.log('receipt', receipt)
            navigation.navigate("Orderrecipt", { receipt });

        } catch (error: any) {
            console.error("❌ Confirm Order Error:", error);
            Alert.alert("Error", error?.response?.data?.message ?? error?.message ?? "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };






    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            <View style={{ marginTop: "-14%" }}>
                <Header />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Profile Section */}


                {/* Header Buttons */}
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.orderSummaryHeaderButton} activeOpacity={0.8}>
                        <Text style={styles.orderSummaryHeaderText}>Item order summary</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dateButton} onPress={handleDatePress} activeOpacity={0.8}>
                        <Icon name="event" size={20} color="#FFFFFF" style={styles.calendarIcon} />
                        <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Order Items */}
                <View style={styles.orderItemsContainer}>
                    {orderItems.map((item) => (
                        <View key={item.id} style={styles.cartItem}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() =>
                                            updateItemQuantity(orderItems, setOrderItems, item.id, -1)
                                        }
                                    >
                                        <MaterialCommunityIcons
                                            name="minus"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() =>
                                            updateItemQuantity(orderItems, setOrderItems, item.id, 1)
                                        }
                                    >
                                        <MaterialCommunityIcons
                                            name="plus"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.itemTotal}>
                                ₹{item.price * item.quantity}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Serving Method Section */}
                {/* <View style={styles.servingMethodHeader}>
                    <Text style={styles.servingMethodHeaderText}>Serving method summary</Text>
                </View> */}
                {prasadType === 'self-service' && (
  <>
    <View style={styles.servingMethodHeader}>
      <Text style={styles.servingMethodHeaderText}>Serving method summary</Text>
    </View>

    <View style={styles.servingItemsContainer}>
      {servingItems.map((item) => (
        <View key={item.id} style={styles.cartItem}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateServingItemQuantity(item.id, -1)}
              >
                <MaterialCommunityIcons name="minus" size={16} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateServingItemQuantity(item.id, 1)}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
        </View>
      ))}
    </View>
  </>
)}


                {/* <View style={styles.servingItemsContainer}>
                    {servingItems.map((item) => (
                        <View key={item.id} style={styles.cartItem}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateServingItemQuantity(item.id, -1)}
                                    >
                                        <MaterialCommunityIcons
                                            name="minus"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateServingItemQuantity(item.id, 1)}
                                    >
                                        <MaterialCommunityIcons
                                            name="plus"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.itemTotal}>
                                ₹{item.price * item.quantity}
                            </Text>
                        </View>
                    ))}
                </View> */}



                {/* Bottom Navigation */}

            </ScrollView>

            <View style={styles.billContainer}>
                <Text style={styles.billTitle}>Bill Summary</Text>

                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Total Items</Text>
                    <Text style={styles.billValue}>{totalItems}</Text>
                </View>

                {/* <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Delivery Fee</Text>
                    <Text style={styles.billValue}>2</Text>
                </View> */}

                {/* <View style={styles.billRow}>
                    <Text style={styles.billLabel}>GST (18%)</Text>
                    <Text style={styles.billValue}>23</Text>
                </View> */}

                <View style={[styles.billRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{subTotal}</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleConfirmOrder}
                >
                    <Text style={styles.checkoutButtonText}>
                        {submitting ? "Ordering" : "Confirm Order"}
                    </Text>
                </TouchableOpacity>

            </View>
            <NormalDateModal
                visible={showDateModal}
                onClose={() => setShowDateModal(false)}
                onSave={handleDateSave}
            />
        </SafeAreaView>
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
    profileSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF3E0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    profileInfo: {
        justifyContent: "center",
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
    },
    profileRole: {
        fontSize: 14,
        color: "#666666",
        marginTop: 2,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF3E0",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    notificationBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FF5722",
    },
    headerButtons: {
        flexDirection: "row",
        marginBottom: 15,
        gap: 12,
    },
    orderSummaryHeaderButton: {
        flex: 2,
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    orderSummaryHeaderText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        textAlign: "center",
    },
    dateButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    calendarIcon: {
        marginRight: 8,
    },
    dateButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    orderItemsContainer: {
        marginBottom: 20,
    },
    servingMethodHeader: {
        backgroundColor: "#054b85ff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    servingMethodHeaderText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",

    },
    servingItemsContainer: {
        marginBottom: 40,
    },
    itemCard: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333333",
        textAlign: "center",
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 16,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#F44336",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#F44336",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    increaseButton: {
        backgroundColor: "#4CAF50",
        shadowColor: "#4CAF50",
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    increaseButtonText: {
        color: "#FFFFFF",
    },
    quantityDisplay: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        minWidth: 80,
        alignItems: "center",
    },
    quantityText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333333",
    },
    bottomActions: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 20,
    },
    pickupLocationButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pickupLocationText: {
        fontSize: 14,
        color: "#666666",
        marginLeft: 8,
        fontWeight: "500",
    },
    placeOrderButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#4CAF50",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    bottomNavigation: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    profileNavContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    questionBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#333333",
        alignItems: "center",
        justifyContent: "center",
    },
    questionText: {
        fontSize: 10,
        color: "#FFFFFF",
        fontWeight: "bold",
    },

    cartItem: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: colors.surface,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        padding: 8,
        minWidth: 32,
        alignItems: 'center',
    },
    quantity: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        paddingHorizontal: 12,
    },
    itemActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    removeButton: {
        padding: 8,
    },
    billContainer: {
        backgroundColor: colors.surface,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    billTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    billValue: {
        fontSize: 14,
        color: colors.text,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 8,
        marginTop: 8,
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default OrderSummaryScreen
