'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import KanbanTask from './KanbanTask';
import { kanbanService } from '@/services/kanbanService';
import { Task } from '@/types/task';

// Derive statuses from Task type
type TaskStatus = Task['estado'];

interface KanbanBoardProps {
  tasks: Record<TaskStatus, Task[]>;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onRefresh: () => void;
}

const columnTitles: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  'en progreso': 'En Progreso',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onStatusChange, onRefresh }) => {
  const handleDragEnd = async ({ source, destination, draggableId }: DropResult) => {
    if (!destination) return;
    const sourceCol = source.droppableId as TaskStatus;
    const destCol = destination.droppableId as TaskStatus;

    if (sourceCol === destCol) {
      if (source.index === destination.index) return;
      // Persist reorder in DB
      const ids = tasks[sourceCol].map(t => t.id);
      const newOrder = Array.from(ids);
      const [moved] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, moved);
      try {
        await kanbanService.reorderTasks(sourceCol, newOrder);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Move to different column: update backend
    try {
      await onStatusChange(draggableId, destCol);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {(Object.keys(tasks) as TaskStatus[]).map(status => (
          <Paper key={status} variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Typography
              variant="h6"
              align="center"
              sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              {columnTitles[status]} ({tasks[status].length})
            </Typography>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flex: 1,
                    p: 1,
                    bgcolor: snapshot.isDraggingOver ? 'action.selected' : 'background.paper',
                  }}
                >
                  {tasks[status].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(prov, snap) => (
                        <Box
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          sx={{
                            mb: 1,
                            p: 1,
                            bgcolor: 'background.paper',
                            boxShadow: snap.isDragging ? 4 : 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                          }}
                        >
                          <KanbanTask task={task} index={index} onStatusChange={onStatusChange} />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;
