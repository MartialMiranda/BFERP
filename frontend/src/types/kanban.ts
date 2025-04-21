import { Task } from './task';

/**
 * Kanban column interface
 */
export interface KanbanColumn {
  id: string;
  nombre: string;
  posicion: number;
  proyecto_id: string;
  tareas: KanbanTask[];
}

/**
 * Kanban task interface extending the base Task with kanban-specific fields
 */
export interface KanbanTask extends Task {
  columna_id: string;
  posicion: number;
}

/**
 * Create kanban column request
 */
export interface CreateKanbanColumnRequest {
  nombre: string;
  posicion?: number;
  proyecto_id: string;
}

/**
 * Update kanban column request
 */
export interface UpdateKanbanColumnRequest {
  nombre?: string;
  posicion?: number;
}

/**
 * Create kanban task request
 */
export interface CreateKanbanTaskRequest {
  titulo: string;
  descripcion?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en progreso' | 'completada' | 'bloqueada';
  fecha_vencimiento?: string;
  asignado_a?: string;
  columna_id: string;
  posicion?: number;
}

/**
 * Update kanban task request
 */
export interface UpdateKanbanTaskRequest {
  titulo?: string;
  descripcion?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en progreso' | 'completada' | 'bloqueada';
  fecha_vencimiento?: string;
  asignado_a?: string | null;
  columna_id?: string;
  posicion?: number;
}

/**
 * Task movement request for drag-and-drop operations
 */
export interface MoveTaskRequest {
  tarea_id: string;
  columna_destino_id: string;
  posicion_destino: number;
}

/**
 * Kanban state in Redux
 */
export interface KanbanState {
  columns: KanbanColumn[];
  loading: boolean;
  error: string | null;
}
