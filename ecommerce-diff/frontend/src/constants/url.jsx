export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET: '/auth/reset-password',
  },
  USERS: {
    ME: '/users/me',
    ADDRESSES: '/users/me/addresses',
    LIST: '/users',
    STATUS: (id) => `/users/${id}/status`,
    REMOVE: (id) => `/users/${id}`,
  },
  PRODUCT_TYPES: {
    LIST: '/product-types',
    ACTIVE: '/product-types/active',
    BY_SLUG: (slug) => `/product-types/slug/${slug}`,
    ONE: (id) => `/product-types/${id}`,
  },
  PRODUCTS: {
    LIST: '/products',
    ONE: (id) => `/products/${id}`,
    BY_SLUG: (slug) => `/products/slug/${slug}`,
    SIMILAR: (id) => `/products/${id}/similar`,
  },
  CART: {
    LIST: '/cart',
    ADD: '/cart/items',
    ITEM: (id) => `/cart/items/${id}`,
  },
  WISHLIST: {
    LIST: '/wishlist',
    ITEM: (productId) => `/wishlist/${productId}`,
  },
  ORDERS: {
    PLACE: '/orders',
    MINE: '/orders/mine',
    MY_ONE: (id) => `/orders/mine/${id}`,
    MY_CANCEL: (id) => `/orders/mine/${id}/cancel`,
    LIST: '/orders',
    ONE: (id) => `/orders/${id}`,
    STATUS: (id) => `/orders/${id}/status`,
  },
  DASHBOARD: {
    OVERVIEW: '/admin/dashboard/overview',
  },
};
