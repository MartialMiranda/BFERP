'use client';

import { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  CircularProgress,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BlockIcon from '@mui/icons-material/Block';
import { Task } from '../../../types/task';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onViewTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * Componente para mostrar la lista de tareas
 */
const TaskList = ({ tasks, loading, onViewTask, onEditTask, onDeleteTask }: TaskListProps) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  /**
   * Abrir menú contextual para una tarea
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  /**
   * Cerrar menú contextual
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  /**
   * Formatear fecha en formato legible
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  /**
   * Obtener clase CSS para prioridad de tarea
   */
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200';
      case 'media':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200';
      case 'baja':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  /**
   * Obtener clase CSS para estado de tarea
   */
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completada':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200';
      case 'en progreso':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200';
      case 'pendiente':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-200';
      case 'bloqueada':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  /**
   * Obtener icono para prioridad de tarea
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <PriorityHighIcon />;
      case 'baja':
        return <LowPriorityIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  // Icono según estado de tarea
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <HourglassEmptyIcon color="warning" />;
      case 'en progreso':
        return <AutorenewIcon color="info" />;
      case 'completada':
        return <CheckCircleIcon color="success" />;
      case 'bloqueada':
        return <BlockIcon color="error" />;
      default:
        return <AssignmentIcon />;
    }
  };

  // Clase de borde según estado
  const getStatusBorderClass = (status: string) => {
    switch (status) {
      case 'pendiente': return 'border-secondary-500';
      case 'en progreso': return 'border-primary-500';
      case 'completada': return 'border-success-500';
      case 'bloqueada': return 'border-error-500';
      default: return 'border-gray-300';
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Typography variant="h6" className="mb-2">
          No se encontraron tareas
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          Intenta con diferentes filtros o crea una nueva tarea
        </Typography>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {tasks.map((task) => (
        <Grid item xs={12} md={6} lg={4} key={task.id}>
          <Card
            className={`h-full transition-shadow hover:shadow-lg cursor-pointer border-l-4 ${getStatusBorderClass(task.estado)}`}
            elevation={2}
            onClick={() => onViewTask(task.id)}
          >
            <Box className="p-4">
              <Box className="flex justify-between items-start">
                <Typography
                  variant="h6"
                  className="font-semibold hover:text-primary-600 transition-colors"
                >
                  {task.titulo}
                </Typography>
                
                <IconButton
                  aria-label="opciones"
                  size="small"
                  onClick={(e) => handleMenuOpen(e, task.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Box className="flex gap-2 mt-2 flex-wrap">
                <Chip
                  icon={getStatusIcon(task.estado)}
                  label={
                    task.estado === 'pendiente'
                      ? 'Pendiente'
                      : task.estado === 'en progreso'
                      ? 'En progreso'
                      : task.estado === 'completada'
                      ? 'Completada'
                      : 'Bloqueada'
                  }
                  size="small"
                  className={`${getStatusClass(task.estado)} font-medium`}
                  variant="outlined"
                />
                
                <Chip
                  icon={getPriorityIcon(task.prioridad)}
                  label={
                    task.prioridad === 'alta'
                      ? 'Alta'
                      : task.prioridad === 'media'
                      ? 'Media'
                      : 'Baja'
                  }
                  size="small"
                  className={`${getPriorityClass(task.prioridad)} font-medium`}
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="body2" className="mt-3 text-gray-600 dark:text-gray-300 h-12 overflow-hidden">
                {task.descripcion || 'Sin descripción'}
              </Typography>
              
              <Box className="mt-4">
                <Typography variant="caption" className="text-gray-500 block">
                  Vencimiento: {task.fecha_vencimiento ? formatDate(task.fecha_vencimiento) : 'Sin fecha'}
                </Typography>
              </Box>
              
              <Divider className="my-3" />
              
              <Box className="flex items-center">
                {task.asignado_a ? (
                  <>
                    <Avatar 
                      className="w-4 h-4 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs mr-2"
                    >
                      {task.asignado_nombre?.substring(0, 1) || '?'}
                    </Avatar>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-300">
                      {task.asignado_nombre || 'Usuario'}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" className="text-gray-500">
                    Sin asignar
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
      
      {/* Menú contextual para tareas */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTaskId) onViewTask(selectedTaskId);
          handleMenuClose();
        }}>
          <VisibilityIcon fontSize="small" className="mr-2" />
          <Typography>Ver detalles</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTaskId) onEditTask(selectedTaskId);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" className="mr-2" />
          <Typography>Editar</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTaskId) onDeleteTask(selectedTaskId);
          handleMenuClose();
        }} className="text-error-600">
          <DeleteIcon fontSize="small" className="mr-2" />
          <Typography>Eliminar</Typography>
        </MenuItem>
      </Menu>
    </Grid>
  );
};

export default TaskList;
