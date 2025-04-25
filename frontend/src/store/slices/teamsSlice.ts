import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { teamService } from '@/services/teamService';
import { Team, TeamFilters } from '@/types/team';

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

export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (filters: TeamFilters, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeams(filters);
      return {
        data: response.equipos,
        total: response.paginacion.total || response.equipos.length,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener equipos'
      );
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeamById(teamId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener el equipo'
      );
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: Parameters<typeof teamService.createTeam>[0], { rejectWithValue }) => {
    try {
      const response = await teamService.createTeam(teamData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear el equipo'
      );
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async (teamData: Parameters<typeof teamService.updateTeam>[0], { rejectWithValue }) => {
    try {
      const response = await teamService.updateTeam(teamData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar el equipo'
      );
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(teamId);
      return teamId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar el equipo'
      );
    }
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearTeamsError: (state) => { state.error = null; },
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => { state.currentTeam = action.payload; },
  },
  extraReducers: (builder) => builder
    .addCase(fetchTeams.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchTeams.fulfilled, (state, action) => { state.loading = false; state.teams = action.payload.data; state.totalTeams = action.payload.total; })
    .addCase(fetchTeams.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
    .addCase(fetchTeamById.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchTeamById.fulfilled, (state, action) => { state.loading = false; state.currentTeam = action.payload; })
    .addCase(fetchTeamById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
    .addCase(createTeam.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(createTeam.fulfilled, (state, action) => { state.loading = false; state.teams.push(action.payload); state.totalTeams += 1; })
    .addCase(createTeam.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
    .addCase(updateTeam.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(updateTeam.fulfilled, (state, action) => { state.loading = false; const idx = state.teams.findIndex((t) => t.id === action.payload.id); if (idx !== -1) state.teams[idx] = action.payload; if (state.currentTeam?.id === action.payload.id) state.currentTeam = action.payload; })
    .addCase(updateTeam.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
    .addCase(deleteTeam.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(deleteTeam.fulfilled, (state, action) => { state.loading = false; state.teams = state.teams.filter((t) => t.id !== action.payload); state.totalTeams -= 1; if (state.currentTeam?.id === action.payload) state.currentTeam = null; })
    .addCase(deleteTeam.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; }),
});

export const { clearTeamsError, setCurrentTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
