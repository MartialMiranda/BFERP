'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  LinearProgress,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { selectUser } from '../../store/slices/authSlice';

/**
 * Security Card component for Dashboard
 * Shows security status and prompt for 2FA setup
 */
export default function SecurityCard() {
  const router = useRouter();
  const user = useSelector(selectUser);
  
  // Calculate security score
  const securityScore = user?.tiene_2fa ? 100 : 50;
  
  /**
   * Navigate to security page
   */
  const handleNavigateToSecurity = () => {
    router.push('/security');
  };
  
  if (!user) return null;
  
  return (
    <Card className="shadow-md h-full">
      <Box className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <SecurityIcon fontSize="small" className="mr-2" />
        <Typography variant="h6" component="h3" className="font-medium">
          Seguridad de la Cuenta
        </Typography>
      </Box>
      
      <Box className="p-4">
        <Box className="flex items-center justify-between mb-3">
          <Typography variant="body2" color="textSecondary">
            Nivel de seguridad
          </Typography>
          <Chip 
            label={securityScore === 100 ? "Excelente" : "Básico"} 
            size="small"
            color={securityScore === 100 ? "success" : "warning"}
            icon={securityScore === 100 ? <CheckIcon /> : <WarningIcon />}
          />
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={securityScore} 
          color={securityScore === 100 ? "success" : "warning"}
          className="h-2 rounded-full mb-4"
        />
        
        <Box className="mb-4">
          <Box className="flex items-center mb-2">
            <Avatar className="h-8 w-8 bg-blue-100 text-blue-600 mr-3">
              <SecurityIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" className="font-medium">
                Autenticación de Dos Factores (2FA)
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.tiene_2fa 
                  ? `Activado (${user.metodo_2fa === 'app' ? 'Aplicación' : 'Email'})` 
                  : 'No activado'}
              </Typography>
            </Box>
            {user.tiene_2fa && (
              <CheckIcon 
                className="ml-auto text-green-500" 
                fontSize="small" 
              />
            )}
          </Box>
        </Box>
        
        {!user.tiene_2fa && (
          <Box className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg mb-4">
            <Typography variant="body2" className="text-orange-800 dark:text-orange-200 mb-2">
              <WarningIcon fontSize="small" className="mr-1" />
              Tu cuenta no tiene autenticación de dos factores
            </Typography>
            <Typography variant="caption" className="text-orange-700 dark:text-orange-300">
              Para mayor seguridad, te recomendamos activar la autenticación de dos factores.
            </Typography>
          </Box>
        )}
        
        <Button
          variant={user.tiene_2fa ? "outlined" : "contained"}
          color={user.tiene_2fa ? "primary" : "warning"}
          onClick={handleNavigateToSecurity}
          fullWidth
        >
          {user.tiene_2fa ? "Administrar seguridad" : "Activar 2FA ahora"}
        </Button>
      </Box>
    </Card>
  );
}
