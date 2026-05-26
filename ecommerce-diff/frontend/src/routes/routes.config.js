import { ROUTES } from './routesConstants';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyOtpPage,
  ResetPasswordPage,
  AdminLoginPage,
  HomePage,
  ProductListPage,
  ProductDetailsPage,
  CartPage,
  CheckoutPage,
  WishlistPage,
  ProfilePage,
  OrdersListPage,
  OrderDetailPage,
  AdminDashboard,
  AdminUsers,
  AdminProductTypes,
  AdminProducts,
  AdminProductForm,
  AdminOrders,
  AdminOrderDetail,
} from './routeImports';

export const PUBLIC_AUTH_ROUTES = [
  { path: ROUTES.AUTH.LOGIN, element: LoginPage, guestOnly: true },
  { path: ROUTES.AUTH.REGISTER, element: RegisterPage, guestOnly: true },
  { path: ROUTES.AUTH.FORGOT, element: ForgotPasswordPage, guestOnly: true },
  { path: ROUTES.AUTH.VERIFY_OTP, element: VerifyOtpPage, guestOnly: true },
  { path: ROUTES.AUTH.RESET, element: ResetPasswordPage, guestOnly: true },
  { path: ROUTES.ADMIN.LOGIN, element: AdminLoginPage, guestOnly: true },
];

export const USER_PUBLIC_ROUTES = [
  { path: ROUTES.USER.HOME, element: HomePage },
  { path: ROUTES.USER.SHOP, element: ProductListPage },
  { path: ROUTES.USER.SHOP_CATEGORY, element: ProductListPage },
  { path: ROUTES.USER.PRODUCT, element: ProductDetailsPage },
];

export const USER_PRIVATE_ROUTES = [
  { path: ROUTES.USER.CART, element: CartPage },
  { path: ROUTES.USER.CHECKOUT, element: CheckoutPage },
  { path: ROUTES.USER.WISHLIST, element: WishlistPage },
  { path: ROUTES.USER.PROFILE, element: ProfilePage },
  { path: ROUTES.USER.ORDERS, element: OrdersListPage },
  { path: ROUTES.USER.ORDER_DETAIL, element: OrderDetailPage },
];

export const ADMIN_ROUTES = [
  { path: ROUTES.ADMIN.DASHBOARD, element: AdminDashboard, index: true },
  { path: ROUTES.ADMIN.USERS, element: AdminUsers },
  { path: ROUTES.ADMIN.PRODUCT_TYPES, element: AdminProductTypes },
  { path: ROUTES.ADMIN.PRODUCTS, element: AdminProducts },
  { path: ROUTES.ADMIN.PRODUCT_NEW, element: AdminProductForm },
  { path: ROUTES.ADMIN.PRODUCT_EDIT, element: AdminProductForm },
  { path: ROUTES.ADMIN.ORDERS, element: AdminOrders },
  { path: ROUTES.ADMIN.ORDER_DETAIL, element: AdminOrderDetail },
];
