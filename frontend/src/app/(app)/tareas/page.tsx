'use client';

import { useState } from 'react';
import { Container, Paper } from '@mui/material';
import { TaskFilters as TaskFiltersType } from '@/types/task';
import TaskFilters from '@/components/modules/tareas/TaskFilters';
import TaskList from '@/components/modules/tareas/TaskList';
import TaskForm from '@/components/modules/tareas/TaskForm';
import TaskDetailsDialog from '@/components/modules/tareas/TaskDetailsDialog';
import DeleteTaskDialog from '@/components/modules/tareas/DeleteTaskDialog';
import TasksHeader from '@/components/modules/tareas/TasksHeader';
import TasksStatus from '@/components/modules/tareas/TasksStatus';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useTaskOptions } from '@/hooks/tasks/useTaskOptions';

/**
 * Página de gestión de tareas
 */
const TasksPage = () => {
  // Estado para diálogos y formularios
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Inicializamos los filtros por defecto
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

  // Usamos los hooks personalizados
  const {
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
    saveTask
  } = useTasks(initialFilters);

  const { projectOptions, userOptions } = useTaskOptions();

  /**
   * Abrir formulario para nueva tarea
   */
  const handleAddTask = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  /**
   * Ver detalles de tarea
   */
  const handleViewTask = async (taskId: string) => {
    const task = await fetchTaskDetails(taskId);
    if (task) {
      setSelectedTask(task);
      setDetailsOpen(true);
    }
  };

  /**
   * Abrir formulario para editar tarea
   */
  const handleEditTask = async (taskId: string) => {
    const task = await fetchTaskDetails(taskId);
    if (task) {
      setSelectedTask(task);
      setFormOpen(true);
    }
  };

  /**
   * Abrir diálogo de confirmación para eliminar tarea
   */
  const handleDeletePrompt = async (taskId: string) => {
    const task = await fetchTaskDetails(taskId);
    if (task) {
      setSelectedTask(task);
      setDeleteDialogOpen(true);
    }
  };

  /**
   * Eliminar tarea
   */
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    const success = await deleteTask(selectedTask.id);
    if (success) {
      setDeleteDialogOpen(false);
    }
  };

  /**
   * Guardar tarea (crear o actualizar)
   */
  const handleSaveTask = async (taskData: any) => {
    setFormLoading(true);
    const isEdit = !!selectedTask;
    
    const success = await saveTask(taskData, isEdit);
    if (success) {
      setFormOpen(false);
    }
    
    setFormLoading(false);
  };

  return (
    <Container maxWidth="xl">
      {/* Cabecera de la página */}
      <TasksHeader onAddTask={handleAddTask} />
      
      {/* Filtros de tareas */}
      <Paper className="p-4 mb-4">
        <TaskFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          projectOptions={projectOptions}
          userOptions={userOptions}
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
        task={selectedTask || undefined}
        isLoading={formLoading}
        projectOptions={projectOptions}
        userOptions={userOptions}
      />
      
      {/* Diálogo de detalles de tarea */}
      {selectedTask && (
        <TaskDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          task={selectedTask}
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
        task={selectedTask}
      />
    </Container>
  );
};

export default TasksPage;
