'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  IconButton,
  Chip,
  Grid,
  Divider,
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AppDispatch } from '../../../store';
import { addNotification } from '../../../store/slices/uiSlice';
import { Project, ProjectFilters } from '../../../types/project';
import { projectService } from '../../../services/projectService';
import dayjs from 'dayjs';

/**
 * Página de gestión de proyectos
 * Permite ver, crear, editar y eliminar proyectos
 */
export default function ProyectosPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados para la lista de proyectos
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pagina: 1,
    por_pagina: 10,
    total_paginas: 1,
  });
  
  // Estados para filtros
  const [filters, setFilters] = useState<ProjectFilters>({
    pagina: 1,
    por_pagina: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para menú contextual
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Estados para diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: dayjs(),
    fecha_fin: null as dayjs.Dayjs | null,
    estado: 'planificado',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Cargar proyectos al iniciar o cambiar filtros
  useEffect(() => {
    loadProjects();
  }, [filters]);
  
  /**
   * Cargar proyectos desde el API con filtros aplicados
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Aplicar término de búsqueda si existe
      const appliedFilters = { ...filters };
      if (searchTerm) {
        appliedFilters.nombre = searchTerm;
      }
      
      const response = await projectService.getProjects(appliedFilters);
      
      if (response) {
        setProjects(response.proyectos || []);
        setPagination(response.paginacion || {
          total: 0,
          pagina: 1,
          por_pagina: 10,
          total_paginas: 1,
        });
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      dispatch(addNotification({
        message: 'Error al cargar los proyectos',
        severity: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Manejar el envío del formulario de búsqueda
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      pagina: 1, // Resetear a la primera página
    });
    loadProjects();
  };
  
  /**
   * Manejar cambios en los filtros
   */
  const handleFilterChange = (filterName: string, value: any) => {
    setFilters({
      ...filters,
      [filterName]: value,
      pagina: 1, // Resetear a la primera página al cambiar filtros
    });
  };
  
  /**
   * Resetear todos los filtros
   */
  const clearFilters = () => {
    setFilters({
      pagina: 1,
      por_pagina: 10,
    });
    setSearchTerm('');
  };
  
  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      pagina: newPage,
    });
  };
  
  /**
   * Abrir menú contextual para un proyecto
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };
  
  /**
   * Cerrar menú contextual
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  /**
   * Navegar al detalle de un proyecto
   */
  const handleViewProject = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
    handleMenuClose();
  };
  
  /**
   * Abrir diálogo para editar un proyecto
   */
  const handleEditProject = async () => {
    if (!selectedProjectId) return;
    
    try {
      const project = await projectService.getProject(selectedProjectId);
      
      setFormData({
        nombre: project.nombre,
        descripcion: project.descripcion || '',
        fecha_inicio: dayjs(project.fecha_inicio),
        fecha_fin: project.fecha_fin ? dayjs(project.fecha_fin) : null,
        estado: project.estado,
      });
      
      setIsEditMode(true);
      setCreateDialogOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error loading project for edit:', error);
      dispatch(addNotification({
        message: 'Error al cargar el proyecto para editar',
        severity: 'error',
      }));
    }
  };
  
  /**
   * Abrir diálogo para confirmar eliminación
   */
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  /**
   * Eliminar un proyecto
   */
  const confirmDelete = async () => {
    if (!selectedProjectId) return;
    
    try {
      await projectService.deleteProject(selectedProjectId);
      
      dispatch(addNotification({
        message: 'Proyecto eliminado correctamente',
        severity: 'success',
      }));
      
      // Recargar proyectos
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      dispatch(addNotification({
        message: 'Error al eliminar el proyecto',
        severity: 'error',
      }));
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  /**
   * Abrir diálogo para crear nuevo proyecto
   */
  const handleCreateClick = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: dayjs(),
      fecha_fin: null,
      estado: 'planificado',
    });
    setIsEditMode(false);
    setCreateDialogOpen(true);
  };
  
  /**
   * Manejar cambios en el formulario
   */
  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  /**
   * Enviar formulario para crear o editar proyecto
   */
  const handleFormSubmit = async () => {
    try {
      setFormSubmitting(true);
      
      const projectData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        fecha_inicio: formData.fecha_inicio.format('YYYY-MM-DD'),
        fecha_fin: formData.fecha_fin ? formData.fecha_fin.format('YYYY-MM-DD') : undefined,
        estado: formData.estado as 'planificado' | 'en progreso' | 'completado' | 'cancelado',
      };
      
      if (isEditMode && selectedProjectId) {
        // Editar proyecto existente
        await projectService.updateProject(selectedProjectId, projectData);
        dispatch(addNotification({
          message: 'Proyecto actualizado correctamente',
          severity: 'success',
        }));
      } else {
        // Crear nuevo proyecto
        await projectService.createProject(projectData);
        dispatch(addNotification({
          message: 'Proyecto creado correctamente',
          severity: 'success',
        }));
      }
      
      // Cerrar diálogo y recargar proyectos
      setCreateDialogOpen(false);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      dispatch(addNotification({
        message: `Error al ${isEditMode ? 'actualizar' : 'crear'} el proyecto`,
        severity: 'error',
      }));
    } finally {
      setFormSubmitting(false);
    }
  };
  
  /**
   * Formatear fecha en formato legible
   */
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  /**
   * Obtener clase CSS para estado de proyecto
   */
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completado':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200';
      case 'en progreso':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200';
      case 'planificado':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-200';
      case 'cancelado':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Box className="p-4">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Proyectos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Nuevo Proyecto
        </Button>
      </Box>
      
      <Card className="mb-6">
        <Box className="p-4">
          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="flex mb-4">
            <TextField
              fullWidth
              placeholder="Buscar proyectos por nombre..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
              }}
              className="mr-2"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Buscar
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              className="ml-2"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
            >
              Filtros
            </Button>
          </form>
          
          {/* Filtros avanzados */}
          {showFilters && (
            <Box className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <Typography variant="subtitle1" className="mb-3 font-semibold">
                Filtros avanzados
              </Typography>
              
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
                      <MenuItem value="planificado">Planificado</MenuItem>
                      <MenuItem value="en progreso">En progreso</MenuItem>
                      <MenuItem value="completado">Completado</MenuItem>
                      <MenuItem value="cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Fecha inicio desde"
                      value={filters.fecha_inicio_desde ? dayjs(filters.fecha_inicio_desde) : null}
                      onChange={(date) => handleFilterChange('fecha_inicio_desde', date ? (date as dayjs.Dayjs).format('YYYY-MM-DD') : null)}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Fecha inicio hasta"
                      value={filters.fecha_inicio_hasta ? dayjs(filters.fecha_inicio_hasta) : null}
                      onChange={(date) => handleFilterChange('fecha_inicio_hasta', date ? (date as dayjs.Dayjs).format('YYYY-MM-DD') : null)}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Fecha fin desde"
                      value={filters.fecha_fin_desde ? dayjs(filters.fecha_fin_desde) : null}
                      onChange={(date) => handleFilterChange('fecha_fin_desde', date ? (date as dayjs.Dayjs).format('YYYY-MM-DD') : null)}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Fecha fin hasta"
                      value={filters.fecha_fin_hasta ? dayjs(filters.fecha_fin_hasta) : null}
                      onChange={(date) => handleFilterChange('fecha_fin_hasta', date ? (date as dayjs.Dayjs).format('YYYY-MM-DD') : null)}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                      value={filters.ordenar_por || 'creado_en'}
                      onChange={(e) => handleFilterChange('ordenar_por', e.target.value)}
                      label="Ordenar por"
                    >
                      <MenuItem value="nombre">Nombre</MenuItem>
                      <MenuItem value="fecha_inicio">Fecha inicio</MenuItem>
                      <MenuItem value="fecha_fin">Fecha fin</MenuItem>
                      <MenuItem value="estado">Estado</MenuItem>
                      <MenuItem value="creado_en">Fecha creación</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} className="flex justify-end">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={clearFilters}
                    className="mr-2"
                  >
                    Limpiar filtros
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => loadProjects()}
                  >
                    Aplicar filtros
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Card>
      
      {/* Contenedor de proyectos */}
      <Box>
        {loading ? (
          <Box className="p-6 text-center">
            <CircularProgress />
          </Box>
        ) : projects.length === 0 ? (
          <Card className="p-8 text-center">
            <Typography variant="h6" className="mb-2">
              No se encontraron proyectos
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {searchTerm || Object.keys(filters).length > 2
                ? 'Intenta con diferentes filtros de búsqueda'
                : 'Crea tu primer proyecto para comenzar'}
            </Typography>
            {!searchTerm && Object.keys(filters).length <= 2 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateClick}
              >
                Crear nuevo proyecto
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <Box className="p-4">
                    <Box className="flex justify-between items-start">
                      <Typography
                        variant="h6"
                        className="font-semibold cursor-pointer hover:text-primary-600 transition-colors"
                        onClick={() => handleViewProject(project.id)}
                      >
                        {project.nombre}
                      </Typography>
                      
                      <IconButton
                        aria-label="opciones"
                        size="small"
                        onClick={(e) => handleMenuOpen(e, project.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Chip
                      label={
                        project.estado === 'planificado'
                          ? 'Planificado'
                          : project.estado === 'en progreso'
                          ? 'En progreso'
                          : project.estado === 'completado'
                          ? 'Completado'
                          : 'Cancelado'
                      }
                      size="small"
                      className={`mt-2 ${getStatusClass(project.estado)}`}
                    />
                    
                    <Typography variant="body2" className="mt-3 text-gray-600 dark:text-gray-300 h-12 overflow-hidden">
                      {project.descripcion || 'Sin descripción'}
                    </Typography>
                    
                    <Box className="mt-4">
                      <Typography variant="caption" className="text-gray-500 block">
                        Fechas: {formatDate(project.fecha_inicio)}
                        {project.fecha_fin ? ` - ${formatDate(project.fecha_fin)}` : ' (Sin fecha fin)'}
                      </Typography>
                      
                      <Box className="mt-2">
                        <Box className="flex justify-between mb-1">
                          <Typography variant="caption" className="text-gray-500">
                            Progreso
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {project.progreso || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.progreso || 0}
                          className="h-1.5 rounded"
                        />
                      </Box>
                    </Box>
                    
                    <Divider className="my-3" />
                    
                    <Box className="flex justify-between items-center">
                      <Typography variant="caption" className="text-gray-500">
                        Tareas: {project.tareas_completadas || 0}/{project.total_tareas || 0}
                      </Typography>
                      
                      <Typography variant="caption" className="text-gray-500">
                        Equipos: {project.equipos?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Paginación */}
        {!loading && projects.length > 0 && pagination.total_paginas > 1 && (
          <Box className="flex justify-center mt-6">
            <Button
              disabled={pagination.pagina <= 1}
              onClick={() => handlePageChange(pagination.pagina - 1)}
              className="mx-1"
            >
              Anterior
            </Button>
            
            {Array.from({ length: pagination.total_paginas }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={pagination.pagina === page ? 'contained' : 'outlined'}
                onClick={() => handlePageChange(page)}
                className="mx-1"
                size="small"
              >
                {page}
              </Button>
            ))}
            
            <Button
              disabled={pagination.pagina >= pagination.total_paginas}
              onClick={() => handlePageChange(pagination.pagina + 1)}
              className="mx-1"
            >
              Siguiente
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Menú contextual para proyectos */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedProjectId && handleViewProject(selectedProjectId)}>
          <Typography>Ver detalles</Typography>
        </MenuItem>
        <MenuItem onClick={handleEditProject}>
          <EditIcon fontSize="small" className="mr-2" />
          <Typography>Editar</Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} className="text-error-600">
          <DeleteIcon fontSize="small" className="mr-2" />
          <Typography>Eliminar</Typography>
        </MenuItem>
      </Menu>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para crear/editar proyecto */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !formSubmitting && setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <Box className="mt-2 space-y-4">
            <TextField
              fullWidth
              label="Nombre del proyecto"
              value={formData.nombre}
              onChange={(e) => handleFormChange('nombre', e.target.value)}
              required
              disabled={formSubmitting}
            />
            
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => handleFormChange('descripcion', e.target.value)}
              multiline
              rows={3}
              disabled={formSubmitting}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Fecha de inicio"
                    value={formData.fecha_inicio}
                    onChange={(date) => handleFormChange('fecha_inicio', date as dayjs.Dayjs)}
                    renderInput={(params) => <TextField {...params} fullWidth required disabled={formSubmitting} />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Fecha de fin (opcional)"
                    value={formData.fecha_fin}
                    onChange={(date) => handleFormChange('fecha_fin', date as dayjs.Dayjs | null)}
                    renderInput={(params) => <TextField {...params} fullWidth disabled={formSubmitting} />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => handleFormChange('estado', e.target.value)}
                label="Estado"
                disabled={formSubmitting}
              >
                <MenuItem value="planificado">Planificado</MenuItem>
                <MenuItem value="en progreso">En progreso</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCreateDialogOpen(false)} 
            disabled={formSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            color="primary"
            disabled={formSubmitting || !formData.nombre || !formData.fecha_inicio}
          >
            {formSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isEditMode ? 'Actualizar' : 'Crear'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
