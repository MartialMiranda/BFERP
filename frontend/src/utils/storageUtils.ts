/**
 * Storage utilities for securely managing authentication data
 * Handles encrypted storage of tokens in both localStorage and sessionStorage
 */
import { encryptData, decryptData } from './cryptoUtils';
import { GenericUser } from '../types/common';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'erp_auth_token',
  REFRESH_TOKEN: 'erp_refresh_token',
  USER_DATA: 'erp_user_data',
  REMEMBER_ME: 'erp_remember_me'
};

// Type definitions
type StorageType = 'local' | 'session';

/**
 * Check if we have access to the storage API
 * This handles cases where storage might be disabled or private browsing modes
 */
const isStorageAvailable = (type: StorageType): boolean => {
  const storage = type === 'local' ? window.localStorage : window.sessionStorage;
  
  try {
    const testKey = `__storage_test__${Math.random()}`;
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn(`${type} storage not available:`, e);
    return false;
  }
};

/**
 * Set an encrypted item in storage
 * @param key - Storage key
 * @param value - Value to store
 * @param storageType - Type of storage (local or session)
 */
const setItem = (key: string, value: string, storageType: StorageType = 'local'): void => {
  if (!value) return;
  
  try {
    // Skip storage if not available
    if (!isStorageAvailable(storageType)) return;
    
    // Encrypt the data
    const encryptedValue = encryptData(value);
    
    // Store in the specified storage
    if (storageType === 'local') {
      localStorage.setItem(key, encryptedValue);
    } else {
      sessionStorage.setItem(key, encryptedValue);
    }
  } catch (error) {
    console.error(`Error setting ${storageType} storage item:`, error);
  }
};

/**
 * Get and decrypt an item from storage
 * @param key - Storage key
 * @param storageType - Type of storage (local or session)
 * @returns - Decrypted value or empty string if not found or decryption fails
 */
const getItem = (key: string, storageType: StorageType = 'local'): string => {
  try {
    // Skip storage if not available
    if (!isStorageAvailable(storageType)) return '';
    
    // Get from the specified storage
    const value = storageType === 'local'
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);
    
    if (!value) return '';
    
    // Decrypt the value
    return decryptData(value);
  } catch (error) {
    console.error(`Error getting ${storageType} storage item:`, error);
    return '';
  }
};

/**
 * Remove an item from storage
 * @param key - Storage key
 * @param storageType - Type of storage (local or session)
 */
