'use client';

import { useState } from 'react';
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
import PasswordChangeForm from './PasswordChangeForm';

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
  // const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Box sx={{ mb: { xs: 4, md: 7 } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Configuración de Seguridad
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Gestiona la seguridad de tu cuenta y configura la autenticación de dos factores
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Security settings tabs"
              sx={{ borderRight: 1, borderColor: 'divider', gap: 1, minHeight: 160 }}
              TabIndicatorProps={{ style: { left: 0 } }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left', py: 1 }}>
                    <LockIcon sx={{ mr: 1.5, fontSize: 22 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 500, fontSize: 15 }}>Autenticación</Typography>
                      <Typography variant="caption" color="textSecondary">
                        2FA, Seguridad
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="security-tab-0"
                sx={{ minHeight: 48, alignItems: 'flex-start' }}
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left', py: 1 }}>
                    <KeyIcon sx={{ mr: 1.5, fontSize: 22 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 500, fontSize: 15 }}>Contraseña</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Cambio, Recuperación
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="security-tab-1"
                sx={{ minHeight: 48, alignItems: 'flex-start' }}
              />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: { xs: 3, md: 5 } }}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: { xs: 4, md: 7 } }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                  Autenticación de Dos Factores
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  La autenticación de dos factores (2FA) añade una capa adicional de seguridad a tu cuenta
                  al requerir un segundo factor además de la contraseña.
                </Typography>
                <Divider sx={{ mb: 4 }} />
                <TwoFactorSettings />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: { xs: 4, md: 7 } }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                  Gestión de Contraseña
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Mantén tu cuenta segura con una contraseña fuerte y cámbiala regularmente.
                </Typography>
                <Divider sx={{ mb: 4 }} />
                <Card sx={{ p: { xs: 3, md: 5 } }}>
                  <PasswordChangeForm />
                </Card>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
