'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Avatar, 
  Typography, 
  Switch, 
  FormControlLabel,
  CircularProgress,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import { PhotoCamera, Save, Security } from '@mui/icons-material';
import { RootState } from '@/store';

const UserSettingsForm = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    departamento: '',
    twoFactorEnabled: false,
    notificacionesEmail: true,
    notificacionesApp: true
  });
  
  const [success, setSuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: '', 
        email: user.email || '',
        telefono: '', 
        cargo: '', 
        departamento: '', 
        twoFactorEnabled: user.tiene_2fa || false,
        notificacionesEmail: true, 
        notificacionesApp: true 
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setSuccess(false);
    setLocalError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setLocalError('Error al actualizar el perfil. Inténtelo de nuevo.');
      console.error('Error updating user profile:', err);
    } finally {
      setLocalLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Perfil actualizado correctamente!
        </Alert>
      )}
      
      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'object' && error !== null && 'message' in error 
            ? error.message 
            : error || localError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" flexDirection="column" alignItems="center">
          <Avatar
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              border: theme => `4px solid ${theme.palette.primary.main}`
            }}
            alt={`${formData.nombre} ${formData.apellido}`}
            src="/placeholder-avatar.jpg"
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="icon-button-file"
            type="file"
          />
          <label htmlFor="icon-button-file">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Departamento"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Seguridad
            </Typography>
          </Divider>
        </Grid>
        
        <Grid item xs={12} display="flex" alignItems="center">
          <Security color="action" sx={{ mr: 2 }} />
          <FormControlLabel
            control={
              <Switch
                checked={formData.twoFactorEnabled}
                onChange={handleChange}
                name="twoFactorEnabled"
                color="primary"
              />
            }
            label="Habilitar autenticación de dos factores"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Notificaciones
            </Typography>
          </Divider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.notificacionesEmail}
                onChange={handleChange}
                name="notificacionesEmail"
                color="primary"
              />
            }
            label="Recibir notificaciones por email"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.notificacionesApp}
                onChange={handleChange}
                name="notificacionesApp"
                color="primary"
              />
            }
            label="Recibir notificaciones en la aplicación"
          />
        </Grid>
        
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={loading || localLoading}
          >
            {(loading || localLoading) ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Guardando...
              </>
            ) : 'Guardar Cambios'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserSettingsForm;
