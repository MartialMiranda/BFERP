import React from 'react';
import { Box, Typography, Alert, AlertTitle, CircularProgress } from '@mui/material';

interface TasksStatusProps {
  loading: boolean;
  error: string | null;
  tasksCount: number;
  totalTasks: number;
}

/**
 * Componente para mostrar el estado de las tareas (error, carga, totales)
 */
const TasksStatus: React.FC<TasksStatusProps> = ({ 
  loading, 
  error, 
  tasksCount, 
  totalTasks 
}) => {
  return (
    <>
      {/* Indicador de carga */}
      {loading && (
        <Box className="p-6 text-center">
          <CircularProgress />
        </Box>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <Alert severity="error" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {/* Resultados y total */}
      {!loading && !error && (
        <Box className="mb-4">
          <Typography variant="body2" color="textSecondary">
            Mostrando {tasksCount} de {totalTasks} tareas
          </Typography>
        </Box>
      )}
    </>
  );
};

export default TasksStatus;
