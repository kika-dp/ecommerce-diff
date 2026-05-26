import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';

export const fetchCart = createAsyncThunk('cart/fetch', async (_arg, { rejectWithValue }) => {
  try {
    const response = await api.get(ENDPOINTS.CART.LIST);
    return unwrap(response);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await api.post(ENDPOINTS.CART.ADD, payload);
    return dispatch(fetchCart()).unwrap();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ id, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await api.patch(ENDPOINTS.CART.ITEM(id), { quantity });
    return dispatch(fetchCart()).unwrap();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(ENDPOINTS.CART.ITEM(id));
    return dispatch(fetchCart()).unwrap();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    summary: { subtotal: '0.00', itemCount: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {
    resetCart(state) {
      state.items = [];
      state.summary = { subtotal: '0.00', itemCount: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.items || [];
        state.summary = action.payload?.summary || { subtotal: '0.00', itemCount: 0 };
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
