import { Box, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface TeamFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}

export default function TeamFilters({ searchTerm, onSearchChange, onSearch, onClear }: TeamFiltersProps) {
  return (
    <Box component="form" onSubmit={onSearch} display="flex" alignItems="center" mb={2}>
      <TextField
        label="Buscar equipo"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ mr: 2 }}
      />
      <Button type="submit" variant="contained" color="primary" startIcon={<SearchIcon />} sx={{ mr: 1 }}>
        Buscar
      </Button>
      <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={onClear}>
        Limpiar
      </Button>
    </Box>
  );
}
