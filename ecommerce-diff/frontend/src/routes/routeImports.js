import { lazyLoad } from '@utils/lazy';

// Auth
export const LoginPage = lazyLoad(() => import('@modules/Auth/index.jsx'));
export const RegisterPage = lazyLoad(() => import('@modules/Auth/Register.jsx'));
export const ForgotPasswordPage = lazyLoad(() => import('@modules/Auth/ForgotPassword.jsx'));
export const VerifyOtpPage = lazyLoad(() => import('@modules/Auth/VerifyOtp.jsx'));
export const ResetPasswordPage = lazyLoad(() => import('@modules/Auth/ResetPassword.jsx'));
export const AdminLoginPage = lazyLoad(() => import('@modules/Auth/AdminLogin.jsx'));

// User panel
export const HomePage = lazyLoad(() => import('@modules/user/Home/index.jsx'));
export const ProductListPage = lazyLoad(() => import('@modules/user/ProductList/index.jsx'));
export const ProductDetailsPage = lazyLoad(() => import('@modules/user/ProductDetails/index.jsx'));
export const CartPage = lazyLoad(() => import('@modules/user/Cart/index.jsx'));
export const CheckoutPage = lazyLoad(() => import('@modules/user/Checkout/index.jsx'));
export const WishlistPage = lazyLoad(() => import('@modules/user/Wishlist/index.jsx'));
export const ProfilePage = lazyLoad(() => import('@modules/user/Profile/index.jsx'));
export const OrdersListPage = lazyLoad(() =>
  import('@modules/user/Orders/index.jsx').then((m) => ({ default: m.OrdersListPage })),
);
export const OrderDetailPage = lazyLoad(() =>
  import('@modules/user/Orders/index.jsx').then((m) => ({ default: m.OrderDetailPage })),
);

// Admin
export const AdminDashboard = lazyLoad(() => import('@modules/Dashboard/index.jsx'));
export const AdminUsers = lazyLoad(() => import('@modules/admin/Users/index.jsx'));
export const AdminProductTypes = lazyLoad(() => import('@modules/admin/ProductTypes/index.jsx'));
export const AdminProducts = lazyLoad(() =>
  import('@modules/admin/Products/index.jsx').then((m) => ({ default: m.AdminProducts })),
);
export const AdminProductForm = lazyLoad(() =>
  import('@modules/admin/Products/index.jsx').then((m) => ({ default: m.AdminProductForm })),
);
export const AdminOrders = lazyLoad(() =>
  import('@modules/admin/Orders/index.jsx').then((m) => ({ default: m.AdminOrders })),
);
export const AdminOrderDetail = lazyLoad(() =>
  import('@modules/admin/Orders/index.jsx').then((m) => ({ default: m.AdminOrderDetail })),
);
