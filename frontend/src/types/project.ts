/**
 * Project interface representing a project in the system
 */
export interface Project {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: 'planificado' | 'en progreso' | 'completado' | 'cancelado';
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
  creador_nombre?: string;
  progreso?: number;
  total_tareas?: number;
  tareas_completadas?: number;
  equipos?: Team[];
}

/**
 * Team interface representing a team assigned to projects
 */
export interface Team {
  id: string;
  nombre: string;
  descripcion: string | null;
  creado_en: string;
  actualizado_en: string;
  total_miembros?: number;
}

/**
 * Project filters for API queries
 */
export interface ProjectFilters {
  estado?: 'planificado' | 'en progreso' | 'completado' | 'cancelado' | 'todos' | '';
  nombre?: string;
  fecha_inicio_desde?: string;
  fecha_inicio_hasta?: string;
  fecha_fin_desde?: string;
  fecha_fin_hasta?: string;
  ordenar_por?: 'nombre' | 'fecha_inicio' | 'fecha_fin' | 'estado' | 'creado_en' | '';
  orden?: 'asc' | 'desc';
  pagina?: number;
  por_pagina?: number;
}

/**
 * Project creation request interface
 */
export interface CreateProjectRequest {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado?: 'planificado' | 'en progreso' | 'completado' | 'cancelado';
}

/**
 * Project update request interface
 */
export interface UpdateProjectRequest {
  nombre?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: 'planificado' | 'en progreso' | 'completado' | 'cancelado';
}

/**
 * Projects state in Redux
 */
export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
  };
}
