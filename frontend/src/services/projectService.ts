import apiClient from '../lib/axios';
import {
  Project,
  ProjectFilters,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/project';
import { Pagination, ApiErrorResponse } from '../types/common';
import { AxiosError } from 'axios';

/**
 * Service for project-related API endpoints
 */
export const projectService = {
  /**
   * Get projects with optional filters
   * @param filters - Optional query parameters for filtering projects
   * @returns Response with projects and pagination
   */
  async getProjects(filters?: ProjectFilters): Promise<{ proyectos: Project[]; paginacion: Pagination }> {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const url = `/proyectos${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get a specific project by ID
   * @param id - Project ID
   * @returns The requested project
   */
  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get(`/proyectos/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   * @param project - Project data to create
   * @returns The created project
   */
  async createProject(project: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post('/proyectos', project);
    return response.data;
  },

  /**
   * Update an existing project
   * @param id - Project ID to update
   * @param project - Project data to update
   * @returns The updated project
   */
  async updateProject(id: string, project: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put(`/proyectos/${id}`, project);
    return response.data;
  },

  /**
   * Delete a project
   * @param id - Project ID to delete
   */
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/proyectos/${id}`);
  },

  /**
   * Get project statistics
   * @param id - Project ID
   * @returns Statistics for the project
   */
  async getProjectStatistics(id: string): Promise<any> {
    const response = await apiClient.get(`/proyectos/${id}/estadisticas`);
    return response.data;
  },

  /**
   * Add a team to a project
   * @param projectId - Project ID
   * @param teamId - Team ID to add
   * @returns Updated project with teams
   */
  async addTeamToProject(projectId: string, teamId: string): Promise<any> {
    const response = await apiClient.post(`/proyectos/${projectId}/equipos`, { equipo_id: teamId });
    return response.data;
  },

  /**
   * Remove a team from a project
   * @param projectId - Project ID
   * @param teamId - Team ID to remove
   */
  async removeTeamFromProject(projectId: string, teamId: string): Promise<void> {
    await apiClient.delete(`/proyectos/${projectId}/equipos/${teamId}`);
  },
};
