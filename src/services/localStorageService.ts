/**
 * Local Storage Service
 * 
 * This service provides a wrapper around localStorage with type safety,
 * error handling, and utility functions for common operations.
 */

// Initialize the local storage service
export const initialize = (): boolean => {
  try {
    // Test if localStorage is available
    localStorage.setItem('__test__', 'test');
    localStorage.removeItem('__test__');
    console.log('Local storage service initialized');
    return true;
  } catch (error) {
    console.error('Local storage is not available:', error);
    return false;
  }
};

/**
 * Set an item in localStorage with proper error handling
 * @param key The key to store the value under
 * @param value The value to store (will be JSON stringified)
 * @returns boolean indicating success
 */
export const setItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    return false;
  }
};

/**
 * Get an item from localStorage with proper error handling and type casting
 * @param key The key to retrieve
 * @param defaultValue Default value to return if key doesn't exist
 * @returns The parsed value or defaultValue if not found
 */
export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 * @param key The key to remove
 * @returns boolean indicating success
 */
export const removeItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 * @returns boolean indicating success
 */
export const clear = (): boolean => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Get all keys in localStorage
 * @returns Array of keys
 */
export const getAllKeys = (): string[] => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting all localStorage keys:', error);
    return [];
  }
};

/**
 * Check if a key exists in localStorage
 * @param key The key to check
 * @returns boolean indicating if the key exists
 */
export const hasKey = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking if localStorage has key ${key}:`, error);
    return false;
  }
};

/**
 * Get the size of localStorage in bytes
 * @returns Size in bytes
 */
export const getSize = (): number => {
  try {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        const value = localStorage.getItem(key) || '';
        size += key.length + value.length;
      }
    }
    return size;
  } catch (error) {
    console.error('Error calculating localStorage size:', error);
    return 0;
  }
};
