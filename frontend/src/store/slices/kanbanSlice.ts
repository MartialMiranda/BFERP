import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KanbanColumn, MoveTaskRequest } from '@/types/kanban';
import { kanbanService } from '@/services/kanbanService';

// Thunk para cargar columnas de Kanban
export const fetchColumns = createAsyncThunk<KanbanColumn[], string>(
  'kanban/fetchColumns',
  async (projectId, { rejectWithValue }) => {
    try {
      const cols = await kanbanService.getProjectColumns(projectId);
      return cols;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Error al cargar columnas');
    }
  }
);

// Thunk para reordenar tareas dentro de una columna
export const reorderTasks = createAsyncThunk< void, { columnId: string; taskIds: string[] }>(
  'kanban/reorderTasks',
  async ({ columnId, taskIds }, { dispatch, rejectWithValue }) => {
    try {
      await kanbanService.reorderTasks(columnId, taskIds);
      return;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Error al reordenar tareas');
    }
  }
);

// Thunk para mover tarea entre columnas
export const moveTask = createAsyncThunk< void, MoveTaskRequest & { projectId: string }>(
  'kanban/moveTask',
  async ({ tarea_id, columna_destino_id, posicion_destino, projectId }, { dispatch, rejectWithValue }) => {
    try {
      await kanbanService.moveTask({ tarea_id, columna_destino_id, posicion_destino });
      // Refrescar columnas tras mover
      await dispatch(fetchColumns(projectId));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Error al mover tarea');
    }
  }
);

interface KanbanState {
  columns: KanbanColumn[];
  loading: boolean;
  error: string | null;
}

const initialState: KanbanState = {
  columns: [],
  loading: false,
  error: null,
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action: PayloadAction<KanbanColumn[]>) => {
        state.loading = false;
        state.columns = action.payload;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default kanbanSlice.reducer;
