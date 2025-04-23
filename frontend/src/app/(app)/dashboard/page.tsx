'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Button, Divider } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { addNotification } from '../../../store/slices/uiSlice';
import { AppDispatch } from '../../../store';
import { Project } from '../../../types/project';
import { Task } from '../../../types/task';
import { projectService } from '../../../services/projectService';
import { taskService } from '../../../services/taskService';
import SecurityCard from '../../../components/auth/SecurityCard';

/**
 * Dashboard principal del sistema ERP
 * Muestra resumen de proyectos, tareas y actividad reciente
 */
export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  
  const [loading, setLoading] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);

  // Cargar datos del dashboard
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Cargar proyectos recientes
        const projectsResponse = await projectService.getProjects({
          ordenar_por: 'creado_en',
          orden: 'desc',
          pagina: 1,
          por_pagina: 5
        });
        
        // Cargar tareas asignadas al usuario
        const tasksResponse = await taskService.getMyTasks({
          ordenar_por: 'fecha_vencimiento',
          orden: 'asc',
          pagina: 1,
          por_pagina: 5
        });
        
        // Establecer datos en el estado
        if (projectsResponse) {
          setRecentProjects(projectsResponse.proyectos || []);
          setTotalProjects(projectsResponse.paginacion?.total || 0);
          setActiveProjects(projectsResponse.proyectos?.filter(p => p.estado === 'en progreso').length || 0);
        }
        
        if (tasksResponse) {
          setMyTasks(tasksResponse.tareas || []);
          setTotalTasks(tasksResponse.paginacion?.total || 0);
          setCompletedTasks(tasksResponse.tareas?.filter(t => t.estado === 'completada').length || 0);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        dispatch(addNotification({
          message: 'Error al cargar datos del dashboard',
          severity: 'error'
        }));
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [dispatch]);

  // Formatear fecha en formato legible
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Obtener clase CSS para prioridad de tarea
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200';
      case 'media':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200';
      case 'baja':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Obtener clase CSS para estado de tarea o proyecto
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completada':
      case 'completado':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200';
      case 'en progreso':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200';
      case 'pendiente':
      case 'planificado':
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-200';
      case 'bloqueada':
      case 'cancelado':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', minHeight: '100vh', background: 'none', margin: 0 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard
      </Typography>
      {/* Tarjetas de resumen */}
      <Grid container spacing={0} sx={{ mb: 4, gap: 3, justifyContent: 'center', width: '100%' }}>
        {[0,1,2,3].map((i) => (
          <Grid key={i} item xs={12} sm={6} md={2} sx={{ display: 'flex' }}>
            <Card sx={{
              width: '100%',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              m: 0,
              boxShadow: 3,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              gap: 1.5
            }}>
              {i === 0 && (
                <>
                  <Box className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-full mb-3">
                    <FolderIcon className="text-primary-600 dark:text-primary-400" fontSize="large" />
                  </Box>
                  <Typography variant="h5" className="font-bold">{totalProjects}</Typography>
                  <Typography variant="body1" color="textSecondary">Proyectos totales</Typography>
                </>
              )}
              {i === 1 && (
                <>
                  <Box className="bg-success-100 dark:bg-success-900/20 p-3 rounded-full mb-3">
                    <AssignmentIcon className="text-success-600 dark:text-success-400" fontSize="large" />
                  </Box>
                  <Typography variant="h5" className="font-bold">{activeProjects}</Typography>
                  <Typography variant="body1" color="textSecondary">Proyectos activos</Typography>
                </>
              )}
              {i === 2 && (
                <>
                  <Box className="bg-warning-100 dark:bg-warning-900/20 p-3 rounded-full mb-3">
                    <AssignmentIcon className="text-warning-600 dark:text-warning-400" fontSize="large" />
                  </Box>
                  <Typography variant="h5" className="font-bold">{totalTasks}</Typography>
                  <Typography variant="body1" color="textSecondary">Tareas asignadas</Typography>
                </>
              )}
              {i === 3 && (
                <>
                  <Box className="bg-secondary-100 dark:bg-secondary-900/20 p-3 rounded-full mb-3">
                    <GroupsIcon className="text-secondary-600 dark:text-secondary-400" fontSize="large" />
                  </Box>
                  <Typography variant="h5" className="font-bold">{completedTasks} / {totalTasks}</Typography>
                  <Typography variant="body1" color="textSecondary">Tareas completadas</Typography>
                </>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Contenido principal */}
      <Grid container spacing={3} sx={{ mb: 2, width: '100%' }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Proyectos Recientes
                </Typography>
                <Button variant="text" size="small" href="/proyectos">
                  Ver todos
                </Button>
              </Box>
              {recentProjects.length === 0 ? (
                <Box className="py-4 text-center">
                  <Typography variant="body2" color="textSecondary">
                    No hay proyectos disponibles
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {recentProjects.map((project, index) => (
                    <Box key={project.id}>
                      <Box className="py-3">
                        <Box className="flex justify-between items-start">
                          <Box>
                            <Typography variant="subtitle1" className="font-medium">
                              {project.nombre}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" className="mb-1">
                              {project.descripcion?.substring(0, 60)}
                              {project.descripcion && project.descripcion.length > 60 ? '...' : ''}
                            </Typography>
                            <Box className="flex items-center mt-1">
                              <Typography variant="caption" className="text-gray-500 mr-3">
                                <EventIcon fontSize="small" className="mr-1" />
                                {formatDate(project.fecha_inicio)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                className={`px-2 py-0.5 rounded ${getStatusClass(project.estado)}`}
                              >
                                {project.estado}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      {index < recentProjects.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Mis Tareas
                </Typography>
                <Button variant="text" size="small" href="/tareas">
                  Ver todas
                </Button>
              </Box>
              {myTasks.length === 0 ? (
                <Box className="py-4 text-center">
                  <Typography variant="body2" color="textSecondary">
                    No hay tareas asignadas
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {myTasks.map((task, index) => (
                    <Box key={task.id}>
                      <Box className="py-3">
                        <Box className="flex justify-between items-start">
                          <Box className="flex-grow pr-4">
                            <Typography variant="subtitle1" className="font-medium flex items-center">
                              {task.titulo}
                              {task.prioridad === 'alta' && (
                                <PriorityHighIcon fontSize="small" className="ml-1 text-error-500" />
                              )}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" className="mb-1">
                              {task.descripcion?.substring(0, 60)}
                              {task.descripcion && task.descripcion.length > 60 ? '...' : ''}
                            </Typography>
                            <Box className="flex items-center flex-wrap mt-1">
                              <Typography variant="caption" className="text-gray-500 mr-3">
                                <EventIcon fontSize="small" className="mr-1" />
                                {formatDate(task.fecha_vencimiento)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                className={`px-2 py-0.5 rounded mr-2 ${getPriorityClass(task.prioridad)}`}
                              >
                                {task.prioridad}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                className={`px-2 py-0.5 rounded ${getStatusClass(task.estado)}`}
                              >
                                {task.estado}
                              </Typography>
                            </Box>
                          </Box>
                          {task.estado === 'completada' && (
                            <CheckCircleIcon className="text-success-500" />
                          )}
                        </Box>
                      </Box>
                      {index < myTasks.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, mb: 3 }}>
            <CardContent>
              <SecurityCard />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
