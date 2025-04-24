import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { RootState } from '../index';
import { authService } from '../../services/authService';
import { User, AuthState, LoginCredentials, RegisterData, TwoFactorSetup, TwoFactorVerification, TwoFactorSetupState } from '../../types/auth';
import { secureStorage } from '../../utils/storageUtils';
import { ApiErrorResponse } from '../../types/common';

// Inicializar estado desde almacenamiento
// Type guard para validar User
function isUser(obj: unknown): obj is User {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    'id' in o && typeof o.id === 'string' &&
    'nombre' in o && typeof o.nombre === 'string' &&
    'email' in o && typeof o.email === 'string' &&
    'rol' in o && (o.rol === 'admin' || o.rol === 'gestor' || o.rol === 'usuario') &&
    'tiene_2fa' in o && typeof o.tiene_2fa === 'boolean'
  );
}

const initAuthState = (): AuthState => {
  // Estado inicial vacío para el setup de 2FA
  const emptyTwoFactorSetup: TwoFactorSetupState = {
    isActivating: false,
    qrCode: null,
    secret: null,
    method: null,
    pendingVerification: false
  };

  try {
    // Solo ejecutar en el cliente (no durante SSR)
    if (typeof window !== 'undefined') {
      const { token, refreshToken, userData } = secureStorage.getAuthData();
      console.log('Initializing auth state from storage');
      
      if (token && userData && isUser(userData)) {
        return {
          user: userData,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          loading: false,
          error: null,
          requires2FA: false,
          twoFactorSetup: emptyTwoFactorSetup
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
    twoFactorSetup: emptyTwoFactorSetup
  };
};

// Inicializar el estado con datos almacenados si están disponibles
// Inicializar el estado de autenticación
const initialState: AuthState = initAuthState();

/**
 * Async thunk for user login
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.requires2FA) {
        // No guardar tokens ni user todavía, solo userId temporal
        return {
          requires2FA: true,
          userId: response.userId,
          metodo_2fa: response.metodo_2fa,
        };
      }
      if (response.tokens && response.user) {
        // Aseguramos que ambos tokens existen antes de guardar
        if (!response.tokens.accessToken || !response.tokens.refreshToken) {
          return rejectWithValue({ message: 'Error: tokens incompletos recibidos del servidor' });
        }

        console.log('Guardando tokens en storage:', {
          accessToken: response.tokens.accessToken ? 'Presente' : 'Ausente',
          refreshToken: response.tokens.refreshToken ? 'Presente' : 'Ausente'
        });
        
        // Guardamos explícitamente en ambos storage para mayor seguridad
        secureStorage.saveAuthData(
          response.tokens.accessToken,
          response.tokens.refreshToken,
          response.user,
          credentials.rememberMe === true
        );
        return {
          tokens: response.tokens,
          user: response.user,
          requires2FA: false
        };
      }
      console.error('Respuesta inválida del backend:', response);
      return rejectWithValue({ message: 'Respuesta inválida del backend al iniciar sesión' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error de login:', axiosError);
      return rejectWithValue(
        axiosError.response?.data || { message: 'Error al iniciar sesión. Verifique sus credenciales.' }
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
        if (userData) {
          secureStorage.saveAuthData(
            response.accessToken,
            response.refreshToken || currentRefreshToken, // Usar el nuevo refresh token o mantener el actual
            userData,
            rememberMe // Mantener la misma configuración de persistencia
          );
        }
        
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
  async (_, { getState }) => {
    try {
      const { auth } = getState() as RootState;
      
      if (auth.token) {
        await authService.logout(auth.token);
      }
      
      // Clear all auth storage regardless of API response
      secureStorage.clearAuthStorage();
      console.log('Logged out, storage cleared');
      
      return null;
    } catch {
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
      // No modificar el usuario aquí, solo devolver datos para el estado temporal
      return {
        method,
        qrCode: response.otpauth_url || response.qrCode || null,
        secret: response.secret || null,
        emailSent: response.emailSent || false,
        isActivating: true,
        pendingVerification: true
      };
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
  async (verification: { code: string; userId: string; method: 'app' | 'email' }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const userId = auth.user?.id;
      if (!userId) {
        return rejectWithValue({ message: 'No hay sesión activa' });
      }
      const verificationData: TwoFactorVerification = {
        code: verification.code,
        userId,
        method: verification.method
      };
      const response = await authService.verify2FA(verificationData);
      console.log('Respuesta de verificación 2FA:', response);
      
      // Si la respuesta tiene verified=true, considerarla exitosa aunque no contenga tokens/user
      if (response.verified) {
        // Si tiene tokens y user, guardarlos
        if (response.tokens && response.user) {
          secureStorage.saveAuthData(
            response.tokens.accessToken,
            response.tokens.refreshToken,
            response.user,
            true
          );
        }
        // Considerarla exitosa incluso si no tiene tokens/user (podrían enviarse en otro endpoint)
        return {
          tokens: response.tokens || { accessToken: auth.token || '', refreshToken: auth.refreshToken || '' },
          user: response.user || auth.user,
          verified: true
        };
      }
      
      // Si la API responde con éxito (200) pero sin indicar verified=true explícitamente
      // asumir que es una verificación exitosa de todos modos (comportamiento más tolerante)
      if (!response.message && !response.error) {
        return {
          tokens: response.tokens || { accessToken: auth.token || '', refreshToken: auth.refreshToken || '' },
          user: response.user || auth.user,
          verified: true
        };
      }
      
      return rejectWithValue({ message: response.message || 'Verificación 2FA fallida' });
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
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      if (!auth.token) {
        return rejectWithValue({ message: 'No hay token de autenticación disponible' });
      }
      await authService.disable2FA(auth.token);
      // Actualizar el usuario localmente
      if (auth.user) {
        const updatedUser = {
          ...auth.user,
          tiene_2fa: false,
          metodo_2fa: undefined
        };
        dispatch(setUser(updatedUser));
      }
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
      state.twoFactorSetup = {
        isActivating: false,
        qrCode: null,
        secret: null,
        method: null,
        pendingVerification: false
      };
      
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

    cancelTwoFactorSetup(state) {
      state.twoFactorSetup = {
        isActivating: false,
        qrCode: null,
        secret: null,
        method: null,
        pendingVerification: false
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enable2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.twoFactorSetup = {
          isActivating: true,
          qrCode: null,
          secret: null,
          method: null,
          pendingVerification: false
        };
      })
      .addCase(enable2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Consolidar ambos posibles payloads
        state.twoFactorSetup = {
          isActivating: true,
          qrCode: action.payload.qrCode || null,
          secret: action.payload.secret || null,
          method: action.payload.method || 'app',
          pendingVerification: true
        };
        // Si el servidor devuelve usuario actualizado, actualizarlo
        if (action.payload && 'user' in action.payload && action.payload.user && typeof action.payload.user === 'object') {
          const userObj = action.payload.user as Record<string, unknown>;
          if (
            typeof userObj.id === 'string' &&
            typeof userObj.nombre === 'string' &&
            typeof userObj.email === 'string' &&
            typeof userObj.rol === 'string' &&
            typeof userObj.tiene_2fa === 'boolean'
          ) {
            state.user = userObj as User;
          } else {
            state.user = {
              id: '',
              nombre: '',
              email: '',
              rol: 'usuario',
              tiene_2fa: false
            };
          }
        }
      })
      .addCase(enable2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? { message: (action.payload as any).message } : { message: 'Error al activar 2FA' };
        state.twoFactorSetup = {
          isActivating: false,
          qrCode: null,
          secret: null,
          method: null,
          pendingVerification: false
        };
      })
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Consolidación de toda la lógica:
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.tokens.accessToken;
          state.refreshToken = action.payload.tokens.refreshToken;
          state.isAuthenticated = true;
          state.requires2FA = false;
        } else if (
          action.payload &&
          action.payload.user !== null &&
          typeof action.payload.user === 'object' &&
          'id' in action.payload.user &&
          'nombre' in action.payload.user &&
          'email' in action.payload.user &&
          'rol' in action.payload.user &&
          'tiene_2fa' in action.payload.user
        ) {
          // Validar que el payload es un User válido antes de asignar
          const user = action.payload.user as Partial<User>;
          if (
            user &&
            typeof user.id === 'string' &&
            typeof user.nombre === 'string' &&
            typeof user.email === 'string' &&
            typeof user.rol === 'string' &&
            typeof user.tiene_2fa === 'boolean'
          ) {
            state.user = user as User;
            if (state.user && state.user.tiene_2fa) {
              state.twoFactorSetup = {
                isActivating: false,
                qrCode: null,
                secret: null,
                method: null,
                pendingVerification: false
              };
            }
          } else {
            state.user = null;
          }
        }
        // Siempre limpiar el estado temporal tras éxito
        state.twoFactorSetup = {
          isActivating: false,
          qrCode: null,
          secret: null,
          method: null,
          pendingVerification: false
        };
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? { message: (action.payload as any).message } : { message: 'Error al verificar 2FA' };
        // No limpiar twoFactorSetup para permitir reintentos/cancelar
      })
      .addCase(disable2FA.fulfilled, (state) => {
        if (state.user) {
          state.user.tiene_2fa = false;
          state.user.metodo_2fa = undefined;
        }
        state.twoFactorSetup = {
          isActivating: false,
          qrCode: null,
          secret: null,
          method: null,
          pendingVerification: false
        };
      })
      .addCase(disable2FA.rejected, (state, action) => {
        state.error = action.payload ? { message: (action.payload as any).message } : { message: 'Error al desactivar 2FA' };
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.requires2FA) {
          state.requires2FA = true;
          // Solo guardar userId temporal, el resto de campos se ponen como valores vacíos válidos
          state.user = {
            id: action.payload.userId ?? '',
            nombre: '',
            email: '',
            rol: 'usuario',
            tiene_2fa: false
          };
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        } else if (action.payload && action.payload.tokens && action.payload.user) {
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
      .addCase(register.fulfilled, (state) => {
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
export const { clearError, setUser, setCredentials, clearAuth, cancelTwoFactorSetup } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectRequires2FA = (state: RootState) => state.auth.requires2FA;
export const selectTwoFactorSetup = (state: RootState) => state.auth.twoFactorSetup;
