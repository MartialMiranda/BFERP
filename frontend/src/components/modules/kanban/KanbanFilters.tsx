'use client';

import { useState } from 'react';
import { Paper, Grid, TextField, MenuItem, Box, Button } from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { Project } from '@/types/project';

// Definir el tipo de prioridad
type Priority = 'baja' | 'media' | 'alta' | '';

interface FilterState {
  projectId: string;
  priority: Priority;
  search: string;
}

interface KanbanFiltersProps {
  projects: Project[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

const priorityOptions = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' }
] as const;

const KanbanFilters = ({ projects, filters, onFilterChange }: KanbanFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onFilterChange({ search: searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ projectId: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as Priority;
    onFilterChange({ priority: value });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      projectId: '',
      priority: '',
      search: ''
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Buscar tareas"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={handleSearch}
                  color="primary"
                  size="small"
                >
                  Buscar
                </Button>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="Proyecto"
            variant="outlined"
            size="small"
            value={filters.projectId}
            onChange={handleProjectChange}
          >
            <MenuItem value="">Todos los proyectos</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            label="Prioridad"
            variant="outlined"
            size="small"
            value={filters.priority}
            onChange={handlePriorityChange}
          >
            {priorityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={{ mr: 1 }}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={handleSearch}
            >
              Filtrar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default KanbanFilters;
