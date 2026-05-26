import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@routes/index';
import { fetchCategories } from '@store/common/commonSlice';
import { fetchCart } from '@store/cartSlice';
import { fetchWishlist } from '@store/wishlistSlice';

const App = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuth]);

  return (
    <HelmetProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'aura-toast',
          style: {
            background: '#161616',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            padding: '14px 18px',
            borderRadius: '12px',
          },
        }}
      />
      <AppRoutes />
    </HelmetProvider>
  );
};

export default App;
