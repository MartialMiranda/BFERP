import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Task, TaskFilters } from '@/types/task';
import { taskService } from '@/services/taskService';
import { addNotification } from '@/store/slices/uiSlice';

export const useTasks = (initialFilters: TaskFilters) => {
  const dispatch = useDispatch();
  
  // Estado para tareas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Estado para filtros
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);

  /**
   * Cargar tareas desde el API
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.getTasks(filters);
      setTasks(response.tareas);
      setTotalTasks(response.paginacion.total || 0);
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error al cargar las tareas. Por favor, intenta nuevamente.');
      console.error('Error loading tasks:', err);
    }
  }, [filters]);

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * Manejar cambios en los filtros
   */
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  /**
   * Buscar tareas
   */
  const handleSearch = () => {
    setFilters({ ...filters, pagina: 1 });
    loadTasks();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  /**
   * Ver detalles de tarea
   */
  const fetchTaskDetails = async (taskId: string): Promise<Task | null> => {
    try {
      return await taskService.getTask(taskId);
    } catch (err) {
      console.error('Error loading task details:', err);
      dispatch(addNotification({
        severity: 'error',
        message: 'Error al cargar los detalles de la tarea',
      }));
      return null;
    }
  };

  /**
   * Eliminar tarea
   */
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
      
      dispatch(addNotification({
        severity: 'success',
        message: 'Tarea eliminada correctamente',
      }));
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      dispatch(addNotification({
        severity: 'error',
        message: 'Error al eliminar la tarea',
      }));
      return false;
    }
  };

  /**
   * Guardar tarea (crear o actualizar)
   */
  const saveTask = async (taskData: any, isEdit: boolean): Promise<boolean> => {
    try {
      if (isEdit && taskData.id) {
        // Actualizar tarea existente
        const { id, ...updateData } = taskData;
        await taskService.updateTask(id, updateData);
        
        dispatch(addNotification({
          severity: 'success',
          message: 'Tarea actualizada correctamente',
        }));
      } else {
        // Crear nueva tarea
        await taskService.createTask(taskData);
        
        dispatch(addNotification({
          severity: 'success',
          message: 'Tarea creada correctamente',
        }));
      }
      
      await loadTasks();
      return true;
    } catch (err) {
      console.error('Error saving task:', err);
      
      dispatch(addNotification({
        severity: 'error',
        message: 'Error al guardar la tarea',
      }));
      return false;
    }
  };

  return {
    tasks,
    loading,
    error,
    totalTasks,
    filters,
    selectedTask,
    setSelectedTask,
    handleFilterChange,
    handleSearch,
    handleClearFilters,
    fetchTaskDetails,
    deleteTask,
    saveTask,
    loadTasks
  };
};
