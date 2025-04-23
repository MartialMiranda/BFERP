import { Card, CardContent, Typography, IconButton, Menu, MenuItem, Chip, Box, LinearProgress, Grid, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { Project } from '../../types/project';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  project: Project;
  onView: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  getStatusClass: (status: string) => string;
  menuAnchorEl: null | HTMLElement;
  handleMenuClose: () => void;
  handleEditProject: () => void;
  handleDeleteClick: () => void;
  isMenuOpen: boolean;
}

export default function ProjectCard({
  project, onView, onMenuOpen,
  menuAnchorEl, handleMenuClose, handleEditProject, handleDeleteClick, isMenuOpen
}: Props) {
  // Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No establecida';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };

  // Colores vistosos para cada estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return { background: '#e3f2fd', color: '#1976d2', borderColor: '#90caf9' };
      case 'en progreso':
        return { background: '#fff3e0', color: '#ef6c00', borderColor: '#ffb74d' };
      case 'completado':
        return { background: '#e8f5e9', color: '#388e3c', borderColor: '#81c784' };
      case 'cancelado':
        return { background: '#ffebee', color: '#d32f2f', borderColor: '#e57373' };
      default:
        return { background: '#ececec', color: '#616161', borderColor: '#bdbdbd' };
    }
  };

  return (
    <Card sx={{ cursor: 'pointer', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={onView}>
      <CardContent sx={{ flex: '1 0 auto' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>{project.nombre}</Typography>
          <IconButton 
            onClick={e => { 
              e.stopPropagation(); 
              onMenuOpen(e); 
            }}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Typography 
          variant="body2" 
          color="textSecondary" 
          mb={2}
          sx={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '40px'
          }}
        >
          {project.descripcion || 'Sin descripción'}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                Inicio: {formatDate(project.fecha_inicio)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <DateRangeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="textSecondary">
                Fin: {formatDate(project.fecha_fin)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {project.progreso !== undefined && (
          <Box sx={{ mt: 1 }}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">Progreso</Typography>
              <Typography variant="caption">{project.progreso}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={project.progreso} 
              sx={{ height: 6, borderRadius: 3 }} 
            />
          </Box>
        )}
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Chip 
            label={project.estado} 
            size="small"
            sx={{
              fontWeight: 600,
              px: 1.5,
              border: '2px solid',
              ...getEstadoColor(project.estado)
            }}
          />
          <Typography variant="caption" color="textSecondary">
            Creado: {formatDate(project.creado_en)}
          </Typography>
        </Box>
      </CardContent>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
        // Asegura que el menú esté por encima del modal de editar
        sx={{ zIndex: 13001 }}
        slotProps={{ paper: { sx: { maxWidth: '200px', zIndex: 13001 } } }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
      >
        <MenuItem onClick={() => { handleMenuClose(); handleEditProject(); }}>Editar</MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); handleDeleteClick(); }}>Eliminar</MenuItem>
      </Menu>
    </Card>
  );
}