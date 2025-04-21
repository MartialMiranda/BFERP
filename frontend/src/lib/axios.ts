import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
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

    // 2. Si no está en el estado, intentar obtenerlo del almacenamiento
    if (!token && typeof window !== 'undefined') {
      // Verificar primero en sessionStorage y luego en localStorage
      token = sessionStorage.getItem('erp_auth_token') || localStorage.getItem('erp_auth_token');
      
      // Si encontramos un token pero no está en el estado, podemos intentar restaurar la sesión
      if (token) {
        try {
          const userData = sessionStorage.getItem('erp_user_data') || localStorage.getItem('erp_user_data');
          const refreshToken = sessionStorage.getItem('erp_refresh_token') || localStorage.getItem('erp_refresh_token');
          const userDataObj = userData ? JSON.parse(userData) : null;
          
          if (userDataObj && refreshToken) {
            // Restaurar la sesión en Redux (esto es asíncrono, pero el token ya lo tenemos para esta petición)
            setTimeout(() => {
              store.dispatch({
                type: 'auth/setCredentials',
                payload: {
                  token,
                  refreshToken,
                  user: userDataObj
                }
              });
            }, 0);
          }
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
  async (error: AxiosError) => {
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

        // 2. Si no está en el estado, intentar obtenerlo del almacenamiento
        if (!refreshToken && typeof window !== 'undefined') {
          refreshToken = sessionStorage.getItem('erp_refresh_token') || localStorage.getItem('erp_refresh_token');
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
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

        // Verificar si se debe recordar la sesión
        const rememberMeStr = localStorage.getItem('erp_remember_me');
        const rememberMe = rememberMeStr === 'true';
        
        // Obtener datos del usuario
        let userData = null;
        try {
          const userDataStr = sessionStorage.getItem('erp_user_data') || localStorage.getItem('erp_user_data');
          if (userDataStr) {
            userData = JSON.parse(userDataStr);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }

        // Siempre guardar en sessionStorage
        sessionStorage.setItem('erp_auth_token', newAccessToken);
        sessionStorage.setItem('erp_refresh_token', newRefreshToken || refreshToken);
        if (userData) {
          sessionStorage.setItem('erp_user_data', JSON.stringify(userData));
        }
        
        // Si rememberMe es true, también guardar en localStorage
        if (rememberMe) {
          localStorage.setItem('erp_auth_token', newAccessToken);
          localStorage.setItem('erp_refresh_token', newRefreshToken || refreshToken);
          if (userData) {
            localStorage.setItem('erp_user_data', JSON.stringify(userData));
          }
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
    if (error.response?.data?.message) {
      store.dispatch(addNotification({
        message: error.response.data.message,
        severity: 'error'
      }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
