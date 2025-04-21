import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link as MuiLink } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';

interface TasksHeaderProps {
  onAddTask: () => void;
}

/**
 * Encabezado de la página de tareas
 */
const TasksHeader: React.FC<TasksHeaderProps> = ({ onAddTask }) => {
  return (
    <>
      {/* Navegación de migas de pan */}
      <Breadcrumbs aria-label="breadcrumb" className="py-2">
        <Link href="/dashboard" passHref>
          <MuiLink underline="hover" color="inherit">
            Dashboard
          </MuiLink>
        </Link>
        <Typography color="textPrimary">Tareas</Typography>
      </Breadcrumbs>
      
      {/* Cabecera de la página */}
      <Box className="mb-6 flex justify-between items-center flex-wrap">
        <Typography variant="h4" component="h1" className="font-bold">
          Gestión de Tareas
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddTask}
        >
          Nueva Tarea
        </Button>
      </Box>
    </>
  );
};

export default TasksHeader;
