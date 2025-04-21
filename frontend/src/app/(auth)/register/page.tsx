'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Paper, TextField, Typography, CircularProgress, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem, FormHelperText, Divider, useTheme } from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { register as registerUser } from '../../../store/slices/authSlice';
import { addNotification } from '../../../store/slices/uiSlice';
import { AppDispatch } from '../../../store';

// Esquema de validación usando Zod
const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  rol: z.enum(['usuario', 'gestor', 'admin']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

/**
 * Página de registro de usuarios
 */
export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = useTheme();
  
  // Configuración del formulario con React Hook Form y validación Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'usuario',
    },
  });

  /**
   * Manejar envío del formulario de registro
   */
  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setLoading(true);
      
      // Crear objeto con datos para el registro (sin confirmPassword)
      const { confirmPassword, ...registerData } = data;
      
      // Dispatch de la acción de registro
      const resultAction = await dispatch(registerUser(registerData));
      
      if (registerUser.fulfilled.match(resultAction)) {
        // Registro exitoso, mostrar mensaje y redirigir a login
        dispatch(addNotification({
          message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
          severity: 'success',
        }));
        router.push('/login');
      } else if (registerUser.rejected.match(resultAction)) {
        // Mostrar error
        const errorMessage = typeof resultAction.payload === 'object' && resultAction.payload && 'message' in resultAction.payload 
          ? (resultAction.payload as {message: string}).message 
          : 'Error al registrar usuario';
        dispatch(addNotification({
          message: errorMessage,
          severity: 'error',
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        message: 'Error al conectar con el servidor',
        severity: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Alternar la visibilidad de la contraseña
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Alternar la visibilidad de la confirmación de contraseña
   */
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Definir gradiente basado en el tema
  const bgGradient = theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(26, 38, 26, 0.9) 0%, rgba(34, 51, 34, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(248, 251, 248, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        background: bgGradient,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: '380px',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              py: 3,
              px: 3,
              textAlign: 'center',
              background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              color: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <PersonAddOutlined sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Crear Cuenta
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              Regístrate para acceder al sistema
            </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Nombre completo"
                type="text"
                variant="outlined"
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                disabled={loading}
                {...register('nombre')}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
                {...register('email')}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('password')}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Confirmar contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleConfirmPasswordVisibility} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('confirmPassword')}
                sx={{ mb: 2.5 }}
              />

              <FormControl
                fullWidth
                error={!!errors.rol}
                sx={{ mb: 2.5 }}
              >
                <InputLabel id="rol-label">Rol</InputLabel>
                <Select
                  labelId="rol-label"
                  label="Rol"
                  defaultValue="usuario"
                  disabled={loading}
                  {...register('rol')}
                >
                  <MenuItem value="usuario">Usuario</MenuItem>
                  <MenuItem value="gestor">Gestor de Proyectos</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
                {errors.rol && (
                  <FormHelperText>{errors.rol.message}</FormHelperText>
                )}
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  mb: 2,
                  borderRadius: 2,
                  padding: '10px 0',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Registrarse'
                )}
              </Button>
            </form>

            <Box sx={{ mt: 2, pt: 2, textAlign: 'center' }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  href="/login"
                  style={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Iniciar sesión
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
