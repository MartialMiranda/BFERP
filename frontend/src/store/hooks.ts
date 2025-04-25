import { useDispatch } from 'react-redux';
import type { AppDispatch } from './index';

// Typed hook to dispatch thunks
export const useAppDispatch = () => useDispatch<AppDispatch>();
