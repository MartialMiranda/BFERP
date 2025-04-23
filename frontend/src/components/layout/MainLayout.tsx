'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  AppBar, 
  Box, 
  Drawer, 
  IconButton, 
  Toolbar, 
  Typography, 
  useMediaQuery, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon,
  ListItemText,
  Divider, 
  useTheme as useMuiTheme, 
  alpha,
  Tooltip,
  Badge} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon, 
  Logout as LogoutIcon, 
  Person as PersonIcon, 
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import { logout, selectUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import Sidebar from './Sidebar';

// Sidebar width in pixels
const drawerWidth = 260;
const miniDrawerWidth = 64;

/**
 * Main Layout component that wraps the application pages
 * Contains the top app bar, navigation drawer, and main content area
 */
const MainLayout = ({ children }: { children: ReactNode }) => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const muiTheme = useMuiTheme();
  const { theme, setTheme } = useTheme();
  const isSmallScreen = useMediaQuery('(max-width:1024px)');
  
  // State for controlling the drawer open/close
  const [open, setOpen] = useState(!isSmallScreen);
  
  // State for mini sidebar
  const [mini, setMini] = useState(false);

  // State for user menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Handle drawer toggle for mobile and desktop
  const handleDrawerToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // Handle mini sidebar toggle
  const handleMiniToggle = () => setMini((prev) => !prev);
  
  // Close drawer on small screens when window resizes
  useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);
  
  // Handle user profile menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user profile menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle user logout
  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        router.push('/login');
      })
      .catch((error) => {
        console.error('Error during logout:', error);
        router.push('/login');
      });
  };
  
  // Handle navigation to profile page
  const handleNavigateToProfile = () => {
    router.push('/profile');
    handleMenuClose();
  };
  
  // Handle navigation to security page
  const handleNavigateToSecurity = () => {
    router.push('/security');
    handleMenuClose();
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
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box className="flex h-screen bg-gray-50 dark:bg-gray-900" sx={{ width: '100%', minHeight: '100vh', background: 'none', margin: 0, p: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Sidebar drawer (persistent on large screens, temporary on small screens) */}
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: mini ? miniDrawerWidth : drawerWidth,
          flexShrink: 0,
          zIndex: muiTheme.zIndex.appBar - 1, // Make sure drawer is below app bar
          '& .MuiDrawer-paper': {
            width: mini ? miniDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            overflowX: 'hidden',
            transition: muiTheme.transitions.create('width', {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.leavingScreen,
            }),
          },
        }}
      >
        <Sidebar onClose={handleDrawerToggle} mini={mini} onMiniToggle={handleMiniToggle} />
      </Drawer>
      
      {/* Main content */}
      <Box 
        component="main" 
        className="flex flex-col flex-grow"
        sx={{
          width: '100%',
          ml: 0,
          minHeight: '100vh',
          p: 0,
          background: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* App bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            width: '100%', // Fuerza el header a ocupar todo el ancho visible
            ml: 0,
            left: 0,
            backgroundColor: theme === 'dark' 
              ? alpha(muiTheme.palette.primary.dark, 0.9) 
              : alpha(muiTheme.palette.primary.light, 0.9),
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            boxSizing: 'border-box',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Left section: Menu toggle and logo */}
            <Box className="flex items-center">
              <IconButton
                color="inherit"
                aria-label="toggle drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: open && !isSmallScreen ? 'none' : 'flex' }}
              >
                <MenuIcon />
              </IconButton>
              
              {/* Only show logo when sidebar is closed or on small screen */}
              {(!open || isSmallScreen) && (
                <Box className="flex items-center">
                  <BusinessIcon sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" component="div" className="font-bold">
                    Sistema ERP
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Right section: Notifications, Theme toggle, and User profile */}
            <Box className="flex items-center space-x-2">
              {/* Theme toggle */}
              <Tooltip title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleTheme}
                  sx={{
                    backgroundColor: alpha(muiTheme.palette.primary.contrastText, 0.0),
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: alpha(muiTheme.palette.primary.contrastText, 0.2),
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {/* Notifications */}
              <Tooltip title="Notificaciones">
                <IconButton 
                  color="inherit"
                  sx={{
                    backgroundColor: alpha(muiTheme.palette.primary.contrastText, 0.0),
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: alpha(muiTheme.palette.primary.contrastText, 0.2),
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              {/* User profile menu */}
              <Tooltip title="Mi perfil">
                <IconButton
                  onClick={handleMenuOpen}
                  aria-controls={menuOpen ? 'user-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                  sx={{
                    backgroundColor: alpha(muiTheme.palette.primary.contrastText, 0.0),
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: alpha(muiTheme.palette.primary.contrastText, 0.2),
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <Avatar
                    sx={{ 
                      width: 34, 
                      height: 34, 
                      bgcolor: muiTheme.palette.primary.main,
                      fontSize: '0.9rem' 
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              {/* User menu */}
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    elevation: 2,
                    sx: {
                      mt: 1,
                      minWidth: 180,
                      borderRadius: 2,
                      overflow: 'visible',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
              >
                <Box sx={{ pt: 1, px: 2, pb: 1 }}>
                  <Typography variant="subtitle1" className="font-semibold">
                    {user?.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleNavigateToProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mi Perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleNavigateToSecurity}>
                  <ListItemIcon>
                    <SecurityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Seguridad</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Cerrar Sesión</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Page content */}
        <Box 
          className="flex-grow overflow-auto"
          sx={{
            backgroundColor: theme === 'dark' ? 'background.default' : 'background.default',
            width: '100%',
            minHeight: '100vh',
            borderRadius: 0,
            boxShadow: 'none',
            p: 0,
            m: 0,
            boxSizing: 'border-box',
            overflowX: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
