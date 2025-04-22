'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Card, TextField, Typography, CircularProgress, InputAdornment, IconButton, Alert, Paper, Divider, useTheme, FormControlLabel, Checkbox } from '@mui/material';
import { Visibility, VisibilityOff, VerifiedUser, ArrowBack, LockOutlined } from '@mui/icons-material';
import { login, selectRequires2FA, clearAuth } from '../../../store/slices/authSlice';
import { addNotification } from '../../../store/slices/uiSlice';
import { AppDispatch } from '../../../store';

// Esquema de validación usando Zod
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  code_2fa: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

/**
 * Página de inicio de sesión
 */
export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const requires2FA = useSelector(selectRequires2FA);
  const [method2FA, setMethod2FA] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{ email: string; password: string; rememberMe: boolean } | null>(null);
  const theme = useTheme();
  
  // Configuración del formulario con React Hook Form y validación Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      code_2fa: '',
      rememberMe: true,
    },
  });

  // Restaurar las credenciales guardadas si regresamos a la pantalla de login 
  // después de un intento de 2FA
  useEffect(() => {
    if (!requires2FA && userCredentials) {
      setValue('email', userCredentials.email);
      setValue('password', userCredentials.password);
      setValue('rememberMe', userCredentials.rememberMe);
      setUserCredentials(null);
    }
  }, [requires2FA, userCredentials, setValue]);

  /**
   * Manejar envío del formulario de login
   */
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      
      // Si estamos verificando 2FA, asegurarse de enviar las credenciales guardadas
      let loginData;
      
      if (requires2FA && userCredentials) {
        console.log('Enviando código 2FA para verificación:', data.code_2fa);
        loginData = { 
          email: userCredentials.email, 
          password: userCredentials.password,
          code_2fa: data.code_2fa,
          rememberMe: userCredentials.rememberMe
        };
      } else {
        // Login normal sin 2FA
        loginData = {
          ...data,
          rememberMe: data.rememberMe
        };
        
        // Guardar credenciales por si necesitamos 2FA en el siguiente paso
        setUserCredentials({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ?? true // Ensure rememberMe is always a boolean
        });
      }
      
      // Dispatch de la acción de login
      const resultAction = await dispatch(login(loginData));
      
      if (login.fulfilled.match(resultAction)) {
        // Verificar si se requiere 2FA
        if (resultAction.payload.requires2FA) {
          // El backend requiere 2FA
          const metodo = resultAction.payload.metodo_2fa || 'app';
          setMethod2FA(metodo);
          console.log('Se requiere 2FA con método:', metodo);
          
          dispatch(addNotification({
            message: `Se requiere verificación de dos factores (${metodo}). Por favor, introduce el código.`,
            severity: 'info',
          }));
          
          // No redirigir aquí, ya que el usuario necesita introducir el código 2FA
        } else {
          // Login exitoso, redirigir al usuario
          router.push('/dashboard');
          clearErrors();
          
          dispatch(addNotification({
            message: 'Inicio de sesión exitoso. Bienvenido/a!',
            severity: 'success',
          }));
        }
      } else if (login.rejected.match(resultAction)) {
        // Mostrar error
        const errorMessage = typeof resultAction.payload === 'object' && resultAction.payload && 'message' in resultAction.payload 
          ? (resultAction.payload as {message: string}).message 
          : 'Error al iniciar sesión';
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
   * Volver al login normal desde la pantalla de 2FA
   */
  const handleBack = () => {
    dispatch(clearAuth());
  };

  /**
   * Alternar la visibilidad de la contraseña
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
              <LockOutlined sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              {requires2FA ? 'Verificación' : 'Iniciar Sesión'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              {requires2FA ? 'Completa la verificación' : 'Accede a tu cuenta'}
            </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3 }}>
            {requires2FA && (
              <Box sx={{ mb: 2 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Volver
                </Button>
              </Box>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {!requires2FA && (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading || requires2FA}
                    InputProps={{
                      readOnly: requires2FA,
                    }}
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
                </>
              )}

              {requires2FA && (
                <>
                  <Alert
                    severity="info"
                    sx={{ mb: 2.5, borderRadius: 2 }}
                  >
                    {method2FA === 'email'
                      ? 'Hemos enviado un código de verificación a tu correo electrónico.'
                      : 'Introduce el código de tu aplicación de autenticación.'}
                  </Alert>

                  <TextField
                    fullWidth
                    label="Código de verificación"
                    type="text"
                    variant="outlined"
                    placeholder="Ingresa el código de 6 dígitos"
                    error={!!errors.code_2fa}
                    helperText={errors.code_2fa?.message}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VerifiedUser color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 6,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    autoFocus
                    {...register('code_2fa')}
                    sx={{ mb: 2.5 }}
                  />
                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  color: 'white',
                  borderRadius: 2,
                  height: 48,
                  fontSize: '1rem',
                  textTransform: 'none',
                  position: 'relative',
                  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : requires2FA ? (
                  'Verificar'
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Opción Recordarme */}
              {!requires2FA && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('rememberMe')}
                        defaultChecked={true}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" color="textSecondary">
                        Recordarme
                      </Typography>
                    }
                  />
                  <Link href="/forgot-password">
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Typography>
                  </Link>
                </Box>
              )}
              
              {/* Divider y Registro */}
              {!requires2FA && (
                <Box sx={{ mt: 2, pt: 2, textAlign: 'center' }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2">
                    ¿No tienes una cuenta?{' '}
                    <Link
                      href="/register"
                      style={{
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        textDecoration: 'none',
                      }}
                    >
                      Registrarse
                    </Link>
                  </Typography>
                </Box>
              )}
            </form>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
