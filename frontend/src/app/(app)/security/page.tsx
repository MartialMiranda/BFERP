'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  Tabs, 
  Tab, 
  Divider,
  Paper
} from '@mui/material';
import { 
  Lock as LockIcon, 
  Key as KeyIcon
} from '@mui/icons-material';
import TwoFactorSettings from '../../../components/auth/TwoFactorSettings';
import { selectUser } from '../../../store/slices/authSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab Panel component
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
      className="py-4"
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * Security settings page
 */
export default function SecurityPage() {
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-6">
        <Typography variant="h4" component="h1" className="font-bold mb-2">
          Configuración de Seguridad
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Gestiona la seguridad de tu cuenta y configura la autenticación de dos factores
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper className="p-4">
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Security settings tabs"
              className="border-r"
            >
              <Tab 
                label={
                  <Box className="flex items-center text-left py-2">
                    <LockIcon className="mr-3" />
                    <Box>
                      <Typography className="font-medium">Autenticación</Typography>
                      <Typography variant="caption" color="textSecondary">
                        2FA, Seguridad
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="security-tab-0"
              />
              <Tab 
                label={
                  <Box className="flex items-center text-left py-2">
                    <KeyIcon className="mr-3" />
                    <Box>
                      <Typography className="font-medium">Contraseña</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Cambio, Recuperación
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="security-tab-1"
              />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper className="p-6">
            <TabPanel value={tabValue} index={0}>
              <Box className="mb-6">
                <Typography variant="h5" component="h2" className="font-semibold mb-2">
                  Autenticación de Dos Factores
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mb-4">
                  La autenticación de dos factores (2FA) añade una capa adicional de seguridad a tu cuenta
                  al requerir un segundo factor además de la contraseña.
                </Typography>
                <Divider className="mb-6" />
                <TwoFactorSettings />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box className="mb-6">
                <Typography variant="h5" component="h2" className="font-semibold mb-2">
                  Gestión de Contraseña
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mb-4">
                  Mantén tu cuenta segura con una contraseña fuerte y cámbiala regularmente.
                </Typography>
                <Divider className="mb-6" />
                <Card className="p-6">
                  <Typography variant="body1">
                    La funcionalidad de cambio de contraseña estará disponible próximamente.
                  </Typography>
                </Card>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
