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
  selectAuthError 
} from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import TwoFactorVerification from './TwoFactorVerification';
import { addNotification } from '../../store/slices/uiSlice';
import { TwoFactorResponse } from '../../types/auth';

/**
 * Component for managing Two-Factor Authentication settings
 */
export default function TwoFactorSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [method, setMethod] = useState<'app' | 'email'>('app');
  const [setupResponse, setSetupResponse] = useState<TwoFactorResponse | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Reset state when component mounts or user changes
  useEffect(() => {
    setShowVerification(false);
    setSetupResponse(null);
  }, [user?.id]);

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
      const resultAction = await dispatch(enable2FA(method));
      
      if (enable2FA.fulfilled.match(resultAction)) {
        setSetupResponse(resultAction.payload);
        setShowVerification(true);
        
        dispatch(addNotification({
          message: method === 'app' 
            ? 'Escanea el código QR con tu aplicación de autenticación' 
            : 'Se ha enviado un código de verificación a tu correo electrónico',
          severity: 'info',
        }));
      }
    } catch (error) {
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
        setShowVerification(false);
        setSetupResponse(null);
        
        dispatch(addNotification({
          message: 'La autenticación de dos factores ha sido desactivada',
          severity: 'success',
        }));
      }
    } catch (error) {
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
    setShowVerification(false);
    setSetupResponse(null);
    
    dispatch(addNotification({
      message: 'La autenticación de dos factores ha sido activada correctamente',
      severity: 'success',
    }));
  };

  /**
   * Handle verification cancellation
   */
  const handleCancelVerification = () => {
    setShowVerification(false);
    setSetupResponse(null);
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
    <Card className="p-6 shadow-md">
      <Box className="mb-6 flex items-center">
        <Box className="mr-4">
          {user.tiene_2fa ? (
            <LockIcon color="success" fontSize="large" />
          ) : (
            <LockOpenIcon color="warning" fontSize="large" />
          )}
        </Box>
        <Box>
          <Typography variant="h5" component="h2" className="font-semibold">
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
        <Alert severity="error" className="mb-4">
          {error.message}
        </Alert>
      )}

      {!user.tiene_2fa && !showVerification && (
        <Box className="mb-6">
          <Typography variant="body1" className="mb-3">
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
                  <Box className="flex items-center">
                    <AppIcon className="mr-2" />
                    <span>Aplicación de autenticación (Google Authenticator, Authy, etc.)</span>
                  </Box>
                } 
              />
              <FormControlLabel 
                value="email" 
                control={<Radio />} 
                label={
                  <Box className="flex items-center">
                    <EmailIcon className="mr-2" />
                    <span>Correo electrónico ({user.email})</span>
                  </Box>
                } 
              />
            </RadioGroup>
          </FormControl>
          
          <Box className="mt-4">
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

      {showVerification && setupResponse && (
        <TwoFactorVerification
          method={method}
          setupResponse={setupResponse}
          onSuccess={handleVerificationSuccess}
          onCancel={handleCancelVerification}
        />
      )}

      {user.tiene_2fa && !showVerification && (
        <Box>
          <Typography variant="body1" className="mb-4">
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
