'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  Paper
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  Cancel as CancelIcon 
} from '@mui/icons-material';
import QRCode from 'react-qr-code';
import { verify2FA, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { TwoFactorResponse } from '../../types/auth';

interface TwoFactorVerificationProps {
  method: 'app' | 'email';
  setupResponse: TwoFactorResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Component for verifying Two-Factor Authentication
 */
export default function TwoFactorVerification({ 
  method, 
  setupResponse, 
  onSuccess, 
  onCancel 
}: TwoFactorVerificationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [qrValue, setQrValue] = useState<string | null>(null);

  // Establecer el valor del QR cuando el componente se monta o cambia el setupResponse
  useEffect(() => {
    if (method === 'app' && setupResponse.otpauth_url) {
      setQrValue(setupResponse.otpauth_url);
      console.log('QR URL:', setupResponse.otpauth_url); // Para debugging
    }
  }, [method, setupResponse]);
  
  /**
   * Handle verification code change
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(code);
    setCodeError('');
  };
  
  /**
   * Verify the 2FA code
   */
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      setCodeError('Por favor, introduce el código de 6 dígitos');
      return;
    }
    
    try {
      const resultAction = await dispatch(verify2FA({ 
        code: verificationCode, 
        method 
      }));
      
      if (verify2FA.fulfilled.match(resultAction)) {
        onSuccess();
      }
    } catch (error) {
      // Error will be handled by the reducer
    }
  };
  
  return (
    <Box className="space-y-6">
      {method === 'app' && qrValue && (
        <Box className="flex flex-col items-center">
          <Typography variant="h6" className="mb-3 text-center">
            Escanea este código QR con tu aplicación de autenticación
          </Typography>
          
          <Paper elevation={0} className="p-6 mb-4" sx={{ background: 'white' }}>
            <div style={{ 
              height: "auto", 
              margin: "0 auto", 
              maxWidth: 256, 
              width: "100%" 
            }}>
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrValue}
                viewBox={`0 0 256 256`}
              />
            </div>
          </Paper>
          
          {setupResponse.secret && (
            <Box className="mt-2 mb-4 text-center">
              <Typography variant="subtitle2" className="mb-1">
                O introduce manualmente esta clave secreta:
              </Typography>
              <Typography 
                variant="body2" 
                className="font-mono bg-gray-100 p-2 rounded"
              >
                {setupResponse.secret}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      {method === 'email' && setupResponse.emailSent && (
        <Box className="text-center mb-4">
          <Typography variant="body1">
            Se ha enviado un código de verificación a tu correo electrónico.
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mt-1">
            El código expirará en 10 minutos.
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" className="my-3">
          {error.message}
        </Alert>
      )}
      
      <Box>
        <Typography variant="subtitle1" className="mb-2">
          Introduce el código de verificación:
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="000000"
          value={verificationCode}
          onChange={handleCodeChange}
          error={!!codeError}
          helperText={codeError}
          inputProps={{
            maxLength: 6,
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          className="mb-4"
        />
        
        <Box className="flex justify-between mt-4">
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={loading}
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            disabled={loading || verificationCode.length < 6}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            Verificar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
