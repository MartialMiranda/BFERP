'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  LockOpen as LockOpenIcon, 
  Lock as LockIcon,
  Email as EmailIcon,
  AppShortcut as AppIcon
} from '@mui/icons-material';
import { 
  enable2FA, 
  disable2FA, 
  selectUser, 
  selectAuthLoading,
  selectAuthError,
  selectTwoFactorSetup
} from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import TwoFactorVerification from './TwoFactorVerification';
import { addNotification } from '../../store/slices/uiSlice';

/**
 * Component for managing Two-Factor Authentication settings
 */
export default function TwoFactorSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const twoFactorSetup = useSelector(selectTwoFactorSetup);

  const [method, setMethod] = useState<'app' | 'email'>('app');
  
  // Determinar si estamos en proceso de verificación basado en el estado global
  const showVerification = twoFactorSetup?.pendingVerification || false;
  
  // Resetear el método cuando cambia el usuario
  useEffect(() => {
    if (!twoFactorSetup?.isActivating) {
      setMethod('app');
    } else if (twoFactorSetup?.method) {
      setMethod(twoFactorSetup.method);
    }
  }, [user?.id, twoFactorSetup]);

  /**
   * Handle change of 2FA method
   */
  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(event.target.value as 'app' | 'email');
  };

  /**
   * Handle enabling 2FA
   */
  const handleEnable2FA = async () => {
    try {
      console.log('Activando 2FA con método:', method);
      const resultAction = await dispatch(enable2FA(method));
      
      if (enable2FA.fulfilled.match(resultAction)) {
        // El estado de twoFactorSetup ya se gestiona en el slice de autenticación
        dispatch(addNotification({
          message: method === 'app' 
            ? 'Escanea el código QR con tu aplicación de autenticación' 
            : 'Se ha enviado un código de verificación a tu correo electrónico',
          severity: 'info',
        }));
      }
    } catch (error) {
      console.error('Error activando 2FA:', error);
      dispatch(addNotification({
        message: 'Error al configurar la autenticación de dos factores',
        severity: 'error',
      }));
    }
  };

  /**
   * Handle disabling 2FA
   */
  const handleDisable2FA = async () => {
    try {
      const resultAction = await dispatch(disable2FA());
      
      if (disable2FA.fulfilled.match(resultAction)) {
        dispatch({ type: 'auth/cancelTwoFactorSetup' });
        
        dispatch(addNotification({
          message: 'La autenticación de dos factores ha sido desactivada',
          severity: 'success',
        }));
      }
    } catch {
      dispatch(addNotification({
        message: 'Error al desactivar la autenticación de dos factores',
        severity: 'error',
      }));
    }
  };

  /**
   * Handle verification success
   */
  const handleVerificationSuccess = () => {
    dispatch(addNotification({
      message: 'La autenticación de dos factores ha sido activada correctamente',
      severity: 'success',
    }));
  };

  /**
   * Handle verification cancellation
   */
  const handleCancelVerification = () => {
    // El estado principal se actualizará a través de una acción de redux
    // para asegurar que todo está sincronizado
    dispatch({ type: 'auth/cancelTwoFactorSetup' });
  };

  // If user is not available, show loading
  if (!user) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: { xs: 3, md: 5 }, boxShadow: 3, borderRadius: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ mr: 3 }}>
          {user.tiene_2fa ? (
            <LockIcon color="success" fontSize="large" />
          ) : (
            <LockOpenIcon color="warning" fontSize="large" />
          )}
        </Box>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Autenticación de Dos Factores (2FA)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.tiene_2fa 
              ? 'Tu cuenta está protegida con autenticación de dos factores' 
              : 'Añade una capa extra de seguridad a tu cuenta'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {!user.tiene_2fa && !showVerification && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Elige un método de autenticación de dos factores:
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              name="2fa-method"
              value={method}
              onChange={handleMethodChange}
            >
              <FormControlLabel 
                value="app" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AppIcon sx={{ mr: 1 }} />
                    <span>Aplicación de autenticación (Google Authenticator, Authy, etc.)</span>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="email" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <span>Correo electrónico ({user.email})</span>
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnable2FA}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
            >
              Activar 2FA
            </Button>
          </Box>
        </Box>
      )}

      {showVerification && twoFactorSetup && (
        <TwoFactorVerification
          method={twoFactorSetup.method || method}
          setupData={{
            secret: twoFactorSetup.secret || '',
            otpauth_url: twoFactorSetup.qrCode || '',
            emailSent: twoFactorSetup.method === 'email',
            verified: false
          }}
          onSuccess={handleVerificationSuccess}
          onCancel={handleCancelVerification}
        />
      )}

      {user.tiene_2fa && !showVerification && (
        <Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Método actual: <strong>{user.metodo_2fa === 'app' ? 'Aplicación de autenticación' : 'Correo electrónico'}</strong>
          </Typography>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleDisable2FA}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LockOpenIcon />}
          >
            Desactivar 2FA
          </Button>
        </Box>
      )}
    </Card>
  );
}
