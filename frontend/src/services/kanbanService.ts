import apiClient from '../lib/axios';
import {
  KanbanColumn,
  CreateKanbanColumnRequest,
  UpdateKanbanColumnRequest,
  CreateKanbanTaskRequest,
  UpdateKanbanTaskRequest,
  MoveTaskRequest,
} from '../types/kanban';

/**
 * Service for kanban-related API endpoints
 */
export const kanbanService = {
  /**
   * Get all kanban columns for a project with their associated tasks
   * @param projectId - Project ID to get kanban columns for
   * @returns List of kanban columns with tasks
   */
  async getProjectColumns(projectId: string): Promise<KanbanColumn[]> {
    const response = await apiClient.get(`/kanban/columnas/proyecto/${projectId}`);
    return response.data;
  },

  /**
   * Get a specific kanban column with its tasks
   * @param columnId - Column ID
   * @returns The requested kanban column with tasks
   */
  async getColumn(columnId: string): Promise<KanbanColumn> {
    const response = await apiClient.get(`/kanban/columnas/${columnId}`);
    return response.data;
  },

  /**
   * Create a new kanban column
   * @param column - Column data to create
   * @returns The created kanban column
   */
  async createColumn(column: CreateKanbanColumnRequest): Promise<KanbanColumn> {
    const response = await apiClient.post('/kanban/columnas', column);
    return response.data;
  },

  /**
   * Update an existing kanban column
   * @param columnId - Column ID to update
   * @param column - Column data to update
   * @returns The updated kanban column
   */
  async updateColumn(columnId: string, column: UpdateKanbanColumnRequest): Promise<KanbanColumn> {
    const response = await apiClient.put(`/kanban/columnas/${columnId}`, column);
    return response.data;
  },

  /**
   * Delete a kanban column
   * @param columnId - Column ID to delete
   */
  async deleteColumn(columnId: string): Promise<void> {
    await apiClient.delete(`/kanban/columnas/${columnId}`);
  },

  /**
   * Create a new task in a kanban column
   * @param task - Task data to create
   * @returns The created kanban task
   */
  async createTask(task: CreateKanbanTaskRequest): Promise<any> {
    const response = await apiClient.post('/kanban/tareas', task);
    return response.data;
  },

  /**
   * Update an existing kanban task
   * @param taskId - Task ID to update
   * @param task - Task data to update
   * @returns The updated kanban task
   */
  async updateTask(taskId: string, task: UpdateKanbanTaskRequest): Promise<any> {
    const response = await apiClient.put(`/kanban/tareas/${taskId}`, task);
    return response.data;
  },

  /**
   * Delete a kanban task
   * @param taskId - Task ID to delete
   */
  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/kanban/tareas/${taskId}`);
  },

  /**
   * Move a task by updating its column and position
   */
  async moveTask({ tarea_id, columna_destino_id, posicion_destino }: MoveTaskRequest): Promise<any> {
    // Use updateTask endpoint to move task
    return this.updateTask(tarea_id, {
      columna_id: columna_destino_id,
      posicion: posicion_destino,
    });
  },

  /**
   * Bulk reorder tasks in a column based on an ordered list of IDs
   */
  async bulkReorder(columnId: string, orderedIds: string[]): Promise<any> {
    const response = await apiClient.post(
      `/kanban/columnas/${columnId}/reordenar`,
      { orderedIds }
    );
    return response.data;
  },

  /**
   * Reorder tasks within a column by updating each task's position
   */
  async reorderTasks(columnId: string, taskIds: string[]): Promise<void> {
    // Update each task's position sequentially to prevent DB deadlocks
    for (const [index, id] of taskIds.entries()) {
      await this.updateTask(id, { posicion: index });
    }
  },
};
