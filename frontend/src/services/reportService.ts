/**
 * Servicio para obtener datos de reportes
 * Incluye métodos para recuperar estadísticas y datos analíticos del sistema ERP
 */

import { apiClient } from './apiClient';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/common';

/**
 * Interfaz para estadísticas de proyectos por estado
 */
export interface ProjectStats {
  activo: number;
  completado: number;
  cancelado: number;
  total: number;
}

/**
 * Interfaz para estadísticas de tareas por estado
 */
export interface TaskStats {
  pendiente: number;
  en_progreso: number;
  completada: number;
  bloqueada: number;
  total: number;
}

/**
 * Interfaz para estadísticas de tareas por prioridad
 */
export interface PriorityStats {
  baja: number;
  media: number;
  alta: number;
  total: number;
}

/**
 * Interfaz para datos de rendimiento de usuario
 */
export interface UserPerformance {
  usuario_id: string;
  nombre: string;
  tareas_asignadas: number;
  tareas_completadas: number;
  porcentaje_completado: number;
  tiempo_promedio_completado?: number;
}

/**
 * Interfaz para estadísticas generales del sistema
 */
export interface SystemStats {
  usuarios_activos: number;
  proyectos_activos: number;
  tareas_pendientes: number;
  actividades_recientes: number;
}

/**
 * Interfaz para actividad reciente
 */
export interface RecentActivity {
  id: string;
  tipo: 'proyecto' | 'tarea' | 'usuario';
  accion: string;
  descripcion: string;
  fecha: string;
  usuario_id: string;
  usuario_nombre: string;
}

/**
 * Servicio para reportes y análisis de datos
 */
export const reportService = {
  /**
   * Obtiene estadísticas generales del sistema
   */
  getSystemStats: async (): Promise<SystemStats> => {
    try {
      const response = await apiClient.get('/reportes/estadisticas');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al obtener estadísticas del sistema:', axiosError.message);
      throw axiosError;
    }
  },

  /**
   * Obtiene estadísticas de proyectos
   */
  getProjectStats: async (): Promise<ProjectStats> => {
    try {
      const response = await apiClient.get('/reportes/proyectos');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al obtener estadísticas de proyectos:', axiosError.message);
      throw axiosError;
    }
  },

  /**
   * Obtiene estadísticas de tareas
   */
  getTaskStats: async (): Promise<{ estado: TaskStats; prioridad: PriorityStats }> => {
    try {
      const response = await apiClient.get('/reportes/tareas');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al obtener estadísticas de tareas:', axiosError.message);
      throw axiosError;
    }
  },

  /**
   * Obtiene datos de rendimiento de usuarios
   */
  getUserPerformance: async (): Promise<UserPerformance[]> => {
    try {
      const response = await apiClient.get('/reportes/usuarios/rendimiento');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al obtener rendimiento de usuarios:', axiosError.message);
      throw axiosError;
    }
  },

  /**
   * Obtiene la actividad reciente del sistema
   * @param days Número de días para filtrar la actividad
   */
  getRecentActivity: async (days = 30): Promise<RecentActivity[]> => {
    try {
      const response = await apiClient.get(`/reportes/actividad?dias=${days}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error al obtener actividad reciente:', axiosError.message);
      throw axiosError;
    }
  }
};
