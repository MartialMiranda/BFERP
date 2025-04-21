'use client';

import { Box, Grid, Typography } from '@mui/material';
import KanbanColumn from './KanbanColumn';
import { Task } from '@/types/task';

type TaskStatus = 'pendiente' | 'en progreso' | 'completada';

interface KanbanBoardProps {
  tasks: Record<TaskStatus, Task[]>;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const columnTitles: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  'en progreso': 'En Progreso',
  completada: 'Completada'
} as const;

const KanbanBoard = ({ tasks, onStatusChange }: KanbanBoardProps) => {
  const totalTasks = Object.values(tasks).reduce((sum, taskList) => sum + taskList.length, 0);

  if (totalTasks === 0) {
    return (
      <Box sx={{ 
        height: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h6" color="text.secondary">
          No hay tareas para mostrar. Ajuste los filtros o cree nuevas tareas.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, height: 'calc(100vh - 240px)' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {(Object.keys(tasks) as TaskStatus[]).map((columnId) => (
          <Grid item xs={12} md={4} key={columnId} sx={{ height: '100%' }}>
            <KanbanColumn
              title={columnTitles[columnId]}
              tasks={tasks[columnId]}
              columnId={columnId}
              onStatusChange={onStatusChange}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KanbanBoard;
