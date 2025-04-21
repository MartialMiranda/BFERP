import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Notification severity types
export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

// Notification interface
export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration?: number;
}

// UI state interface
interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  darkMode: boolean;
  loading: boolean;
  loadingText: string;
}

// Initial UI state
const initialState: UIState = {
  sidebarOpen: false,
  notifications: [],
  darkMode: false,
  loading: false,
  loadingText: '',
};

/**
 * UI slice for managing UI-related state
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        ...action.payload,
        autoHideDuration: action.payload.autoHideDuration || 5000, // Default to 5 seconds
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Theme actions
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    
    // Loading state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (!action.payload) {
        state.loadingText = '';
      }
    },
    setLoadingText: (state, action: PayloadAction<string>) => {
      state.loadingText = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleDarkMode,
  setDarkMode,
  setLoading,
  setLoadingText,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectLoading = (state: RootState) => state.ui.loading;
export const selectLoadingText = (state: RootState) => state.ui.loadingText;
