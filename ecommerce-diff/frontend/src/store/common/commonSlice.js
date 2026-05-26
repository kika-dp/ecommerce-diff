import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';

export const fetchCategories = createAsyncThunk('common/categories', async () => {
  const response = await api.get(ENDPOINTS.PRODUCT_TYPES.ACTIVE);
  return unwrap(response);
});

const commonSlice = createSlice({
  name: 'common',
  initialState: {
    categories: [],
    status: 'idle',
    drawer: { cart: false, mobileNav: false },
  },
  reducers: {
    openCart(state) {
      state.drawer.cart = true;
    },
    closeCart(state) {
      state.drawer.cart = false;
    },
    toggleMobileNav(state) {
      state.drawer.mobileNav = !state.drawer.mobileNav;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { openCart, closeCart, toggleMobileNav } = commonSlice.actions;
export default commonSlice.reducer;
