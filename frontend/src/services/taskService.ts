import apiClient from '../lib/axios';
import {
  Task,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskProgressReport,
} from '../types/task';
import { Pagination } from '../types/common';
import { AxiosError } from 'axios';

/**
 * Service for task-related API endpoints
 */
export const taskService = {
  /**
   * Get tasks with optional filters
   * @param filters - Optional query parameters for filtering tasks
   * @returns Response with tasks and pagination
   */
  async getTasks(filters?: TaskFilters): Promise<{ tareas: Task[]; paginacion: Pagination }> {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Only append meaningful filter values (exclude undefined, null, empty strings)
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/tareas${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get tasks for a specific project
   * @param projectId - Project ID
   * @param filters - Optional query parameters for filtering tasks
   * @returns Response with tasks and pagination
   */
  async getProjectTasks(projectId: string, filters?: TaskFilters): Promise<{ tareas: Task[]; paginacion: Pagination }> {
    const queryParams = new URLSearchParams();
    queryParams.append('proyecto_id', projectId);
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Exclude proyecto_id (already added) and empty filters
        if (key !== 'proyecto_id' && value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/tareas?${queryString}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get a specific task by ID
   * @param id - Task ID
   * @returns The requested task
   */
  async getTask(id: string): Promise<Task> {
    const response = await apiClient.get(`/tareas/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   * @param task - Task data to create
   * @returns The created task
   */
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post('/tareas', task);
    return response.data;
  },

  /**
   * Update an existing task
   * @param id - Task ID to update
   * @param task - Task data to update
   * @returns The updated task
   */
  async updateTask(id: string, task: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put(`/tareas/${id}`, task);
    return response.data;
  },

  /**
   * Delete a task
   * @param id - Task ID to delete
   */
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tareas/${id}`);
  },

  /**
   * Report progress on a task
   * @param id - Task ID
   * @param progress - Progress data to report
   * @returns Updated task with progress information
   */
  async reportTaskProgress(id: string, progress: TaskProgressReport): Promise<any> {
    const response = await apiClient.post(`/tareas/${id}/progreso`, progress);
    return response.data;
  },

  /**
   * Get tasks assigned to the current user
   * @param filters - Optional query parameters for filtering tasks
   * @returns Response with tasks and pagination
   */
  async getMyTasks(filters?: TaskFilters): Promise<{ tareas: Task[]; paginacion: any }> {
    const queryParams = new URLSearchParams();
    queryParams.append('asignado_a_mi', 'true');
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/tareas?${queryString}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },
};
