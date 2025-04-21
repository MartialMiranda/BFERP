'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  Chip,
  Grid,
  IconButton,
  Avatar,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import LabelIcon from '@mui/icons-material/Label';
import { Task } from '../../../types/task';
import { useRouter } from 'next/navigation';

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Componente para mostrar los detalles de una tarea
 */
const TaskDetailsDialog = ({
  open,
  onClose,
  task,
  onEdit,
  onDelete,
}: TaskDetailsDialogProps) => {
  const router = useRouter();

  /**
   * Navegar a la página del proyecto
   */
  const navigateToProject = () => {
    if (task.proyecto_id) {
      router.push(`/proyectos/${task.proyecto_id}`);
      onClose();
    }
  };

  /**
   * Formatear fecha en formato legible
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  /**
   * Formatear fecha y hora en formato legible
   */
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6" className="font-semibold">
          Detalles de la Tarea
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box className="flex justify-between items-start">
              <Typography variant="h5" className="font-bold mb-1">
                {task.titulo}
              </Typography>
              
              <Box className="flex gap-2">
                <Chip
                  label={
                    task.estado === 'pendiente'
                      ? 'Pendiente'
                      : task.estado === 'en progreso'
                      ? 'En progreso'
                      : task.estado === 'completada'
                      ? 'Completada'
                      : 'Bloqueada'
                  }
                  className={getStatusClass(task.estado)}
                />
                
                <Chip
                  label={
                    task.prioridad === 'alta'
                      ? 'Alta'
                      : task.prioridad === 'media'
                      ? 'Media'
                      : 'Baja'
                  }
                  className={getPriorityClass(task.prioridad)}
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" className="whitespace-pre-line">
              {task.descripcion || 'Sin descripción'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box className="flex items-center mb-2">
              <CalendarTodayIcon className="mr-2 text-gray-500" fontSize="small" />
              <Typography variant="subtitle2" className="font-semibold">
                Fecha de vencimiento:
              </Typography>
            </Box>
            <Typography variant="body2" className="ml-6">
              {task.fecha_vencimiento ? formatDate(task.fecha_vencimiento) : 'Sin fecha de vencimiento'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box className="flex items-center mb-2">
              <PersonIcon className="mr-2 text-gray-500" fontSize="small" />
              <Typography variant="subtitle2" className="font-semibold">
                Asignado a:
              </Typography>
            </Box>
            <Box className="ml-6 flex items-center">
              {task.asignado_a ? (
                <>
                  <Avatar 
                    className="w-6 h-6 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs mr-2"
                  >
                    {task.asignado_nombre?.substring(0, 1) || '?'}
                  </Avatar>
                  <Typography variant="body2">
                    {task.asignado_nombre || 'Usuario'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" className="text-gray-500">
                  Sin asignar
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box className="flex items-center mb-2">
              <FolderIcon className="mr-2 text-gray-500" fontSize="small" />
              <Typography variant="subtitle2" className="font-semibold">
                Proyecto:
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              className="ml-6 text-primary-600 hover:underline cursor-pointer"
              onClick={navigateToProject}
            >
              {'Proyecto ID: ' + task.proyecto_id}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box className="flex items-center mb-2">
              <LabelIcon className="mr-2 text-gray-500" fontSize="small" />
              <Typography variant="subtitle2" className="font-semibold">
                Etiquetas:
              </Typography>
            </Box>
            <Box className="ml-6 flex flex-wrap gap-1">
              <Typography variant="body2" color="textSecondary">
                (No hay etiquetas disponibles)
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="caption" className="text-gray-500">
              Creado el: {formatDateTime(task.creado_en)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="caption" className="text-gray-500">
              Última actualización: {formatDateTime(task.actualizado_en)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions className="p-4">
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Eliminar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog;
