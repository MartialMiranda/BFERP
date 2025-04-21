import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { RootState } from '../index';
import { authService } from '../../services/authService';
import { User, AuthState, LoginCredentials, RegisterData, TwoFactorSetup, TwoFactorVerification, AuthError } from '../../types/auth';
import { secureStorage } from '../../utils/storageUtils';
import { ApiErrorResponse } from '../../types/common';

// Inicializar estado desde almacenamiento
const initAuthState = (): AuthState => {
  try {
    // Solo ejecutar en el cliente (no durante SSR)
    if (typeof window !== 'undefined') {
      const { token, refreshToken, userData } = secureStorage.getAuthData();
      console.log('Initializing auth state from storage');
      
      if (token && userData) {
        return {
          user: userData,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          loading: false,
          error: null,
          requires2FA: false,
        };
      }
    }
  } catch (error) {
    console.error('Error initializing auth state:', error);
  }
  
  // Estado por defecto si no hay datos almacenados
  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    requires2FA: false,
  };
};

// Inicializar el estado con datos almacenados si están disponibles
const initialState: AuthState = initAuthState();

/**
 * Async thunk for user login
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Asegurarse de que rememberMe tenga un valor booleano explícito
      const rememberMe = credentials.rememberMe === true;
      console.log('Login attempt with rememberMe:', rememberMe);
      
      const response = await authService.login(credentials);
      
      // Save auth data to storage with persistence based on "rememberMe" flag
      if (response.tokens && response.user) {
        secureStorage.saveAuthData(
          response.tokens.accessToken,
          response.tokens.refreshToken,
          response.user,
          rememberMe // Usar el valor explícito de rememberMe
        );
        console.log('Login successful, tokens saved to storage, rememberMe:', rememberMe);
      }
      
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Error al iniciar sesión' }
      );
    }
  }
);

/**
 * Async thunk for user registration
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Error al registrar usuario' }
      );
    }
  }
);

/**
 * Async thunk for refreshing the auth token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const currentRefreshToken = state.auth.refreshToken;
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Solicitar nuevos tokens con el refresh token actual
      const response = await authService.refreshToken(currentRefreshToken);
      
      // Guardar los tokens actualizados en almacenamiento seguro
      // Obtener los datos actuales del usuario y la configuración de persistencia
      const { userData, rememberMe } = secureStorage.getAuthData();
      
      if (response.accessToken) {
        // Guardar los nuevos tokens manteniendo la preferencia de persistencia
        secureStorage.saveAuthData(
          response.accessToken,
          response.refreshToken || currentRefreshToken, // Usar el nuevo refresh token o mantener el actual
          userData,
          rememberMe // Mantener la misma configuración de persistencia
        );
        
        console.log('Tokens refreshed and saved successfully');
      }
      
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: 'Error al refrescar el token' }
      );
    }
  }
);

/**
 * Async thunk for user logout
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (auth.token) {
        await authService.logout(auth.token);
      }
      
      // Clear all auth storage regardless of API response
      secureStorage.clearAuthStorage();
      console.log('Logged out, storage cleared');
      
      return null;
    } catch (error) {
      // Even if logout fails on the server, we still want to clear local state
      secureStorage.clearAuthStorage();
      console.log('Logout encountered an error, storage still cleared');
      return null;
    }
  }
);

/**
 * Async thunk for enabling 2FA
 */
export const enable2FA = createAsyncThunk(
  'auth/enable2FA',
  async (method: 'app' | 'email', { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token) {
        return rejectWithValue({ message: 'No hay token de autenticación disponible' });
      }
      
      const setup: TwoFactorSetup = { method };
      const response = await authService.enable2FA(setup, auth.token);
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Error al habilitar 2FA' });
    }
  }
);

/**
 * Async thunk for verifying 2FA setup
 */
export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (verification: { code: string; method: 'app' | 'email' }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token || !auth.user) {
        return rejectWithValue({ message: 'No hay sesión activa' });
      }
      
      const verificationData: TwoFactorVerification = {
        code: verification.code,
        userId: auth.user.id,
        method: verification.method
      };
      
      const response = await authService.verify2FA(verificationData);
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Error al verificar código 2FA' });
    }
  }
);

/**
 * Async thunk for disabling 2FA
 */
export const disable2FA = createAsyncThunk(
  'auth/disable2FA',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (!auth.token) {
        return rejectWithValue({ message: 'No hay token de autenticación disponible' });
      }
      
      await authService.disable2FA(auth.token);
      return { disabled: true };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Error al deshabilitar 2FA' });
    }
  }
);

/**
 * Authentication slice for managing auth state
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      // Also update stored user data
      if (state.user) {
        const { rememberMe, userData } = secureStorage.getAuthData();
        if (userData) {
          try {
            // Update session storage
            secureStorage.setItem(
              secureStorage.STORAGE_KEYS.USER_DATA, 
              JSON.stringify({...userData, ...state.user}),
              'session'
            );
            
            // Update localStorage if rememberMe is enabled
            if (rememberMe) {
              secureStorage.setItem(
                secureStorage.STORAGE_KEYS.USER_DATA, 
                JSON.stringify({...userData, ...state.user}),
                'local'
              );
            }
          } catch (e) {
            console.error('Error updating stored user data:', e);
          }
        }
      }
    },
    
    setCredentials(state, action: PayloadAction<{ user: User; token: string; refreshToken: string; rememberMe?: boolean }>) {
      const { user, token, refreshToken, rememberMe = true } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      
      // Store credentials - persist based on rememberMe setting
      secureStorage.saveAuthData(token, refreshToken, user, rememberMe);
      console.log('Credentials set and saved to storage, rememberMe:', rememberMe);
    },
    
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.requires2FA = false;
      
      // Clear stored credentials using secureStorage
      secureStorage.clearAuthStorage();
      
      // También limpiar directamente para asegurar que todo se elimina
      if (typeof window !== 'undefined') {
        // Limpiar localStorage
        localStorage.removeItem('erp_auth_token');
        localStorage.removeItem('erp_refresh_token');
        localStorage.removeItem('erp_user_data');
        localStorage.removeItem('erp_remember_me');
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('erp_auth_token');
        sessionStorage.removeItem('erp_refresh_token');
        sessionStorage.removeItem('erp_user_data');
      }
      
      console.log('Auth state and storage completely cleared');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.requires2FA) {
          state.requires2FA = true;
          state.user = { id: action.payload.userId } as User;
        } else if (action.payload.tokens && action.payload.user) {
          state.token = action.payload.tokens.accessToken;
          state.refreshToken = action.payload.tokens.refreshToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.requires2FA = false;
        } else {
          state.error = { message: 'Invalid login response format' };
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const errorPayload = action.payload as unknown;
          if (typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload) {
            state.error = { 
              message: (errorPayload as { message: string }).message 
            };
          } else {
            state.error = { message: 'Error al iniciar sesión' };
          }
        } else {
          state.error = { message: 'Error al iniciar sesión' };
        }
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const errorPayload = action.payload as unknown;
          if (typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload) {
            state.error = { 
              message: (errorPayload as { message: string }).message 
            };
          } else {
            state.error = { message: 'Error al registrar usuario' };
          }
        } else {
          state.error = { message: 'Error al registrar usuario' };
        }
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || state.refreshToken;
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Si falla el refresh del token, cerrar sesión
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = { message: 'La sesión ha expirado' };
        state.requires2FA = false;
        secureStorage.clearAuthStorage();
      });
  },
});

// Export actions and reducer
export const { clearError, setUser, setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectRequires2FA = (state: RootState) => state.auth.requires2FA;
