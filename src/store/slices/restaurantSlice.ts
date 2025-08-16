import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Restaurant } from '../../types';
import restaurantData from '../../data/restaurant.json';

interface RestaurantState {
  data: Restaurant | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk to load restaurant data
export const loadRestaurantData = createAsyncThunk(
  'restaurant/loadData',
  async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return restaurantData as Restaurant;
  }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRestaurantData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRestaurantData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loadRestaurantData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load restaurant data';
      });
  },
});

export const { clearError } = restaurantSlice.actions;
export default restaurantSlice.reducer;
