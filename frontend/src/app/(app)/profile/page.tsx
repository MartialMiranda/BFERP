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
  Avatar, 
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Work as WorkIcon
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      className="py-4"
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * User profile page
 */
export default function ProfilePage() {
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Typography>Cargando perfil...</Typography>
      </Container>
    );
  }

  // Get initials from user name for avatar
  const initials = user.nombre
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-10">
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar 
              className="w-24 h-24 text-3xl bg-primary-600"
              alt={user.nombre}
            >
              {initials}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" className="font-bold mb-1">
              {user.nombre}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user.email}
            </Typography>
            <Box className="mt-2 flex space-x-2">
              <Typography 
                variant="caption" 
                className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {user.rol === 'admin' 
                  ? 'Administrador' 
                  : user.rol === 'gestor' 
                    ? 'Gestor de Proyectos' 
                    : 'Usuario'}
              </Typography>
              {user.tiene_2fa && (
                <Typography 
                  variant="caption" 
                  className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                >
                  2FA Activo
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper className="p-4">
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Profile tabs"
              className="border-r"
            >
              <Tab 
                label={
                  <Box className="flex items-center text-left py-2">
                    <PersonIcon className="mr-3" />
                    <Box>
                      <Typography className="font-medium">Perfil</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Información Personal
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="profile-tab-0"
              />
              <Tab 
                label={
                  <Box className="flex items-center text-left py-2">
                    <SecurityIcon className="mr-3" />
                    <Box>
                      <Typography className="font-medium">Seguridad</Typography>
                      <Typography variant="caption" color="textSecondary">
                        2FA, Contraseña
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="profile-tab-1"
              />
              <Tab 
                label={
                  <Box className="flex items-center text-left py-2">
                    <NotificationsIcon className="mr-3" />
                    <Box>
                      <Typography className="font-medium">Notificaciones</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Preferencias
                      </Typography>
                    </Box>
                  </Box>
                } 
                id="profile-tab-2"
              />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper className="p-6">
            <TabPanel value={tabValue} index={0}>
              <Box className="mb-6">
                <Typography variant="h5" component="h2" className="font-semibold mb-4">
                  Información Personal
                </Typography>
                <Divider className="mb-6" />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Nombre Completo" 
                      secondary={user.nombre} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Correo Electrónico" 
                      secondary={user.email} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Rol" 
                      secondary={
                        user.rol === 'admin' 
                          ? 'Administrador' 
                          : user.rol === 'gestor' 
                            ? 'Gestor de Proyectos' 
                            : 'Usuario'
                      } 
                    />
                  </ListItem>
                </List>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box className="mb-6">
                <Typography variant="h5" component="h2" className="font-semibold mb-4">
                  Configuración de Seguridad
                </Typography>
                <Divider className="mb-6" />
                <TwoFactorSettings />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box className="mb-6">
                <Typography variant="h5" component="h2" className="font-semibold mb-4">
                  Preferencias de Notificaciones
                </Typography>
                <Divider className="mb-6" />
                <Card className="p-6">
                  <Typography variant="body1">
                    Las preferencias de notificaciones estarán disponibles próximamente.
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
