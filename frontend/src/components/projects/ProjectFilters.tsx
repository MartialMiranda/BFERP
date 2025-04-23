import { Box, TextField, Button, Collapse, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { ProjectFilters as FiltersType } from '../../types/project';

interface Props {
  filters: FiltersType;
  setFilters: (f: FiltersType) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  clearFilters: () => void;
}

export default function ProjectFilters({
  filters, setFilters, showFilters, setShowFilters, clearFilters
}: Props) {
  const handleFilterChange = (field: keyof FiltersType, value: string) => {
    setFilters({ ...filters, [field]: value, pagina: 1 });
  };

  const [localSearch, setLocalSearch] = useState(filters.nombre || '');
  useEffect(() => { setLocalSearch(filters.nombre || ''); }, [filters.nombre]);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, nombre: localSearch, pagina: 1 });
  };

  return (
    <Box mb={3}>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <TextField
          label="Buscar proyecto"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="contained">Buscar</Button>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outlined">
          {showFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
        </Button>
        <Button onClick={clearFilters} variant="text">Limpiar</Button>
      </form>
      <Collapse in={showFilters}>
        <Box mt={2} display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Estado"
            select
            value={filters.estado || ''}
            onChange={e => handleFilterChange('estado', e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="planificado">Planificado</MenuItem>
            <MenuItem value="en progreso">En progreso</MenuItem>
            <MenuItem value="completado">Completado</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
          </TextField>
          <TextField
            label="Ordenar por"
            select
            value={filters.ordenar_por || ''}
            onChange={e => handleFilterChange('ordenar_por', e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Por defecto</MenuItem>
            <MenuItem value="nombre">Nombre</MenuItem>
            <MenuItem value="fecha_inicio">Fecha inicio</MenuItem>
            <MenuItem value="fecha_fin">Fecha fin</MenuItem>
            <MenuItem value="estado">Estado</MenuItem>
            <MenuItem value="creado_en">Fecha creación</MenuItem>
          </TextField>
          <TextField
            label="Orden"
            select
            value={filters.orden || 'asc'}
            onChange={e => handleFilterChange('orden', e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="asc">Ascendente</MenuItem>
            <MenuItem value="desc">Descendente</MenuItem>
          </TextField>
        </Box>
      </Collapse>
    </Box>
  );
}