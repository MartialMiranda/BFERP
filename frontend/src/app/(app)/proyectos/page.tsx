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
import { Project, ProjectFilters as ProjectFiltersType } from '../../../types/project';
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
  const [projects, setProjects] = useState<Project[]>([]);
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
  
  // Eliminado: función no utilizada para manejar cambios en los filtros
  
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
        menuAnchorEl={menuAnchorEl}
        handleMenuClose={handleMenuClose}
        handleEditProject={handleEditProject}
        handleDeleteClick={handleDeleteClick}
        selectedProjectId={selectedProjectId}
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
