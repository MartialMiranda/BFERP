/**
 * Interfaces comunes utilizadas en toda la aplicación
 */

/**
 * Interfaz para información de paginación
 */
export interface Pagination {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

/**
 * Interfaz para respuestas de error de la API
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Interfaz genérica para un modelo de usuario 
 * (utilizada en contextos donde no se necesita toda la información específica)
 */
export interface GenericUser {
  id: string;
  nombre?: string;
  email?: string;
  [key: string]: unknown;
} 