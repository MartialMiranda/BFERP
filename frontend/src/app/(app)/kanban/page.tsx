'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Container, CircularProgress, Alert } from '@mui/material';
import { RootState, AppDispatch } from '@/store';
import KanbanBoard from '@/components/modules/kanban/KanbanBoard';
import KanbanFilters from '@/components/modules/kanban/KanbanFilters';
import { fetchTasks, updateTask } from '@/store/slices/tasksSlice';
import { fetchProjects } from '@/store/slices/projectsSlice';
import PageHeader from '@/components/common/PageHeader';
import { Task, TaskFilters } from '@/types/task';

// Derive TaskStatus from Task interface
type TaskStatus = Task['estado'];

interface FilterState {
  projectId: string;
  priority: 'baja' | 'media' | 'alta' | '';
  search: string;
}

export default function KanbanPage() {
  const dispatch = useDispatch<AppDispatch>();
  // Especificar explícitamente el tipo de tasks como Task[]
  const { tasks = [] as Task[], loading, error } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    projectId: '',
    priority: '',
    search: ''
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    dispatch(fetchProjects({}));
  }, [dispatch]);

  // Fetch tasks when a project is selected
  useEffect(() => {
    if (filters.projectId) {
      dispatch(fetchTasks({ proyecto_id: filters.projectId }));
    } else {
      setFilteredTasks([]);
    }
  }, [filters.projectId, dispatch]);

  // Aplicar filtros cuando cambien las tareas o los filtros
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      let result: Task[] = [...tasks];

      if (filters.projectId) {
        result = result.filter(task => task.proyecto_id === filters.projectId);
      }

      if (filters.priority) {
        result = result.filter(task => task.prioridad === filters.priority);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(task => 
          task.titulo.toLowerCase().includes(searchLower) || 
          (task.descripcion && task.descripcion.toLowerCase().includes(searchLower))
        );
      }

      setFilteredTasks(result);
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, filters]);

  // Manejar el cambio de estado de una tarea
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    dispatch(updateTask({ id: taskId, estado: newStatus }));
  };

  // Refrescar tareas desde el backend tras mover o reordenar
  const handleRefresh = () => {
    if (filters.projectId) {
      dispatch(fetchTasks({ proyecto_id: filters.projectId }));
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Agrupar tareas por estado
  const groupedTasks: Record<TaskStatus, Task[]> = {
    pendiente: filteredTasks.filter(task => task.estado === 'pendiente'),
    'en progreso': filteredTasks.filter(task => task.estado === 'en progreso'),
    completada: filteredTasks.filter(task => task.estado === 'completada'),
    bloqueada: filteredTasks.filter(task => task.estado === 'bloqueada')
  };

  return (
    <Container maxWidth="xl">
      <PageHeader title="Tablero Kanban" />
      
      <KanbanFilters 
        projects={projects} 
        onFilterChange={handleFilterChange}
        filters={filters}
      />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar las tareas: {error}
        </Alert>
      ) : !filters.projectId ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Seleccione un proyecto para ver el tablero
        </Alert>
      ) : (
        <KanbanBoard
          tasks={groupedTasks}
          onStatusChange={handleStatusChange}
          onRefresh={handleRefresh}
        />
      )}
    </Container>
  );
}
