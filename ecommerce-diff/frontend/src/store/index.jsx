import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@modules/Auth/slice/AuthSlice';
import commonReducer from './common/commonSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    common: commonReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }),
});

export default store;
