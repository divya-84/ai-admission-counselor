import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'SUPER_ADMIN' | 'ADMIN' | 'COUNSELOR' | 'STUDENT' | 'HOD' | 'FACULTY';
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getStoredUser = (): User | null => {
  try {
    const item = localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const storedUser = getStoredUser();
const storedToken = getStoredToken();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedUser && storedToken),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      try {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.accessToken);
      } catch (e) {
        console.warn('Failed to save auth to localStorage:', e);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } catch (e) {
        console.warn('Failed to clear auth from localStorage:', e);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
