'use client';

import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Toolbar, 
  Typography, 
  useTheme,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme as useNextTheme } from 'next-themes';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import GroupsIcon from '@mui/icons-material/Groups';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { selectUser } from '../../store/slices/authSlice';

interface SidebarProps {
  onClose: () => void;
  mini?: boolean;
  onMiniToggle?: () => void;
}

/**
 * Sidebar component for main navigation
 * Shows different navigation options based on user role
 */
const Sidebar = ({ onClose, mini = false, onMiniToggle }: SidebarProps) => {
  const user = useSelector(selectUser);
  const router = useRouter();
  const pathname = usePathname();
  const muiTheme = useTheme();
  const { theme } = useNextTheme();
  
  // Define navigation items with access control based on user role
  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'gestor', 'usuario'],
    },
    {
      text: 'Proyectos',
      icon: <FolderIcon />,
      path: '/proyectos',
      roles: ['admin', 'gestor', 'usuario'],
    },
    {
      text: 'Tareas',
      icon: <AssignmentIcon />,
      path: '/tareas',
      roles: ['admin', 'gestor', 'usuario'],
    },
    {
      text: 'Equipos',
      icon: <GroupsIcon />,
      path: '/equipos',
      roles: ['admin', 'gestor'],
    },
    {
      text: 'Kanban',
      icon: <ViewKanbanIcon />,
      path: '/kanban',
      roles: ['admin', 'gestor', 'usuario'],
    },
    {
      text: 'Reportes',
      icon: <AssessmentIcon />,
      path: '/reportes',
      roles: ['admin', 'gestor'],
    },
    {
      text: 'Seguridad',
      icon: <SecurityIcon />,
      path: '/security',
      roles: ['admin', 'gestor', 'usuario'],
    },
    {
      text: 'Configuración',
      icon: <SettingsIcon />,
      path: '/configuracion',
      roles: ['admin'],
    },
  ];
  
  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.rol)
  );
  
  /**
   * Handle navigation item click
   * @param path - Path to navigate to
   */
  const handleNavigation = (path: string) => {
    router.push(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.nombre) return '?';
    
    return user.nombre
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Get user role display text
  const getUserRoleText = () => {
    if (!user) return '';
    
    switch(user.rol) {
      case 'admin':
        return 'Administrador';
      case 'gestor':
        return 'Gestor de Proyectos';
      default:
        return 'Usuario';
    }
  };
  
  return (
    <Box 
      className="h-full flex flex-col"
      sx={{
        color: theme === 'dark' ? 'text.primary' : 'inherit',
        width: mini ? 64 : 260,
        transition: muiTheme.transitions.create('width', {
          easing: muiTheme.transitions.easing.sharp,
          duration: muiTheme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
      }}
    >
      {/* Logo and brand with mini toggle button */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: mini ? 'center' : 'space-between',
          padding: '8px 16px',
          minHeight: { xs: 64, sm: 70 },
          backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
        }}
      >
        <Box className="flex items-center" sx={{ justifyContent: mini ? 'center' : 'flex-start', width: '100%' }}>
          <BusinessIcon 
            color="primary" 
            sx={{ fontSize: 28, mr: mini ? 0 : 1 }} 
          />
          {!mini && (
            <Typography 
              variant="h6" 
              component="h1" 
              className="font-bold"
              sx={{ color: muiTheme.palette.primary.main }}
            >
              Sistema ERP
            </Typography>
          )}
        </Box>
        {onMiniToggle && (
          <IconButton
            onClick={onMiniToggle}
            sx={{ ml: 1, color: muiTheme.palette.primary.main }}
          >
            <ChevronLeftIcon style={{ transform: mini ? 'rotate(180deg)' : 'none' }} />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      {/* User info */}
      {!mini && (
        <Box 
          className="p-4 flex items-start space-x-3" 
          sx={{ 
            backgroundColor: theme === 'dark' ? alpha(muiTheme.palette.primary.dark, 0.1) : alpha(muiTheme.palette.primary.light, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Avatar
            sx={{ 
              bgcolor: muiTheme.palette.primary.main,
              width: 42,
              height: 42,
            }}
          >
            {getUserInitials()}
          </Avatar>
          <Box className="overflow-hidden">
            <Typography 
              variant="subtitle1" 
              className="font-medium" 
              noWrap
              sx={{ maxWidth: '100%', display: 'block' }}
            >
              {user?.nombre}
            </Typography>
            <Typography 
              variant="body2" 
              className="text-gray-500 dark:text-gray-400" 
              noWrap
              sx={{ maxWidth: '100%', display: 'block' }}
            >
              {user?.email}
            </Typography>
            <Box className="flex mt-1 space-x-1">
              <Typography 
                variant="caption" 
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
                  color: muiTheme.palette.primary.main,
                  fontWeight: 500,
                }}
              >
                {getUserRoleText()}
              </Typography>
              {user?.tiene_2fa && (
                <Tooltip title="Autenticación de dos factores activa">
                  <Typography 
                    variant="caption" 
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      backgroundColor: alpha(muiTheme.palette.success.main, 0.1),
                      color: muiTheme.palette.success.main,
                      fontWeight: 500,
                    }}
                  >
                    <VerifiedUserIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    2FA
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      )}
      {/* Navigation items */}
      <List 
        component="nav" 
        className="flex-grow py-2"
        sx={{
          '& .MuiListItemButton-root': {
            borderRadius: 1.5,
            mx: 1,
            my: 0.5,
            justifyContent: mini ? 'center' : 'flex-start',
            px: mini ? 1 : 2,
          },
        }}
      >
        {filteredItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: isActive ? muiTheme.palette.primary.main : 'text.primary',
                  backgroundColor: isActive 
                    ? alpha(muiTheme.palette.primary.main, theme === 'dark' ? 0.15 : 0.08)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? alpha(muiTheme.palette.primary.main, theme === 'dark' ? 0.2 : 0.12)
                      : alpha(muiTheme.palette.primary.main, theme === 'dark' ? 0.08 : 0.04),
                  },
                  position: 'relative',
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: 3,
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: muiTheme.palette.primary.main,
                  } : {},
                  pl: mini ? 0 : (isActive ? 3 : 2),
                  justifyContent: mini ? 'center' : 'flex-start',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? muiTheme.palette.primary.main : 'inherit',
                    minWidth: 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!mini && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      variant: 'body2',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {/* Footer */}
      {!mini && (
        <Box 
          className="p-3 text-center" 
          sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.04),
          }}
        >
          <Typography 
            variant="caption" 
            className="text-gray-500 dark:text-gray-400"
            sx={{ opacity: 0.8 }}
          >
            2025 ERP System v1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
