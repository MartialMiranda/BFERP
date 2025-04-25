import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from './customStorage';

// Import reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import projectsReducer from './slices/projectsSlice';
import tasksReducer from './slices/tasksSlice';
import teamsReducer from './slices/teamsSlice';

/**
 * Combined root reducer including all feature reducers
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  projects: projectsReducer,
  tasks: tasksReducer,
  teams: teamsReducer,
});

/**
 * Redux persist configuration
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist these reducers
};

/**
 * Root persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux store configuration - simplified to avoid errors
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
    return middleware;
  },
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Persisted store for maintaining state between sessions
 */
export const persistor = persistStore(store);

// Inferred types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
