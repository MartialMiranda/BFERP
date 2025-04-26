/**
 * Task interface representing a task in the system
 */
export interface Task {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en progreso' | 'completada' | 'bloqueada';
  fecha_vencimiento: string | null;
  proyecto_id: string;
  equipo_id: string;
  asignado_a: string | null;
  creado_en: string;
  actualizado_en: string;
  asignado_nombre?: string;
  asignado_email?: string;
}

/**
 * Task filters for API queries
 */
export interface TaskFilters {
  proyecto_id?: string;
  estado?: 'pendiente' | 'en progreso' | 'completada' | 'bloqueada';
  prioridad?: 'baja' | 'media' | 'alta';
  asignado_a?: string;
  titulo?: string;
  fecha_vencimiento_desde?: string;
  fecha_vencimiento_hasta?: string;
  ordenar_por?: 'titulo' | 'fecha_vencimiento' | 'prioridad' | 'estado' | 'creado_en';
  orden?: 'asc' | 'desc';
  pagina?: number;
  por_pagina?: number;
}

/**
 * Task creation request interface
 */
export interface CreateTaskRequest {
  titulo: string;
  descripcion?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en progreso' | 'completada' | 'bloqueada';
  fecha_vencimiento?: string;
  equipo_id: string;
  asignado_a?: string;
}

/**
 * Task update request interface
 */
export interface UpdateTaskRequest {
  titulo?: string;
  descripcion?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en progreso' | 'completada' | 'bloqueada';
  fecha_vencimiento?: string;
  asignado_a?: string | null;
}

/**
 * Task progress report interface
 */
export interface TaskProgressReport {
  porcentaje_completado: number;
  comentario?: string;
  horas_trabajadas?: number;
}

/**
 * Tasks state in Redux
 */
export interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
  };
}
