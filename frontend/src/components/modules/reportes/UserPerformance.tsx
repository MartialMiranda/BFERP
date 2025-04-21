'use client';

import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  LinearProgress,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, AccessTime, AssignmentTurnedIn, Assignment } from '@mui/icons-material';
import { UserPerformance as UserPerformanceType } from '@/services/reportService';

interface UserPerformanceProps {
  data: UserPerformanceType[];
}

const UserPerformance = ({ data }: UserPerformanceProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const filteredData = data.filter(user => 
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTimeDisplay = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return 'N/A';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Rendimiento del Equipo
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Assignment fontSize="small" sx={{ mr: 0.5 }} />
                  Asignadas
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AssignmentTurnedIn fontSize="small" sx={{ mr: 0.5 }} />
                  Completadas
                </Box>
              </TableCell>
              <TableCell align="center">% Completado</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                  Tiempo Promedio
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.usuario_id}>
                  <TableCell component="th" scope="row">
                    {user.nombre}
                  </TableCell>
                  <TableCell align="center">{user.tareas_asignadas}</TableCell>
                  <TableCell align="center">{user.tareas_completadas}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={user.porcentaje_completado} 
                          color={getCompletionColor(user.porcentaje_completado) as 'success' | 'warning' | 'error'}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Chip 
                        label={`${user.porcentaje_completado}%`}
                        size="small"
                        color={getCompletionColor(user.porcentaje_completado) as 'success' | 'warning' | 'error'} 
                        variant="outlined" 
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {getTimeDisplay(user.tiempo_promedio_completado)}
                  </TableCell>
                </TableRow>
              ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
};

export default UserPerformance;
