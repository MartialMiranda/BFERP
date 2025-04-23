'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AppDispatch } from '../../../store';
import { addNotification } from '../../../store/slices/uiSlice';
import { Project as ProjectType, ProjectFilters as ProjectFiltersType } from '../../../types/project';
import { projectService } from '../../../services/projectService';
import dayjs from 'dayjs';
import ProjectFilters from '../../../components/projects/ProjectFilters';
import ProjectList from '../../../components/projects/ProjectList';
import ProjectDialog from '../../../components/projects/ProjectDialog';
import ConfirmDeleteDialog from '../../../components/projects/ConfirmDeleteDialog';
import Pagination from '../../../components/projects/Pagination';

/**
 * Página de gestión de proyectos
 * Permite ver, crear, editar y eliminar proyectos
 */
export default function ProyectosPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados para la lista de proyectos
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pagina: 1,
    por_pagina: 10,
    total_paginas: 1,
  });
  
  // Estados para filtros
  const [filters, setFilters] = useState<ProjectFiltersType>({
    pagina: 1,
    por_pagina: 10,
    nombre: '',
    estado: 'todos', // Usar 'todos' como valor predeterminado
    ordenar_por: '',
    orden: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para menú contextual
  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement | null, projectId: string | null }>({ anchorEl: null, projectId: null });
  
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

  // Sincroniza el campo de búsqueda con el filtro nombre
  useEffect(() => {
    if (filters.nombre !== searchTerm) {
      setSearchTerm(filters.nombre || '');
    }
    // eslint-disable-next-line
  }, [filters.nombre]);
  
  /**
   * Cargar proyectos desde el API con filtros aplicados
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Preparamos los filtros para enviar al backend
      const apiFilters: ProjectFiltersType = {
        pagina: filters.pagina,
        por_pagina: filters.por_pagina,
        orden: filters.orden
      };
      
      // Filtro de búsqueda por nombre
      if (searchTerm && searchTerm.trim() !== '') {
        apiFilters.nombre = searchTerm.trim();
      }
      
      // Filtro por estado - solo lo incluimos si no es 'todos'
      if (filters.estado && filters.estado !== 'todos') {
        apiFilters.estado = filters.estado;
      }
      
      // Filtro de ordenamiento
      if (filters.ordenar_por) {
        apiFilters.ordenar_por = filters.ordenar_por;
      }
      
      console.log('Filtros enviados a la API:', apiFilters);
      
      // Llamada al servicio con los filtros procesados
      const response = await projectService.getProjects(apiFilters);
      
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
      console.error('Error al cargar proyectos:', error);
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
    console.log('Buscando:', searchTerm);
    
    // Resetear a la primera página y mantener los demás filtros
    setFilters(prev => ({
      ...prev,
      pagina: 1
    }));
    
    // loadProjects se llamará automáticamente en el useEffect
    // Ya que hemos configurado la función loadProjects para usar searchTerm directamente
  };
  
  /**
   * Resetear todos los filtros
   */
  const clearFilters = () => {    
    // Resetear el término de búsqueda
    setSearchTerm('');
    
    // Resetear todos los filtros a sus valores predeterminados
    setFilters({
      pagina: 1,
      por_pagina: 10,
      nombre: '',
      estado: 'todos',
      ordenar_por: '',
      orden: 'desc'
    });
    
    // loadProjects se llamará automáticamente debido al useEffect
  };
  
  /**
   * Manejar cambio de página
   */
  const handlePageChange = (newPage: number) => {
    setFilters(prevState => ({
      ...prevState,
      pagina: newPage,
    }));
    // loadProjects se llamará automáticamente debido al useEffect
  };
  
  /**
   * Abrir menú contextual para un proyecto
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setMenuState({ anchorEl: event.currentTarget, projectId });
  };
  
  /**
   * Cerrar menú contextual
   */
  const handleMenuClose = () => {
    setMenuState({ anchorEl: null, projectId: null });
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
    if (!menuState.projectId) return;
    
    try {
      const project = await projectService.getProject(menuState.projectId);
      
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
    if (!menuState.projectId) return;
    
    try {
      await projectService.deleteProject(menuState.projectId);
      
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
  const handleFormChange = (field: keyof typeof formData, value: string | dayjs.Dayjs | null) => {
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
      
      if (isEditMode && menuState.projectId) {
        // Editar proyecto existente
        await projectService.updateProject(menuState.projectId, projectData);
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
      <ProjectFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        loadProjects={loadProjects}
        handleSearch={handleSearch}
      />
      <ProjectList
        projects={projects}
        loading={loading}
        handleViewProject={handleViewProject}
        handleMenuOpen={handleMenuOpen}
        getStatusClass={getStatusClass}
        menuAnchorEl={menuState.anchorEl}
        handleMenuClose={handleMenuClose}
        handleEditProject={handleEditProject}
        handleDeleteClick={handleDeleteClick}
        selectedProjectId={menuState.projectId}
      />
      <Pagination
        loading={loading}
        projects={projects}
        pagination={pagination}
        handlePageChange={handlePageChange}
      />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
      <ProjectDialog
        open={createDialogOpen}
        onClose={() => !formSubmitting && setCreateDialogOpen(false)}
        isEditMode={isEditMode}
        formData={formData}
        handleFormChange={handleFormChange}
        handleFormSubmit={handleFormSubmit}
        formSubmitting={formSubmitting}
      />
    </Box>
  );
}
