'use client';
import { Typography, Paper, Box } from '@mui/material';
import { Task } from '@/types/task';
import type { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';

// Tipo de estados de tareas (igual que en KanbanBoard)
type TaskStatus = 'pendiente' | 'en progreso' | 'completada';

export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  children?: ReactNode;
}

const getColumnColor = (columnId: string, theme: any) => {
  switch (columnId) {
    case 'pendiente':
      return theme.palette.warning.light;
    case 'en progreso':
      return theme.palette.info.light;
    case 'completada':
      return theme.palette.success.light;
    default:
      return theme.palette.background.paper;
  }
};

const KanbanColumn = ({ title, tasks, columnId, onStatusChange, children }: KanbanColumnProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: getColumnColor(columnId, theme),
          color: theme.palette.text.primary,
          transition: 'background-color 0.3s, color 0.3s',
          borderTop: '5px solid',
          borderColor: theme.palette.divider,
        }}
      >
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            mb: 2, 
            fontWeight: 'bold',
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {title} ({tasks.length})
        </Typography>
        
        <Box
          sx={{
            flex: 1,
            minHeight: '200px',
            overflowY: 'auto',
            p: 1
          }}
        >
          {children}
          
          {tasks.length === 0 && (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                fontStyle: 'italic',
                p: 2,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              No hay tareas en esta columna
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default KanbanColumn;
