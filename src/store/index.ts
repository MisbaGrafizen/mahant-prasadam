import { configureStore } from '@reduxjs/toolkit';
import cartSlice from './slices/cartSlice';
import restaurantSlice from './slices/restaurantSlice';
import servingSlice from './slices/servingSlice';
import ordersReducer from './slices/ordersSlice';


export const store = configureStore({
  reducer: {
    cart: cartSlice,
    restaurant: restaurantSlice,
    serving: servingSlice,

       orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
