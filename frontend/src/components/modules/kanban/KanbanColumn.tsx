'use client';

import { Typography, Paper, Box } from '@mui/material';
import KanbanTask from './KanbanTask';
import { Task } from '@/types/task';

// Tipo de estados de tareas (igual que en KanbanBoard)
type TaskStatus = 'pendiente' | 'en progreso' | 'completada';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const getColumnColor = (columnId: string) => {
  switch (columnId) {
    case 'pendiente':
      return '#FFF9C4'; // Amarillo claro
    case 'en progreso':
      return '#BBDEFB'; // Azul claro
    case 'completada':
      return '#C8E6C9'; // Verde claro
    default:
      return '#FFFFFF';
  }
};

const KanbanColumn = ({ title, tasks, columnId, onStatusChange }: KanbanColumnProps) => {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: getColumnColor(columnId),
          borderTop: '5px solid',
          borderColor: theme => theme.palette.mode === 'light' 
            ? 'grey.400' 
            : 'grey.700',
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
          {tasks.map((task, index) => (
            <KanbanTask 
              key={task.id} 
              task={task} 
              index={index} 
              onStatusChange={onStatusChange}
            />
          ))}
          
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
