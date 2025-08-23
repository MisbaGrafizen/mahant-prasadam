import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Restaurant } from '../../types';
import ServingData from '../../data/servingdata.json';

interface ServingState {
  data: Restaurant | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServingState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk to load restaurant data
export const loadServingData = createAsyncThunk(
  'restaurant/loadData',
  async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return ServingData as Serving;
  }
);

const servingSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadServingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadServingData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loadServingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load restaurant data';
      });
  },
});

export const { clearError } = servingSlice.actions;
export default servingSlice.reducer;
