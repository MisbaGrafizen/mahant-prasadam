import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, MenuItem } from '../../types';
import { RootState } from '../index';

interface CartState {
  items: { [key: string]: CartItem };
  totalAmount: number;
  totalItems: number;
}

const initialState: CartState = {
  items: {},
  totalAmount: 0,
  totalItems: 0,
};

const calculateTotals = (items: { [key: string]: CartItem }) => {
  let totalAmount = 0;
  let totalItems = 0;

  Object.values(items).forEach(item => {
    totalAmount += item.menuItem.price * item.quantity;
    totalItems += item.quantity;
  });

  return { totalAmount, totalItems };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<MenuItem>) => {
      const menuItem = action.payload;
      const existingItem = state.items[menuItem.id];

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items[menuItem.id] = {
          menuItem,
          quantity: 1,
        };
      }

      const totals = calculateTotals(state.items);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
    },

    incrementItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (state.items[itemId]) {
        state.items[itemId].quantity += 1;

        const totals = calculateTotals(state.items);
        state.totalAmount = totals.totalAmount;
        state.totalItems = totals.totalItems;
      }
    },

    decrementItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (state.items[itemId]) {
        if (state.items[itemId].quantity > 1) {
          state.items[itemId].quantity -= 1;
        } else {
          delete state.items[itemId];
        }

        const totals = calculateTotals(state.items);
        state.totalAmount = totals.totalAmount;
        state.totalItems = totals.totalItems;
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      delete state.items[itemId];

      const totals = calculateTotals(state.items);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
    },

    clearCart: (state) => {
      state.items = {};
      state.totalAmount = 0;
      state.totalItems = 0;
    },
  },
});

export const { addItem, incrementItem, decrementItem, removeItem, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotalAmount = (state: RootState) => state.cart.totalAmount;
export const selectCartTotalItems = (state: RootState) => state.cart.totalItems;
export const selectCartItemQuantity = (state: RootState, itemId: string) =>
  state.cart.items[itemId]?.quantity || 0;

export default cartSlice.reducer;
