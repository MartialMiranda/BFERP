import apiClient from '../lib/axios';
import {
  Project,
  ProjectFilters,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/project';
import { Pagination, ApiErrorResponse } from '../types/common';
import { User } from '../types/user';

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
    
    // Mapeamos los parámetros según lo esperado por el backend
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided, pero solo si tienen valor
    if (filters) {
      // Estas son las correspondencias entre frontend y backend
      if (filters.pagina) queryParams.append('pagina', filters.pagina.toString());
      if (filters.por_pagina) queryParams.append('por_pagina', filters.por_pagina.toString());
      
      // El estado solo se envía si existe y no es 'todos' (que significa mostrar todos)
      if (filters.estado && 
          filters.estado !== 'todos' && 
          ['planificado', 'en progreso', 'completado', 'cancelado'].includes(filters.estado)) {
        queryParams.append('estado', filters.estado);
      }
      
      // El término de búsqueda se envía como nombre
      if (filters.nombre && filters.nombre.trim() !== '') {
        queryParams.append('nombre', filters.nombre.trim());
      }
      
      // Ordenamiento - solo añadir si es un valor válido
      const validOrderFields = ['nombre', 'fecha_inicio', 'fecha_fin', 'estado', 'creado_en'];
      if (filters.ordenar_por && validOrderFields.includes(filters.ordenar_por)) {
        queryParams.append('ordenar_por', filters.ordenar_por);
      }
      
      // Orden: asc o desc
      if (filters.orden && ['asc', 'desc'].includes(filters.orden)) {
        queryParams.append('orden', filters.orden);
      }
      
      // Otros filtros de fecha si existen
      if (filters.fecha_inicio_desde) queryParams.append('fecha_inicio_desde', filters.fecha_inicio_desde);
      if (filters.fecha_inicio_hasta) queryParams.append('fecha_inicio_hasta', filters.fecha_inicio_hasta);
      if (filters.fecha_fin_desde) queryParams.append('fecha_fin_desde', filters.fecha_fin_desde);
      if (filters.fecha_fin_hasta) queryParams.append('fecha_fin_hasta', filters.fecha_fin_hasta);
    }
    
    const queryString = queryParams.toString();
    const url = `/proyectos${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
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

  /**
   * Obtener usuarios asignados a un proyecto
   * @param projectId - ID del proyecto
   */
  async getProjectUsers(projectId: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/proyectos/${projectId}/usuarios`);
    return response.data;
  },
};