const removeItem = (key: string, storageType: StorageType = 'local'): void => {
  try {
    // Skip storage if not available
    if (!isStorageAvailable(storageType)) return;
    
    if (storageType === 'local') {
      localStorage.removeItem(key);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing ${storageType} storage item:`, error);
  }
};

/**
 * Clear all authentication related items from storage
 * @param storageTypes - Types of storage to clear (defaults to both)
 */
const clearAuthStorage = (storageTypes: StorageType[] = ['local', 'session']): void => {
  try {
    storageTypes.forEach(type => {
      // Skip storage if not available
      if (!isStorageAvailable(type)) return;
      
      Object.values(STORAGE_KEYS).forEach(key => {
        removeItem(key, type);
      });
    });
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};

/**
 * Save authentication data to storage
 * @param token - Authentication token
 * @param refreshToken - Refresh token
 * @param userData - User data
 * @param persistSession - Whether to persist in localStorage (true) or just sessionStorage (false)
 */
const saveAuthData = (
  token: string,
  refreshToken: string,
  userData: GenericUser,
  persistSession: boolean = true
): void => {
  // Verificación y logging más estrictos de los datos de entrada
  if (!token) {
    console.error('Error guardando auth data: token no proporcionado');
    return;
  }
  if (!refreshToken) {
    console.error('Error guardando auth data: refreshToken no proporcionado');
    return;
  }
  if (!userData) {
    console.error('Error guardando auth data: userData no proporcionado');
    return;
  }
  
  // Verificar que los valores no sean strings vacíos
  if (token.trim() === '') {
    console.error('Error guardando auth data: token es una string vacía');
    return;
  }
  if (refreshToken.trim() === '') {
    console.error('Error guardando auth data: refreshToken es una string vacía');
    return;
  }

  // Asegurarse de que persistSession sea un booleano explícito
  persistSession = persistSession === true;
  
  console.log(`Saving auth data with persistSession=${persistSession}`);
  
  // Store remember me preference
  setItem(STORAGE_KEYS.REMEMBER_ME, persistSession.toString(), 'local');
  
  try {
    // Verificar que los storages están disponibles antes de intentar guardar
    const sessionAvailable = isStorageAvailable('session');
    const localAvailable = isStorageAvailable('local');
    
    if (!sessionAvailable && !localAvailable) {
      console.error('Error guardando auth data: ningún storage disponible');
      return;
    }
    
    // Serializar userData
    const userDataString = JSON.stringify(userData);
    
    // Siempre guardar en sessionStorage para la sesión actual del navegador
    if (sessionAvailable) {
      setItem(STORAGE_KEYS.AUTH_TOKEN, token, 'session');
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, 'session');
      setItem(STORAGE_KEYS.USER_DATA, userDataString, 'session');
      console.log('Tokens guardados en sessionStorage');
    }
    
    // Si se activa la persistencia, también guardar en localStorage
    if (persistSession && localAvailable) {
      setItem(STORAGE_KEYS.AUTH_TOKEN, token, 'local');
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, 'local');
      setItem(STORAGE_KEYS.USER_DATA, userDataString, 'local');
      console.log('Tokens guardados en localStorage (persistentes)');
    } else if (localAvailable) {
      // Si no persiste, asegurarse de limpiar localStorage
      removeItem(STORAGE_KEYS.AUTH_TOKEN, 'local');
      removeItem(STORAGE_KEYS.REFRESH_TOKEN, 'local');
      removeItem(STORAGE_KEYS.USER_DATA, 'local');
    }
  } catch (error) {
    console.error('Error al guardar datos de autenticación:', error);
  }
};

/**
 * Get stored authentication data
 * @returns - Object containing auth token, refresh token, and user data
 */
const getAuthData = (): { 
  token: string,
  refreshToken: string,
  userData: GenericUser | null,
  rememberMe: boolean
} => {
  // Check if we should remember the user
  const rememberMeStr = getItem(STORAGE_KEYS.REMEMBER_ME, 'local');
  const rememberMe = rememberMeStr === 'true';
  
  // If remember me is enabled, prefer localStorage, otherwise use sessionStorage
  const primaryStorage: StorageType = rememberMe ? 'local' : 'session';
  const secondaryStorage: StorageType = rememberMe ? 'session' : 'local';
  
  // Try primary storage first, then fall back to secondary
  let token = getItem(STORAGE_KEYS.AUTH_TOKEN, primaryStorage);
  if (!token) token = getItem(STORAGE_KEYS.AUTH_TOKEN, secondaryStorage);
  
  let refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN, primaryStorage);
  if (!refreshToken) refreshToken = getItem(STORAGE_KEYS.REFRESH_TOKEN, secondaryStorage);
  
  let userDataStr = getItem(STORAGE_KEYS.USER_DATA, primaryStorage);
  if (!userDataStr) userDataStr = getItem(STORAGE_KEYS.USER_DATA, secondaryStorage);
  
  let userData = null;
  try {
    if (userDataStr) {
      userData = JSON.parse(userDataStr) as GenericUser;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  
  // For debugging
  if (token) {
    console.log(`Auth data retrieved from ${primaryStorage} storage`);
  }
  
  return { token, refreshToken, userData, rememberMe };
};

/**
 * Initialize storage on application load
 * This ensures tokens are properly loaded from storage into state
 */
const initializeStorage = (): void => {
  try {
    const { token, refreshToken, userData } = getAuthData();
    if (token && refreshToken && userData) {
      console.log('Auth data initialized from storage');
      // This will be handled by the Axios interceptor
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Auto-initialize storage when this module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'complete') {
    initializeStorage();
  } else {
    window.addEventListener('load', initializeStorage);
  }
}

export const secureStorage = {
  setItem,
  getItem,
  removeItem,
  clearAuthStorage,
  saveAuthData,
  getAuthData,
  STORAGE_KEYS,
  initializeStorage,
};
