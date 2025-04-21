import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from './customStorage';

// Import reducers that are working
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// Create temporary reducers for the ones with import issues
const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    totalProjects: 0,
  },
  reducers: {},
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    totalTasks: 0,
  },
  reducers: {},
});

const teamsSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    currentTeam: null,
    loading: false,
    error: null,
    totalTeams: 0,
  },
  reducers: {},
});

/**
 * Combined root reducer including all feature reducers
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  projects: projectsSlice.reducer,
  tasks: tasksSlice.reducer,
  teams: teamsSlice.reducer,
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
