'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  Save,
  Email,
  Notifications,
  CalendarMonth,
  GroupAdd,
  Assignment,
  Comment
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface NotificationSetting {
  id: string;
  type: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
}

const NotificationSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'task_assigned',
      type: 'tasks',
      icon: <Assignment color="primary" />,
      title: 'Asignación de tareas',
      description: 'Recibir notificaciones cuando se te asigna una nueva tarea',
      email: true,
      push: true
    },
    {
      id: 'task_deadline',
      type: 'tasks',
      icon: <CalendarMonth color="warning" />,
      title: 'Fecha límite de tareas',
      description: 'Recibir recordatorios antes de la fecha límite de tareas',
      email: true,
      push: true
    },
    {
      id: 'task_comment',
      type: 'tasks',
      icon: <Comment color="info" />,
      title: 'Comentarios en tareas',
      description: 'Recibir notificaciones cuando alguien comenta en tus tareas',
      email: false,
      push: true
    },
    {
      id: 'team_invite',
      type: 'teams',
      icon: <GroupAdd color="success" />,
      title: 'Invitaciones a equipos',
      description: 'Recibir notificaciones cuando te invitan a un equipo',
      email: true,
      push: true
    },
    {
      id: 'system_updates',
      type: 'system',
      icon: <Notifications color="secondary" />,
      title: 'Actualizaciones del sistema',
      description: 'Recibir información sobre nuevas funcionalidades y mejoras',
      email: true,
      push: false
    }
  ]);

  const [frequency, setFrequency] = useState('realtime');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleChange = (id: string, channel: 'email' | 'push') => {
    setSettings(settings.map(setting => {
      if (setting.id === id) {
        return {
          ...setting,
          [channel]: !setting[channel]
        };
      }
      return setting;
    }));
  };

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(event.target.value);
  };

  const handleSave = () => {
    // Aquí se enviarían los cambios al servidor
    console.log('Saving notification settings:', { settings, frequency });
    
    // Mostrar mensaje de éxito
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Canales de notificación
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configura cómo quieres recibir las notificaciones del sistema. Puedes activar o desactivar las notificaciones por correo electrónico y las notificaciones push.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Email />}
            label="Correo electrónico"
            variant="outlined"
            color="primary"
          />
          <Typography variant="body2" color="text.secondary">
            Notificaciones enviadas a {user?.email || 'tu correo electrónico'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Notifications />}
            label="Notificaciones push"
            variant="outlined"
            color="primary"
          />
          <Typography variant="body2" color="text.secondary">
            Notificaciones en tiempo real cuando estás usando la aplicación
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Frecuencia de notificaciones
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup value={frequency} onChange={handleFrequencyChange}>
            <FormControlLabel 
              value="realtime" 
              control={<Radio />} 
              label="Tiempo real (recibir notificaciones inmediatamente)" 
            />
            <FormControlLabel 
              value="daily" 
              control={<Radio />} 
              label="Resumen diario (recibir un correo al final del día)" 
            />
            <FormControlLabel 
              value="weekly" 
              control={<Radio />} 
              label="Resumen semanal (recibir un correo al final de la semana)" 
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Tipos de notificaciones
      </Typography>
      
      <List>
        {settings.map((setting) => (
          <Paper key={setting.id} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem>
              <ListItemIcon>
                {setting.icon}
              </ListItemIcon>
              <ListItemText
                primary={setting.title}
                secondary={setting.description}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={setting.email}
                        onChange={() => handleToggleChange(setting.id, 'email')}
                      />
                    }
                    label={<Typography variant="caption">Email</Typography>}
                    labelPlacement="bottom"
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={setting.push}
                        onChange={() => handleToggleChange(setting.id, 'push')}
                      />
                    }
                    label={<Typography variant="caption">Push</Typography>}
                    labelPlacement="bottom"
                  />
                </FormGroup>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        {savedSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Configuración de notificaciones guardada correctamente.
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Guardar preferencias
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
