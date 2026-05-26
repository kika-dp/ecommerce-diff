import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_a, { rejectWithValue }) => {
  try {
    const response = await api.get(ENDPOINTS.WISHLIST.LIST);
    return unwrap(response);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().wishlist;
      const exists = state.items.find((item) => item.productId === productId);
      if (exists) {
        await api.delete(ENDPOINTS.WISHLIST.ITEM(productId));
      } else {
        await api.post(ENDPOINTS.WISHLIST.ITEM(productId));
      }
      return dispatch(fetchWishlist()).unwrap();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: [], status: 'idle' },
  reducers: {
    resetWishlist(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload || [];
    });
  },
});

export const { resetWishlist } = slice.actions;
export default slice.reducer;
