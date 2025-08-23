// src/store/slices/ordersSlice.ts
import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: number;     // in paise
  quantity: number;
  lineTotal: number; // price * quantity (paise)
};

export type Order = {
  id: string;
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status?: 'placed' | 'preparing' | 'delivered' | 'cancelled';
  notes?: string;
  addressLine?: string;
};

type OrdersState = {
  list: Order[];
};

const initialState: OrdersState = { list: [] };

const recalc = (order: Order) => {
  order.subtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
  order.tax = Math.round(order.subtotal * 0.18);
  order.total = order.subtotal + order.deliveryFee + order.tax;
  order.items.forEach(it => (it.lineTotal = it.price * it.quantity));
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrderFromCart: {
      // call this after checkout
      reducer(state, action: PayloadAction<Order>) {
        state.list.unshift(action.payload);
      },
      prepare(payload: Omit<Order, 'id' | 'createdAt'>) {
        return {
          payload: { ...payload, id: nanoid(), createdAt: Date.now() },
        };
      },
    },

    // NEW: delete a whole order
    deleteOrder(state, action: PayloadAction<string>) {
      state.list = state.list.filter(o => o.id !== action.payload);
    },

    // NEW: remove a single line item from an order
    removeOrderItem(
      state,
      action: PayloadAction<{ orderId: string; itemId: string }>
    ) {
      const { orderId, itemId } = action.payload;
      const order = state.list.find(o => o.id === orderId);
      if (!order) return;
      order.items = order.items.filter(i => i.id !== itemId);
      recalc(order);
    },

    // NEW: increment / decrement quantity for an order line
    incrementOrderItem(
      state,
      action: PayloadAction<{ orderId: string; itemId: string }>
    ) {
      const { orderId, itemId } = action.payload;
      const order = state.list.find(o => o.id === orderId);
      if (!order) return;
      const item = order.items.find(i => i.id === itemId);
      if (!item) return;
      item.quantity += 1;
      recalc(order);
    },
    decrementOrderItem(
      state,
      action: PayloadAction<{ orderId: string; itemId: string }>
    ) {
      const { orderId, itemId } = action.payload;
      const order = state.list.find(o => o.id === orderId);
      if (!order) return;
      const item = order.items.find(i => i.id === itemId);
      if (!item) return;
      item.quantity = Math.max(1, item.quantity - 1);
      recalc(order);
    },

    // Optional: update meta/details
    updateOrderDetails(
      state,
      action: PayloadAction<{ orderId: string; notes?: string; addressLine?: string }>
    ) {
      const { orderId, ...rest } = action.payload;
      const order = state.list.find(o => o.id === orderId);
      if (!order) return;
      Object.assign(order, rest);
    },
  },
});

export const {
  addOrderFromCart,
  deleteOrder,
  removeOrderItem,
  incrementOrderItem,
  decrementOrderItem,
  updateOrderDetails,
} = ordersSlice.actions;

export const selectOrders = (state: any) => (state.orders as OrdersState).list;

export default ordersSlice.reducer;
