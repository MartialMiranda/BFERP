import { Box, TextField, Button, Collapse, MenuItem } from '@mui/material';
import { ProjectFilters as FiltersType } from '../../types/project';

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: FiltersType;
  setFilters: (f: FiltersType) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  clearFilters: () => void;
  loadProjects: () => void;
  handleSearch: (e: React.FormEvent) => void;
}

export default function ProjectFilters({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  clearFilters,
  handleSearch
}: Props) {
  // Manejar cambios en los filtros dropdown (estado, ordenar_por, orden)
  const handleFilterChange = (field: keyof FiltersType, value: string) => {
    // Actualizar el filtro y resetear a la primera página
    setFilters({ ...filters, [field]: value, pagina: 1 });
  };
  
  // Enviar el formulario de búsqueda
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(e);
  };

  return (
    <Box mb={3}>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <TextField
          label="Buscar proyecto"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
            value={filters.estado || 'todos'}
            onChange={e => handleFilterChange('estado', e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
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