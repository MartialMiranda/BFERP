'use client';

import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography } from '@mui/material';
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
import { addNotification } from '@/store/slices/uiSlice'; 
import { userService } from '@/services/userService'; 
import { teamService } from '@/services/teamService'; 
import { projectService } from '@/services/projectService';
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

  // Selector de usuario actual
  const currentUser = useSelector(selectCurrentUser);
  // Si no hay usuario, mostramos cargando
  if (!currentUser) {
    return (
      <Container maxWidth="xl">
        <Typography>Cargando usuario...</Typography>
      </Container>
    );
  }

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

  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errorTeams, setErrorTeams] = useState<string | null>(null);

  const initialFilters: TaskFiltersType = {
    titulo: '',
    estado: undefined,
    prioridad: undefined,
    proyecto_id: undefined,
    asignado_a: undefined,
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
    // Fetch tasks when filters change
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);
  useEffect(() => {
    // Load only this user's projects on mount
    dispatch(fetchProjects({ pagina: 1, por_pagina: 100, usuario_id: currentUser.id }));
    userService.getUsers()
      .then(setUsers)
      .catch(() => dispatch(addNotification({ message: 'Error cargando usuarios globales', severity: 'error' })));  
  }, [dispatch, currentUser.id]);
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
      projectService.getProjectUsers(selectedProjectId)
        .then(data => setProjectMembers(data))
        .catch((err: any) => setErrorMembers(err.response?.data?.error || err.message || 'Error cargando miembros del proyecto'))
        .finally(() => setLoadingMembers(false));
    } else {
      setProjectMembers([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      setLoadingTeams(true);
      setErrorTeams(null);
      teamService.getTeams({ proyecto_id: selectedProjectId })
        .then(data => setTeamOptions(data.equipos.map(e => ({ value: e.id, label: e.nombre }))))
        .catch(err => setErrorTeams(err.response?.data?.error || err.message || 'Error cargando equipos'))
        .finally(() => setLoadingTeams(false));
    } else {
      setTeamOptions([]);
    }
  }, [selectedProjectId]);

  // Filter client-side by title
  const displayedTasks = filters.titulo
    ? tasks.filter(t => t.titulo.toLowerCase().includes((filters.titulo || '').toLowerCase()))
    : tasks;

  // Options
  // Derivar opciones de proyectos desde Redux state
  const projectOptionsForForm = allProjects
    .filter(p => p.creado_por === currentUser.id)
    .map(p => ({ value: p.id, label: p.nombre || '' }));
  const userOptionsForAssignment = projectMembers.map(u => ({ value: u.id, label: u.nombre || u.email || '' }));
  const projectOptionsForFilter = allProjects
    .filter(p => p.creado_por === currentUser.id)
    .map(p => ({ value: p.id, label: p.nombre || '' }));
  const userOptionsForFilter = users.map(u => ({ value: u.id, label: u.nombre || u.email || '' }));

  // Handlers
  const handleSearch = (searchText: string) => {
    console.log('TasksPage.handleSearch:', searchText);
    setFilters(prev => ({ ...prev, titulo: searchText, pagina: 1 }));
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
    setSelectedProjectId(null);
    setProjectMembers([]);
    setTeamOptions([]);
    setFormOpen(true);
  };
  const handleViewTask = (id: string) => {
    console.log('TasksPage.handleViewTask id:', id);
    dispatch(fetchTaskById(id)).unwrap().then(() => {
      console.log('TasksPage.handleViewTask fetched');
      setDetailsOpen(true);
    });
  };
  const handleEditTask = (id: string) => {
    console.log('TasksPage.handleEditTask id:', id);
    dispatch(fetchTaskById(id)).unwrap().then((taskData) => {
      // Load into form state
      dispatch(setCurrentTask(taskData));
      if (taskData?.proyecto_id) {
        setSelectedProjectId(taskData.proyecto_id);
      } else {
        setSelectedProjectId(null);
        setProjectMembers([]);
        setTeamOptions([]);
      }
      setFormOpen(true);
    });
  };
  const handleDeletePrompt = (id: string) => {
    console.log('TasksPage.handleDeletePrompt id:', id);
    dispatch(fetchTaskById(id)).unwrap().then(() => {
      console.log('TasksPage.handleDeletePrompt fetched');
      setDeleteDialogOpen(true);
    });
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
        // Reset states
        dispatch(setCurrentTask(null));
        setSelectedProjectId(null);
        setProjectMembers([]);
        setTeamOptions([]);
        setFilters({ ...filters });
      })
      .catch((msg: string) => dispatch(addNotification({ message: msg, severity: 'error' })))
      .finally(() => setFormLoading(false));
  };
  const handleProjectChange = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

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
        tasksCount={displayedTasks.length}
        totalTasks={totalTasks}
      />
      
      {/* Lista de tareas */}
      <TaskList
        tasks={displayedTasks}
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
        teamOptions={teamOptions}
        loadingTeams={loadingTeams}
        errorTeams={errorTeams}
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
