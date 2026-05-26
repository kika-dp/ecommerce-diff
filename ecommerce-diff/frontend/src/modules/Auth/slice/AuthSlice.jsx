import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { AUTH_STORAGE_KEYS, unwrap } from '@services/api';
import { ENDPOINTS } from '@constants/url';
import { localStorageService } from '@services/localStorage';

const persistedUser = localStorageService.get(AUTH_STORAGE_KEYS.USER);
const persistedToken = localStorageService.get(AUTH_STORAGE_KEYS.ACCESS);

const persistSession = ({ user, accessToken, refreshToken }) => {
  localStorageService.set(AUTH_STORAGE_KEYS.USER, user);
  localStorageService.set(AUTH_STORAGE_KEYS.ACCESS, accessToken);
  localStorageService.set(AUTH_STORAGE_KEYS.REFRESH, refreshToken);
};

const clearSession = () => {
  localStorageService.remove(AUTH_STORAGE_KEYS.USER);
  localStorageService.remove(AUTH_STORAGE_KEYS.ACCESS);
  localStorageService.remove(AUTH_STORAGE_KEYS.REFRESH);
};

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
    const data = unwrap(response);
    persistSession(data);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    const data = unwrap(response);
    persistSession(data);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post(ENDPOINTS.AUTH.LOGOUT);
  } catch (_e) {
    /* server may be down — clear local regardless */
  }
  clearSession();
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_arg, { rejectWithValue }) => {
  try {
    const response = await api.get(ENDPOINTS.USERS.ME);
    return unwrap(response);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const initialState = {
  user: persistedUser ?? null,
  role: persistedUser?.role ?? null,
  isAuthenticated: Boolean(persistedToken && persistedUser),
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.role = action.payload?.role ?? null;
      state.isAuthenticated = Boolean(action.payload);
    },
    clearAuth(state) {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.role = action.payload.user?.role;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.role = action.payload.user?.role;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload?.role;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
