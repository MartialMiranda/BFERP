'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store'; 
import { selectUser as selectCurrentUser } from '@/store/slices/authSlice'; 
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  setCurrentTask,
  clearTasksError,
} from '@/store/slices/tasksSlice'; 
import { fetchProjects } from '@/store/slices/projectsSlice'; 
import { projectService } from '@/services/projectService'; 
import { addNotification } from '@/store/slices/uiSlice'; 
import { userService } from '@/services/userService'; 
import { User } from '@/types/user';
import { TaskFilters as TaskFiltersType } from '@/types/task';
import TaskFilters from '@/components/modules/tareas/TaskFilters';
import TaskList from '@/components/modules/tareas/TaskList';
import TaskForm from '@/components/modules/tareas/TaskForm';
import TaskDetailsDialog from '@/components/modules/tareas/TaskDetailsDialog';
import DeleteTaskDialog from '@/components/modules/tareas/DeleteTaskDialog';
import TasksHeader from '@/components/modules/tareas/TasksHeader';
import TasksStatus from '@/components/modules/tareas/TasksStatus';

/**
 * Página de gestión de tareas
 */
const TasksPage = () => {
  // Redux Toolkit hooks and local state
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, currentTask, loading, error, totalTasks } = useSelector((state: RootState) => state.tasks);
  const { projects: allProjects } = useSelector((state: RootState) => state.projects);

  // ---> Verificación añadida <-----
  if (typeof selectCurrentUser !== 'function') {
    // Lanza un error claro si el selector no se importó correctamente
    throw new Error("Error crítico: El selector 'selectCurrentUser' no se pudo importar o no es una función. Revisa la exportación en '@/store/slices/authSlice'.");
  }
  const currentUser = useSelector(selectCurrentUser); // Obtener usuario actual

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errorMembers, setErrorMembers] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const initialFilters: TaskFiltersType = {
    titulo: '',
    estado: undefined,
    prioridad: undefined,
    proyecto_id: '',
    asignado_a: '',
    fecha_vencimiento_desde: undefined,
    fecha_vencimiento_hasta: undefined,
    ordenar_por: 'fecha_vencimiento',
    orden: 'asc',
    pagina: 1,
    por_pagina: 30,
  };
  const [filters, setFilters] = useState<TaskFiltersType>(initialFilters);
  const [pageInfo, setPageInfo] = useState({ pagina: 1, total_paginas: 1 });

  // Effects
  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);
  useEffect(() => {
    dispatch(fetchProjects({ pagina: 1, por_pagina: 1000 }));
    userService.getUsers()
      .then(setUsers)
      .catch(() => dispatch(addNotification({ message: 'Error cargando usuarios globales', severity: 'error' })));
  }, [dispatch]);
  useEffect(() => {
    if (error) {
      dispatch(addNotification({ message: error, severity: 'error' }));
      dispatch(clearTasksError());
    }
  }, [error, dispatch]);
  useEffect(() => {
    const totalPag = Math.ceil(totalTasks / (filters.por_pagina || 1));
    setPageInfo({ pagina: filters.pagina || 1, total_paginas: totalPag });
  }, [totalTasks, filters]);
  useEffect(() => {
    if (selectedProjectId) {
      setLoadingMembers(true);
      setErrorMembers(null);
      setProjectMembers([]);

      // TODO: replace with real API call
      (async () => {
        try {
          await new Promise(r => setTimeout(r, 300));
          setProjectMembers(users.filter(u => u.id)); // fallback global users
        } catch (err) {
          setErrorMembers('Error cargando miembros del proyecto');
        } finally {
          setLoadingMembers(false);
        }
      })();
    } else {
      setProjectMembers([]);
    }
  }, [selectedProjectId, users]);

  // Options
  const userProjects = currentUser ? allProjects.filter((p: any) => p.creador_id === currentUser.id) : [];
  const projectOptionsForForm = userProjects.map(p => ({ value: p.id, label: p.nombre || '' }));
  const userOptionsForAssignment = projectMembers.map(u => ({ value: u.id, label: u.nombre || u.email || '' }));
  const projectOptionsForFilter = allProjects.map(p => ({ value: p.id, label: p.nombre || '' }));
  const userOptionsForFilter = users.map(u => ({ value: u.id, label: u.nombre || u.email || '' }));

  // Handlers
  const handleSearch = () => {
    setFilters({ ...filters, titulo: searchTerm.trim(), pagina: 1 });
  };
  const handleClear = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };
  const handlePage = (page: number) => {
    setFilters({ ...filters, pagina: page });
  };
  const handleAddTask = () => {
    dispatch(setCurrentTask(null));
    setSelectedProjectId(null); // Resetear proyecto seleccionado al abrir para crear
    setProjectMembers([]); // Resetear miembros
    setFormOpen(true);
  };
  const handleViewTask = (id: string) => {
    dispatch(fetchTaskById(id)).unwrap().then(() => setDetailsOpen(true));
  };
  const handleEditTask = (id: string) => {
    dispatch(fetchTaskById(id)).unwrap().then((taskData) => {
        if (taskData?.proyecto_id) {
          setSelectedProjectId(taskData.proyecto_id); // Establecer proyecto al editar
        } else {
          setSelectedProjectId(null);
          setProjectMembers([]);
        }
        setFormOpen(true);
    });
  };
  const handleDeletePrompt = (id: string) => {
    dispatch(fetchTaskById(id)).unwrap().then(() => setDeleteDialogOpen(true));
  };
  const handleDeleteTask = () => {
    if (!currentTask) return;
    dispatch(deleteTask(currentTask.id)).unwrap()
      .then(() => {
        dispatch(addNotification({ message: 'Tarea eliminada correctamente', severity: 'success' }));
        setDeleteDialogOpen(false);
        setFilters({ ...filters });
      })
      .catch((msg: string) => dispatch(addNotification({ message: msg, severity: 'error' })));
  };
  const handleSaveTask = (data: any) => {
    setFormLoading(true);
    const taskPayload = {
      ...data,
      asignado_a: data.asignado_a || undefined, // Enviar undefined si está vacío para que no se guarde ""
    };
    const action: any = currentTask ? updateTask({ id: currentTask.id, ...taskPayload }) : createTask(taskPayload);
    dispatch(action).unwrap()
      .then(() => {
        dispatch(addNotification({ message: `Tarea ${currentTask ? 'actualizada' : 'creada'} con éxito`, severity: 'success' }));
        setFormOpen(false);
        setSelectedProjectId(null); // Limpiar estado al guardar
        setProjectMembers([]);
        setFilters({ ...filters }); // Refrescar lista
      })
      .catch((msg: string) => dispatch(addNotification({ message: msg, severity: 'error' })))
      .finally(() => setFormLoading(false));
  };
  const handleProjectChange = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId);
  }, []);

  const loadingUsers = loadingMembers;
  const errorUsers = errorMembers;

  return (
    <Container maxWidth="xl">
      {/* Cabecera de la página */}
      <TasksHeader onAddTask={handleAddTask} />
      
      {/* Filtros de tareas */}
      <Paper className="p-4 mb-4">
        <TaskFilters
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          onClearFilters={handleClear}
          projectOptions={projectOptionsForFilter}
          userOptions={userOptionsForFilter}
        />
      </Paper>
      
      {/* Estado de las tareas (carga, error, totales) */}
      <TasksStatus 
        loading={loading}
        error={error}
        tasksCount={tasks.length}
        totalTasks={totalTasks}
      />
      
      {/* Lista de tareas */}
      <TaskList
        tasks={tasks}
        loading={loading}
        onViewTask={handleViewTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeletePrompt}
      />
      
      {/* Formulario de tarea (crear/editar) */}
      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveTask}
        task={currentTask || undefined}
        isLoading={formLoading || loadingMembers}
        projectOptions={projectOptionsForForm}
        users={projectMembers}
        loadingUsers={loadingUsers}
        errorUsers={errorUsers}
        onProjectChange={handleProjectChange}
      />
      
      {/* Diálogo de detalles de tarea */}
      {currentTask && (
        <TaskDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          task={currentTask}
          onEdit={() => {
            setDetailsOpen(false);
            setFormOpen(true);
          }}
          onDelete={() => {
            setDetailsOpen(false);
            setDeleteDialogOpen(true);
          }}
        />
      )}
      
      {/* Diálogo de confirmación para eliminar */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
        task={currentTask}
      />
    </Container>
  );
};

export default TasksPage;
