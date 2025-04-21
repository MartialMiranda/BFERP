'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  Alert,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Info,
  Storage,
  Update,
  CloudDownload,
  Refresh,
  ContentCopy,
  Check
} from '@mui/icons-material';
import { apiClient } from '@/services/apiClient';

interface SystemStats {
  version: string;
  dbVersion: string;
  nodeVersion: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  lastUpdate: string;
  updateAvailable: boolean;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
};

const SystemInformation = () => {
  const [systemInfo, setSystemInfo] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'updating' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    fetchSystemInfo();
  }, []);
  
  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En un entorno real, esto vendría de la API
      // const response = await apiClient.get('/api/sistema/info');
      // setSystemInfo(response.data);
      
      // Simulamos datos para este ejemplo
      setTimeout(() => {
        setSystemInfo({
          version: 'v1.5.3',
          dbVersion: 'PostgreSQL 14.5',
          nodeVersion: 'v18.12.1',
          uptime: 1209600, // 14 días en segundos
          memory: {
            used: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
            total: 4 * 1024 * 1024 * 1024, // 4 GB
            percentage: 30
          },
          storage: {
            used: 15 * 1024 * 1024 * 1024, // 15 GB
            total: 100 * 1024 * 1024 * 1024, // 100 GB
            percentage: 15
          },
          lastUpdate: '2025-03-01T14:30:00',
          updateAvailable: true
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setError('No se pudo obtener la información del sistema. Por favor, inténtalo de nuevo más tarde.');
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchSystemInfo();
  };
  
  const handleCheckUpdates = () => {
    setUpdateStatus('checking');
    
    // Simulamos una verificación de actualizaciones
    setTimeout(() => {
      setUpdateStatus('idle');
      // Actualizar el estado con la información más reciente
      if (systemInfo) {
        setSystemInfo({
          ...systemInfo,
          updateAvailable: true
        });
      }
    }, 2000);
  };
  
  const handleUpdate = () => {
    setUpdateStatus('updating');
    
    // Simulamos una actualización
    setTimeout(() => {
      setUpdateStatus('success');
      // Actualizar el estado con la nueva versión
      if (systemInfo) {
        setSystemInfo({
          ...systemInfo,
          version: 'v1.5.4',
          lastUpdate: new Date().toISOString(),
          updateAvailable: false
        });
      }
      
      // Resetear el estado después de un tiempo
      setTimeout(() => {
        setUpdateStatus('idle');
      }, 3000);
    }, 3000);
  };
  
  const handleCopySystemInfo = () => {
    if (!systemInfo) return;
    
    const info = `
      Sistema ERP - Información del Sistema
      Versión: ${systemInfo.version}
      Base de Datos: ${systemInfo.dbVersion}
      Node.js: ${systemInfo.nodeVersion}
      Tiempo de actividad: ${formatUptime(systemInfo.uptime)}
      Memoria: ${formatBytes(systemInfo.memory.used)} / ${formatBytes(systemInfo.memory.total)}
      Almacenamiento: ${formatBytes(systemInfo.storage.used)} / ${formatBytes(systemInfo.storage.total)}
      Última actualización: ${new Date(systemInfo.lastUpdate).toLocaleString()}
    `;
    
    navigator.clipboard.writeText(info.trim());
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Cargando información del sistema...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleRefresh}
          sx={{ ml: 2 }}
        >
          Reintentar
        </Button>
      </Alert>
    );
  }
  
  if (!systemInfo) return null;
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Información del Sistema
        </Typography>
        <Box>
          <Tooltip title="Copiar información">
            <IconButton onClick={handleCopySystemInfo} sx={{ mr: 1 }}>
              {copied ? <Check color="success" /> : <ContentCopy />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Actualizar información">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ mb: 3 }}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Versión del Sistema"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {systemInfo.version}
                      {systemInfo.updateAvailable && (
                        <Chip 
                          size="small" 
                          label="Actualización disponible" 
                          color="warning" 
                          sx={{ ml: 2 }} 
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Base de Datos"
                  secondary={systemInfo.dbVersion}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Versión de Node.js"
                  secondary={systemInfo.nodeVersion}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Tiempo de Actividad"
                  secondary={formatUptime(systemInfo.uptime)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Última Actualización"
                  secondary={new Date(systemInfo.lastUpdate).toLocaleString()}
                />
              </ListItem>
            </List>
          </Paper>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Actualizaciones del Sistema
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {updateStatus === 'checking' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Comprobando actualizaciones...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}
                
                {updateStatus === 'updating' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Actualizando el sistema...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}
                
                {updateStatus === 'success' && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    El sistema se ha actualizado correctamente a la versión {systemInfo.version}
                  </Alert>
                )}
                
                {updateStatus === 'error' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    No se pudo actualizar el sistema. Por favor, inténtalo de nuevo más tarde.
                  </Alert>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Update />}
                  onClick={handleCheckUpdates}
                  disabled={updateStatus === 'checking' || updateStatus === 'updating'}
                >
                  Comprobar actualizaciones
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownload />}
                  onClick={handleUpdate}
                  disabled={!systemInfo.updateAvailable || updateStatus === 'checking' || updateStatus === 'updating'}
                >
                  Actualizar ahora
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Uso de Memoria
            </Typography>
            
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {formatBytes(systemInfo.memory.used)} de {formatBytes(systemInfo.memory.total)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {systemInfo.memory.percentage}%
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={systemInfo.memory.percentage} 
              sx={{ height: 10, borderRadius: 5, mb: 3 }}
              color={systemInfo.memory.percentage > 80 ? "error" : systemInfo.memory.percentage > 60 ? "warning" : "success"}
            />
            
            <Typography variant="subtitle1" gutterBottom>
              Almacenamiento
            </Typography>
            
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {formatBytes(systemInfo.storage.used)} de {formatBytes(systemInfo.storage.total)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {systemInfo.storage.percentage}%
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={systemInfo.storage.percentage} 
              sx={{ height: 10, borderRadius: 5 }}
              color={systemInfo.storage.percentage > 80 ? "error" : systemInfo.storage.percentage > 60 ? "warning" : "success"}
            />
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Info color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Acerca del Sistema
              </Typography>
            </Box>
            
            <Typography variant="body2" paragraph>
              El Sistema de Planificación de Recursos Empresariales (ERP) está diseñado para integrar
              todos los datos y procesos de su organización en un sistema unificado. Esta solución todo en uno
              le permite gestionar proyectos, tareas, equipos y recursos de manera eficiente.
            </Typography>
            
            <Typography variant="body2" paragraph>
              Desarrollado con tecnologías modernas como Next.js, Material UI y PostgreSQL, nuestro sistema
              ofrece un rendimiento óptimo, alta seguridad y una interfaz de usuario intuitiva.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              © 2025 Sistema ERP - Todos los derechos reservados
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemInformation;
