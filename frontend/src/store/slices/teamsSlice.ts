import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Definición de tipos para equipos
interface Team {
  id: string;
  nombre: string;
  descripcion: string | null;
  lider_id: string;
  lider_nombre?: string;
  miembros: TeamMember[];
  creado_en: string;
  actualizado_en: string;
}

interface TeamMember {
  id: string;
  usuario_id: string;
  equipo_id: string;
  rol: string;
  nombre_usuario?: string;
  email_usuario?: string;
}

interface TeamFilters {
  nombre?: string;
  lider_id?: string;
  pagina?: number;
  por_pagina?: number;
}

// Estado inicial
interface TeamsState {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
  totalTeams: number;
}

const initialState: TeamsState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
  totalTeams: 0,
};

// Simulación de servicio de equipos (a implementar cuando esté disponible)
const teamService = {
  async getTeams(filters: TeamFilters) {
    // Simulación de respuesta
    return {
      data: [] as Team[],
      total: 0,
    };
  },
  async getTeamById(teamId: string) {
    // Simulación de respuesta
    return null as unknown as Team;
  },
  async createTeam(teamData: any) {
    // Simulación de respuesta
    return {} as Team;
  },
  async updateTeam(teamData: any) {
    // Simulación de respuesta
    return {} as Team;
  },
  async deleteTeam(teamId: string) {
    // Simulación de respuesta
    return;
  },
};

/**
 * Thunk para obtener equipos
 */
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (filters: TeamFilters, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeams(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener equipos');
    }
  }
);

/**
 * Thunk para obtener un equipo por ID
 */
export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeamById(teamId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener el equipo');
    }
  }
);

/**
 * Thunk para crear un equipo
 */
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: any, { rejectWithValue }) => {
    try {
      const response = await teamService.createTeam(teamData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear el equipo');
    }
  }
);

/**
 * Thunk para actualizar un equipo
 */
export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async (teamData: any, { rejectWithValue }) => {
    try {
      const response = await teamService.updateTeam(teamData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar el equipo');
    }
  }
);

/**
 * Thunk para eliminar un equipo
 */
export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(teamId);
      return teamId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar el equipo');
    }
  }
);

/**
 * Slice para gestionar equipos
 */
const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearTeamsError: (state) => {
      state.error = null;
    },
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
      state.currentTeam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data;
        state.totalTeams = action.payload.total;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
        state.totalTeams += 1;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter(t => t.id !== action.payload);
        state.totalTeams -= 1;
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTeamsError, setCurrentTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
