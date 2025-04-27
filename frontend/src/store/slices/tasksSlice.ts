import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';
import { taskService } from '@/services/taskService';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  totalTasks: number;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  totalTasks: 0,
};

/**
 * Thunk para obtener tareas
 */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: TaskFilters, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener tareas');
    }
  }
);

/**
 * Thunk para obtener una tarea por ID
 */
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      // Use getTask since service method is named 'getTask'
      const response = await taskService.getTask(taskId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener la tarea');
    }
  }
);

/**
 * Thunk para crear una tarea
 */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear la tarea');
    }
  }
);

/**
 * Thunk para actualizar una tarea
 */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...taskData }: { id: string } & UpdateTaskRequest, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar la tarea');
    }
  }
);

/**
 * Thunk para eliminar una tarea
 */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar la tarea');
    }
  }
);

/**
 * Slice para gestionar tareas
 */
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null;
    },
    setCurrentTask(state, action: PayloadAction<Task | null>) {
      state.currentTask = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Deduplicate tasks by id
        const tareas = action.payload.tareas || [];
        const uniqueTasks: Task[] = [];
        const ids = new Set<string>();
        tareas.forEach(t => { if (!ids.has(t.id)) { ids.add(t.id); uniqueTasks.push(t); } });
        state.tasks = uniqueTasks;
        state.totalTasks = action.payload.paginacion?.total || uniqueTasks.length;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Casos para fetchTaskById
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Casos para createTask
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.totalTasks += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Casos para updateTask
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Casos para deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.totalTasks -= 1;
        if (state.currentTask && state.currentTask.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTasksError, setCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;
