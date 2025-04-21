/**
 * Custom storage for Redux Persist that's compatible with SSR
 * Avoids localStorage is not defined errors in server components
 */

// Type definition for storage
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Create custom storage
const createCustomStorage = (): Storage => {
  // Check if we're in the browser environment
  const isClient = typeof window !== 'undefined';

  // Return server-compatible version for SSR
  if (!isClient) {
    return {
      getItem: async () => null,
      setItem: async () => undefined,
      removeItem: async () => undefined,
    };
  }

  // Return browser version using localStorage
  return {
    getItem: async (key: string) => {
      try {
        const serializedState = localStorage.getItem(key);
        return serializedState ? serializedState : null;
      } catch (error) {
        console.error('Error getting item from localStorage:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item in localStorage:', error);
      }
    },
    removeItem: async (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from localStorage:', error);
      }
    },
  };
};

const customStorage = createCustomStorage();

export default customStorage;
