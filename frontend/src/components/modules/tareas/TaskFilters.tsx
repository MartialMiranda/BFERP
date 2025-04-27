'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { TaskFilters as TaskFiltersType } from '../../../types/task';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
  onSearch: (searchTerm: string) => void;
  onClearFilters: () => void;
  projectOptions?: { value: string; label: string }[];
  userOptions?: { value: string; label: string }[];
}

/**
 * Componente para filtros de tareas
 */
const TaskFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  projectOptions = [],
  userOptions = [],
}: TaskFiltersProps) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.titulo || '');

  useEffect(() => {
    setSearchTerm(filters.titulo || '');
  }, [filters.titulo]);

  /**
   * Manejar cambio de filtro
   */
  const handleFilterChange = (name: string, value: any) => {
    onFilterChange({ ...filters, [name]: value });
  };

  /**
   * Mostrar u ocultar filtros avanzados
   */
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('TaskFilters.handleSubmit searchTerm:', searchTerm);
    onSearch(searchTerm.trim());
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box className="flex gap-2">
          <TextField
            fullWidth
            placeholder="Buscar tareas por título..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" color="primary">
            Buscar
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={toggleExpanded}
            startIcon={<FilterListIcon />}
          >
            Filtros
          </Button>
        </Box>

        {expanded && (
          <Box className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.estado || ''}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="en progreso">En progreso</MenuItem>
                    <MenuItem value="completada">Completada</MenuItem>
                    <MenuItem value="bloqueada">Bloqueada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={filters.prioridad || ''}
                    onChange={(e) => handleFilterChange('prioridad', e.target.value)}
                    label="Prioridad"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="baja">Baja</MenuItem>
                    <MenuItem value="media">Media</MenuItem>
                    <MenuItem value="alta">Alta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                {projectOptions.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Proyecto</InputLabel>
                    <Select
                      value={filters.proyecto_id || ''}
                      onChange={(e) => handleFilterChange('proyecto_id', e.target.value)}
                      label="Proyecto"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {projectOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                {userOptions.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Asignado a</InputLabel>
                    <Select
                      value={filters.asignado_a || ''}
                      onChange={(e) => handleFilterChange('asignado_a', e.target.value)}
                      label="Asignado a"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="mi">Mis tareas</MenuItem>
                      {userOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Vencimiento desde"
                    value={filters.fecha_vencimiento_desde ? dayjs(filters.fecha_vencimiento_desde) : null}
                    onChange={(date) => 
                      handleFilterChange(
                        'fecha_vencimiento_desde', 
                        date ? (date as dayjs.Dayjs).format('YYYY-MM-DD') : undefined
                      )
                    }
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Vencimiento hasta"
                    value={filters.fecha_vencimiento_hasta ? dayjs(filters.fecha_vencimiento_hasta) : null}
                    onChange={(date) => 
                      handleFilterChange(
                        'fecha_vencimiento_hasta', 
                        date ? (date as dayjs.Dayjs).format('YYYY-MM-DD') : undefined
                      )
                    }
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ordenar por</InputLabel>
                  <Select
                    value={filters.ordenar_por || 'fecha_vencimiento'}
                    onChange={(e) => handleFilterChange('ordenar_por', e.target.value)}
                    label="Ordenar por"
                  >
                    <MenuItem value="titulo">Título</MenuItem>
                    <MenuItem value="fecha_vencimiento">Fecha vencimiento</MenuItem>
                    <MenuItem value="prioridad">Prioridad</MenuItem>
                    <MenuItem value="estado">Estado</MenuItem>
                    <MenuItem value="creado_en">Fecha creación</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Orden</InputLabel>
                  <Select
                    value={filters.orden || 'asc'}
                    onChange={(e) => handleFilterChange('orden', e.target.value)}
                    label="Orden"
                  >
                    <MenuItem value="asc">Ascendente</MenuItem>
                    <MenuItem value="desc">Descendente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} className="flex justify-end">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onClearFilters}
                  className="mr-2"
                >
                  Limpiar filtros
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onFilterChange({ ...filters, pagina: 1 })}
                >
                  Aplicar filtros
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </form>
    </Box>
  );
};

export default TaskFilters;
