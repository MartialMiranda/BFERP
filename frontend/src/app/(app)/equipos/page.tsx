'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  setCurrentTeam,
  clearTeamsError,
} from '@/store/slices/teamsSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TeamFilters from '@/components/teams/TeamFilters';
import TeamList from '@/components/teams/TeamList';
import TeamDialog from '@/components/teams/TeamDialog';
import ConfirmDeleteDialog from '@/components/teams/ConfirmDeleteDialog';
import Pagination from '@/components/teams/Pagination';
import { Team } from '@/types/team';

export default function EquiposPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teams, currentTeam, loading, error, totalTeams } = useSelector(
    (state: RootState) => state.teams
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const userProjects = projects.filter((p) => p.creado_por === authUser?.id);
  let availableProjects = userProjects;
  if (currentTeam?.proyecto_id) {
    const teamProj = projects.find((p) => p.id === currentTeam.proyecto_id);
    if (teamProj && !userProjects.some((p) => p.id === teamProj.id)) {
      availableProjects = [teamProj, ...userProjects];
    }
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ pagina: 1, por_pagina: 10, busqueda: '' });
  const [pageInfo, setPageInfo] = useState({ pagina: 1, total_paginas: 1 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    dispatch(fetchTeams(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    userService.getUsers()
      .then(setUsers)
      .catch((err) => dispatch(addNotification({ message: 'Error cargando usuarios', severity: 'error' })));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(addNotification({ message: error, severity: 'error' }));
      dispatch(clearTeamsError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const totalPag = Math.ceil(totalTeams / filters.por_pagina);
    setPageInfo({ pagina: filters.pagina, total_paginas: totalPag });
  }, [totalTeams, filters]);

  useEffect(() => {
    dispatch(fetchProjects({ pagina: 1, por_pagina: 100 }));
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, pagina: 1, busqueda: searchTerm.trim() });
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilters({ pagina: 1, por_pagina: 10, busqueda: '' });
  };

  const handlePage = (page: number) => {
    setFilters({ ...filters, pagina: page });
  };

  const openNew = () => {
    dispatch(setCurrentTeam(null));
    setDialogOpen(true);
  };

  const handleEdit = (team: Team) => {
    dispatch(setCurrentTeam(team));
    setDialogOpen(true);
  };

  const handleSave = (data: { nombre: string; descripcion?: string; proyecto_id: string; miembros?: string[] }) => {
    const action = currentTeam
      ? updateTeam({ ...data, id: currentTeam.id })
      : createTeam(data);
    dispatch(action)
      .unwrap()
      .then(() => {
        dispatch(addNotification({ message: `Equipo ${currentTeam ? 'actualizado' : 'creado'} con éxito`, severity: 'success' }));
        setDialogOpen(false);
        setFilters({ ...filters });
      })
      .catch((msg) => dispatch(addNotification({ message: msg, severity: 'error' })));
  };

  const handleDelete = (team: Team) => {
    setToDelete(team.id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    dispatch(deleteTeam(toDelete))
      .unwrap()
      .then(() => {
        dispatch(addNotification({ message: 'Equipo eliminado', severity: 'success' }));
        setDeleteOpen(false);
        setFilters({ ...filters });
      })
      .catch((msg) => dispatch(addNotification({ message: msg, severity: 'error' })));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gestión de Equipos
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TeamFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          onClear={handleClear}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Nuevo Equipo
        </Button>
      </Box>
      <TeamList teams={teams} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      <Pagination loading={loading} pagination={pageInfo} onPageChange={handlePage} />
      <TeamDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        team={currentTeam}
        projects={availableProjects}
        users={users}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
