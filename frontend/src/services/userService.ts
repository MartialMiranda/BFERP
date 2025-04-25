import apiClient from '../lib/axios';
import { User } from '../types/user';

export const userService = {
  async getUsers(): Promise<User[]> {
    // Fetch from backend users endpoint (mounted at /api/users)
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },
};
