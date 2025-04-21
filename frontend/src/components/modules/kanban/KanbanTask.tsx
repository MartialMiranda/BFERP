'use client';

import { Card, CardContent, Typography, Chip, Box, Avatar, Tooltip, Button, Menu, MenuItem, IconButton } from '@mui/material';
import { Task } from '@/types/task';
import { CalendarMonth, Flag, MoreVert } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useState } from 'react';

// Tipo de estados de tareas (igual que en KanbanBoard y KanbanColumn)
type TaskStatus = 'pendiente' | 'en progreso' | 'completada';

interface KanbanTaskProps {
  task: Task;
  index: number;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta':
      return '#f44336'; // Rojo
    case 'media':
      return '#ff9800'; // Naranja
    case 'baja':
      return '#4caf50'; // Verde
    default:
      return '#9e9e9e'; // Gris
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const KanbanTask = ({ task, index, onStatusChange }: KanbanTaskProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const priorityColor = getPriorityColor(task.prioridad);
  const isOverdue = task.fecha_vencimiento && dayjs(task.fecha_vencimiento).isBefore(dayjs(), 'day');
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus);
    handleClose();
  };
  
  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: 3,
          '& .task-action-button': {
            opacity: 1
          }
        },
        position: 'relative',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            {task.titulo}
          </Typography>
          
          <IconButton
            size="small"
            className="task-action-button"
            onClick={handleClick}
            sx={{ 
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 1 }
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem 
              disabled={task.estado === 'pendiente'} 
              onClick={() => handleStatusChange('pendiente')}
            >
              Mover a Pendiente
            </MenuItem>
            <MenuItem 
              disabled={task.estado === 'en progreso'} 
              onClick={() => handleStatusChange('en progreso')}
            >
              Mover a En Progreso
            </MenuItem>
            <MenuItem 
              disabled={task.estado === 'completada'} 
              onClick={() => handleStatusChange('completada')}
            >
              Mover a Completada
            </MenuItem>
          </Menu>
        </Box>
        
        {task.descripcion && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {task.descripcion}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Chip 
            icon={<Flag sx={{ color: `${priorityColor} !important` }} />}
            label={`${task.prioridad.charAt(0).toUpperCase()}${task.prioridad.slice(1)}`}
            size="small"
            sx={{ 
              borderColor: priorityColor,
              color: 'text.primary'
            }}
            variant="outlined"
          />
          
          {task.fecha_vencimiento && (
            <Tooltip title={dayjs(task.fecha_vencimiento).format('DD/MM/YYYY')}>
              <Chip
                icon={<CalendarMonth />}
                label={dayjs(task.fecha_vencimiento).format('DD/MM')}
                size="small"
                color={isOverdue ? "error" : "default"}
                variant={isOverdue ? "filled" : "outlined"}
              />
            </Tooltip>
          )}
        </Box>
        
        {task.asignado_nombre && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Tooltip title={task.asignado_nombre}>
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  fontSize: '0.8rem',
                  bgcolor: 'primary.main'
                }}
              >
                {getInitials(task.asignado_nombre)}
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanTask;
