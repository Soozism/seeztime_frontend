import { STORAGE_KEYS } from '../constants';

/**
 * A utility class for managing storage operations with built-in error handling
 * and serialization/deserialization of JSON data
 */
class StorageService {
  /**
   * Set an item in localStorage with JSON serialization
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }

  /**
   * Get an item from localStorage with JSON deserialization
   */
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove an item from localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  /**
   * Clear all localStorage items
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get user data from localStorage
   */
  static getUser<T>(): T | null {
    return this.getItem<T>(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Set user data in localStorage
   */
  static setUser<T>(user: T): void {
    this.setItem(STORAGE_KEYS.USER_DATA, user);
  }

  /**
   * Remove user data from localStorage
   */
  static removeUser(): void {
    this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Get authentication token from localStorage
   */
  static getToken(): string | null {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Set authentication token in localStorage
   */
  static setToken(token: string): void {
    this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Remove authentication token from localStorage
   */
  static removeToken(): void {
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Check if user is authenticated (token exists)
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default StorageService;
