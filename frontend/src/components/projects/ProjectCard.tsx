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
  project, onView, onMenuOpen, getStatusClass,
  menuAnchorEl, handleMenuClose, handleEditProject, handleDeleteClick, isMenuOpen
}: Props) {
  // Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No establecida';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  };

  // Obtener colores según el estado para aplicar en diferentes partes de la tarjeta
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'completado':
        return {
          border: '2px solid #4caf50',
          indicator: '#4caf50',
          bgColor: 'rgba(76, 175, 80, 0.08)',
          progressColor: '#4caf50'
        };
      case 'en progreso':
        return {
          border: '2px solid #2196f3',
          indicator: '#2196f3',
          bgColor: 'rgba(33, 150, 243, 0.08)',
          progressColor: '#2196f3'
        };
      case 'planificado':
        return {
          border: '2px solid #ff9800',
          indicator: '#ff9800',
          bgColor: 'rgba(255, 152, 0, 0.08)',
          progressColor: '#ff9800'
        };
      case 'cancelado':
        return {
          border: '2px solid #f44336',
          indicator: '#f44336',
          bgColor: 'rgba(244, 67, 54, 0.08)',
          progressColor: '#9e9e9e'
        };
      default:
        return {
          border: '2px solid #9e9e9e',
          indicator: '#9e9e9e',
          bgColor: 'rgba(158, 158, 158, 0.08)',
          progressColor: '#9e9e9e'
        };
    }
  };

  const statusColors = getStatusColors(project.estado);

  return (
    <Card 
      sx={{ 
        cursor: 'pointer', 
        position: 'relative', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: statusColors.border,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        },
        backgroundColor: statusColors.bgColor
      }} 
      onClick={onView}
    >
      {/* Barra indicadora de estado */}
      <Box 
        sx={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          width: '6px', 
          backgroundColor: statusColors.indicator 
        }} 
      />

      <CardContent sx={{ flex: '1 0 auto', pl: 3 }}>
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
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: statusColors.progressColor
                }
              }} 
            />
          </Box>
        )}
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Chip 
            label={project.estado} 
            sx={{
              backgroundColor: statusColors.indicator,
              color: '#fff',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
            size="small" 
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