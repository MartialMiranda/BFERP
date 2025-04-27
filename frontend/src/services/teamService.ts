import apiClient from '../lib/axios';
import { Team, TeamsResponse, TeamFilters, TeamMember } from '../types/team';

export const teamService = {
  async getTeams(filters?: TeamFilters): Promise<TeamsResponse> {
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.pagina) params.pagina = filters.pagina;
      if (filters.por_pagina) params.por_pagina = filters.por_pagina;
      if (filters.proyecto_id) params.proyecto_id = filters.proyecto_id;
      if (filters.lider_id) params.lider_id = filters.lider_id;
      if (filters.busqueda) params.busqueda = filters.busqueda;
      if (filters.soy_miembro !== undefined) params.soy_miembro = filters.soy_miembro;
      if (filters.soy_lider !== undefined) params.soy_lider = filters.soy_lider;
      if (filters.ordenar_por) params.ordenar_por = filters.ordenar_por;
      if (filters.orden) params.orden = filters.orden;
    }
    const response = await apiClient.get<TeamsResponse>('/equipos', { params });
    return response.data;
  },

  async getTeamById(id: string): Promise<Team> {
    const response = await apiClient.get<Team>(`/equipos/${id}`);
    return response.data;
  },

  async createTeam(data: { nombre: string; descripcion?: string | null; proyecto_id: string; lider_id?: string; miembros?: string[] }): Promise<Team> {
    const response = await apiClient.post<Team>('/equipos', data);
    return response.data;
  },

  async updateTeam(data: { id: string; nombre?: string; descripcion?: string | null; lider_id?: string; miembros?: string[] }): Promise<Team> {
    const { id, ...body } = data;
    const response = await apiClient.put<Team>(`/equipos/${id}`, body);
    return response.data;
  },

  async deleteTeam(id: string, force: boolean = false): Promise<void> {
    // Force deletion if specified
    await apiClient.delete(`/equipos/${id}`, { params: { force } });
  },
};
