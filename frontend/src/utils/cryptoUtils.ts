/**
 * Utility for encrypting and decrypting sensitive data
 * Uses AES encryption with a fixed application key plus browser fingerprinting
 */

import CryptoJS from 'crypto-js';

// Fixed application encryption key - would be better to use environment variable in production
const APP_SECRET_KEY = 'ERP-System-Secure-Key-2025';

/**
 * Create encryption key combining app secret with basic browser fingerprint
 * Makes it harder to decrypt from another device/browser
 */
const getEncryptionKey = (): string => {
  try {
    // Basic browser fingerprint
    const userAgent = navigator.userAgent || '';
    const language = navigator.language || '';
    
    // Simple fingerprint - enough to make tokens device-specific but not too complex
    // to avoid inconsistencies between sessions
    const fingerprint = `${userAgent.substring(0, 30)}|${language}`;
    
    // Combine app secret with fingerprint
    return CryptoJS.SHA256(`${APP_SECRET_KEY}|${fingerprint}`).toString();
  } catch (error) {
    // Fallback to fixed key if fingerprinting fails
    console.warn('Browser fingerprinting failed, using fallback key');
    return CryptoJS.SHA256(APP_SECRET_KEY).toString();
  }
};

/**
 * Encrypt sensitive data
 * @param data - Data to encrypt
 * @returns - Encrypted data string
 */
export const encryptData = (data: string): string => {
  if (!data) return data;
  
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return the original data if encryption fails - better than losing data
    return data;
  }
};

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data string
 * @returns - Decrypted data or original string if decryption fails
 */
export const decryptData = (encryptedData: string): string => {
  if (!encryptedData) return encryptedData;
  
  try {
    // First, check if it looks like an encrypted string
    if (!isEncrypted(encryptedData)) {
      return encryptedData;
    }
    
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption produced an empty string but input wasn't empty,
    // likely the decryption failed - return original as fallback
    if (!decrypted && encryptedData) {
      console.warn('Decryption produced empty result, using original');
      return encryptedData;
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return original data as fallback
    return encryptedData;
  }
};

/**
 * Check if a string looks like it's encrypted
 * @param data - String to check
 */
export const isEncrypted = (data: string): boolean => {
  // Simple heuristic - encrypted data with AES is Base64 and has certain length
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return typeof data === 'string' && data.length > 20 && base64Regex.test(data);
};
