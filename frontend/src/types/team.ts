import { Pagination } from './common';

/**
 * Interfaz que representa un equipo
 */
export interface Team {
  id: string;
  nombre: string;
  descripcion: string | null;
  lider_id: string;
  lider_nombre?: string;
  proyecto_id?: string;
  proyecto_nombre?: string;
  creado_en: string;
  actualizado_en: string;
  total_miembros?: number;
  total_tareas?: number;
}

/**
 * Interfaz que representa un miembro de equipo
 */
export interface TeamMember {
  id: string;
  usuario_id: string;
  equipo_id: string;
  rol: string;
  nombre_usuario?: string;
  email_usuario?: string;
}

/**
 * Filtros disponibles para consultar equipos
 */
export interface TeamFilters {
  pagina?: number;
  por_pagina?: number;
  proyecto_id?: string;
  lider_id?: string;
  busqueda?: string;
  soy_miembro?: boolean;
  soy_lider?: boolean;
  ordenar_por?: 'nombre' | 'creado_en' | 'actualizado_en';
  orden?: 'asc' | 'desc';
}

/**
 * Respuesta de la API para lista de equipos
 */
export interface TeamsResponse {
  equipos: Team[];
  paginacion: Pagination;
}
