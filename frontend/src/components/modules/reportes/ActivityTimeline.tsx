'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Event,
  Person,
  Comment,
  FilterList,
  Search
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

// Extender dayjs con plugins
dayjs.extend(relativeTime);
dayjs.locale('es');

interface ActivityItem {
  id: string;
  tipo: 'creacion' | 'actualizacion' | 'eliminacion' | 'completado' | 'comentario' | 'asignacion';
  entidad: 'proyecto' | 'tarea' | 'equipo' | 'usuario';
  entidad_id: string;
  entidad_nombre: string;
  usuario_id: string;
  usuario_nombre: string;
  descripcion: string;
  detalles?: any;
  fecha: string;
}

interface ActivityTimelineProps {
  data: ActivityItem[];
}

const getActivityIcon = (tipo: string, entidad: string) => {
  switch (tipo) {
    case 'creacion':
      return <Add />;
    case 'actualizacion':
      return <Edit />;
    case 'eliminacion':
      return <Delete color="error" />;
    case 'completado':
      return <CheckCircle color="success" />;
    case 'comentario':
      return <Comment />;
    case 'asignacion':
      return <Person />;
    default:
      return <Event />;
  }
};

const getActivityColor = (tipo: string) => {
  switch (tipo) {
    case 'creacion':
      return '#2196f3';
    case 'actualizacion':
      return '#ff9800';
    case 'eliminacion':
      return '#f44336';
    case 'completado':
      return '#4caf50';
    case 'comentario':
      return '#9c27b0';
    case 'asignacion':
      return '#795548';
    default:
      return '#607d8b';
  }
};

const getEntityLabel = (entidad: string) => {
  switch (entidad) {
    case 'proyecto':
      return 'Proyecto';
    case 'tarea':
      return 'Tarea';
    case 'equipo':
      return 'Equipo';
    case 'usuario':
      return 'Usuario';
    default:
      return 'Elemento';
  }
};

const ActivityTimeline = ({ data }: ActivityTimelineProps) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [itemsPerPage] = useState(10);

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay actividad reciente para mostrar
        </Typography>
      </Paper>
    );
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleEntityFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntityFilter(event.target.value);
    setPage(1);
  };

  const handleTypeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  // Filtrar actividades
  const filteredData = data.filter((activity) => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      activity.entidad_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por tipo de entidad
    const matchesEntity = entityFilter ? activity.entidad === entityFilter : true;
    
    // Filtrar por tipo de actividad
    const matchesType = typeFilter ? activity.tipo === typeFilter : true;
    
    return matchesSearch && matchesEntity && matchesType;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Actividad Reciente
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar actividades"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          size="small"
          label="Entidad"
          value={entityFilter}
          onChange={handleEntityFilterChange}
          sx={{ minWidth: '150px' }}
          InputProps={{
            startAdornment: entityFilter ? null : (
              <InputAdornment position="start">
                <FilterList />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">Todas las entidades</MenuItem>
          <MenuItem value="proyecto">Proyectos</MenuItem>
          <MenuItem value="tarea">Tareas</MenuItem>
          <MenuItem value="equipo">Equipos</MenuItem>
          <MenuItem value="usuario">Usuarios</MenuItem>
        </TextField>
        
        <TextField
          select
          size="small"
          label="Tipo"
          value={typeFilter}
          onChange={handleTypeFilterChange}
          sx={{ minWidth: '150px' }}
          InputProps={{
            startAdornment: typeFilter ? null : (
              <InputAdornment position="start">
                <FilterList />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="">Todos los tipos</MenuItem>
          <MenuItem value="creacion">Creación</MenuItem>
          <MenuItem value="actualizacion">Actualización</MenuItem>
          <MenuItem value="eliminacion">Eliminación</MenuItem>
          <MenuItem value="completado">Completado</MenuItem>
          <MenuItem value="comentario">Comentario</MenuItem>
          <MenuItem value="asignacion">Asignación</MenuItem>
        </TextField>
      </Box>

      {displayedData.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron actividades con los filtros seleccionados
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {displayedData.map((activity) => (
              <ListItem 
                key={activity.id} 
                alignItems="flex-start"
                sx={{ 
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity.tipo) }}>
                    {getActivityIcon(activity.tipo, activity.entidad)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
                      <Typography component="span" variant="subtitle1" fontWeight="medium">
                        {activity.usuario_nombre}
                      </Typography>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {activity.descripcion}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          size="small" 
                          label={getEntityLabel(activity.entidad)} 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          size="small" 
                          label={activity.entidad_nombre} 
                          color="default" 
                          variant="outlined" 
                        />
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {dayjs(activity.fecha).fromNow()}
                        </Typography>
                      </Box>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ActivityTimeline;
