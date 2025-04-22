import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Define API error response structure
interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';
import { secureStorage } from '../utils/storageUtils';

// Extend AxiosRequestConfig to include our custom flags
declare module 'axios' {
  export interface AxiosRequestConfig {
    _skipAuth?: boolean;
    _retry?: boolean;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - añade el token a las peticiones
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth header if _skipAuth is true (used for refresh token requests)
    if (config._skipAuth) {
      return config;
    }

    // Intentar obtener el token de varios lugares para mejorar la robustez
    // 1. Primero del estado de Redux
    let token = store.getState().auth.token;

    // 2. Si no está en el estado, intentar obtenerlo del almacenamiento seguro
    if (!token && typeof window !== 'undefined') {
      // Usar secureStorage para obtener datos encriptados
      const { token: secureToken, refreshToken, userData } = secureStorage.getAuthData();
      token = secureToken;
      
      // Si encontramos un token pero no está en el estado, podemos intentar restaurar la sesión
      if (token && userData && refreshToken) {
        try {
          // Restaurar la sesión en Redux (esto es asíncrono, pero el token ya lo tenemos para esta petición)
          setTimeout(() => {
            store.dispatch({
              type: 'auth/setCredentials',
              payload: {
                token,
                refreshToken,
                user: userData
              }
            });
          }, 0);
        } catch (error) {
          console.error('Error restaurando sesión:', error);
        }
      }
    }

    // Si tenemos un token, añadirlo a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - maneja los errores de autenticación y refresca tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Si no hay configuración de la petición original, rechazar directamente
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Verificar si es un error de token expirado (401) y no es una petición de refresh
    // y no hemos intentado ya refrescar el token para esta petición
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._skipAuth
    ) {
      originalRequest._retry = true;

      try {
        // Intentar obtener el refresh token de varios lugares para mejorar la robustez
        // 1. Del estado de Redux
        let refreshToken = store.getState().auth.refreshToken;

        // 2. Si no está en el estado, intentar obtenerlo del almacenamiento seguro
        if (!refreshToken && typeof window !== 'undefined') {
          refreshToken = secureStorage.getAuthData().refreshToken;
        }

        // Verificar si hay refresh token disponible
        if (!refreshToken) {
          console.error('No se encontró refresh token en el estado ni en el almacenamiento');
          // En lugar de causar un error fatal, redirigir a login
          store.dispatch(clearAuth());
          store.dispatch(addNotification({
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            severity: 'warning'
          }));
          // Rechazamos la promesa para que la petición original falle, pero con mensaje más claro
          return Promise.reject(new Error('Sesión expirada, por favor inicia sesión nuevamente.'));
        }

        // Realizar una petición para refrescar el token
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        if (!newAccessToken) {
          throw new Error('No token received from refresh request');
        }

        // Obtener datos del usuario usando secureStorage
        let userData = secureStorage.getAuthData().userData;
        
        // Obtener la configuración de rememberMe
        const rememberMeStr = secureStorage.getItem(secureStorage.STORAGE_KEYS.REMEMBER_ME, 'local');
        const rememberMe = rememberMeStr === 'true';
        
        // Guardar nuevos tokens usando secureStorage
        if (userData) {
          secureStorage.saveAuthData(
            newAccessToken,
            newRefreshToken || refreshToken,
            userData,
            rememberMe
          );
        } else {
          // Si no hay datos de usuario, al menos actualizamos los tokens
          secureStorage.setItem(secureStorage.STORAGE_KEYS.AUTH_TOKEN, newAccessToken, rememberMe ? 'local' : 'session');
          secureStorage.setItem(secureStorage.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken || refreshToken, rememberMe ? 'local' : 'session');
        }

        // Actualizar el store con los nuevos tokens
        store.dispatch({
          type: 'auth/refreshToken/fulfilled',
          payload: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken
          }
        });

        // Reintentar la petición original con el nuevo token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Reintentar la petición original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, mantener la sesión si es un error temporal
        // Solo cerrar sesión si es un error de autenticación claro
        if (refreshError instanceof AxiosError && 
            (refreshError.response?.status === 401 || refreshError.response?.status === 403)) {
          // Es un error de autenticación, cerrar sesión
          store.dispatch(clearAuth());
          store.dispatch(addNotification({
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            severity: 'warning'
          }));
        } else {
          // Para otros errores (red, servidor caído, etc.), solo notificar pero no cerrar sesión
          console.error('Error refreshing token but not logging out:', refreshError);
          store.dispatch(addNotification({
            message: 'Error de conexión. Algunas funciones pueden no estar disponibles.',
            severity: 'error'
          }));
        }
        return Promise.reject(refreshError);
      }
    }

    // Para otros errores, mostrar notificación si hay mensaje
    if (error.response?.data && error.response.data.message) {
      store.dispatch(addNotification({
        message: error.response.data.message,
        severity: 'error'
      }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
