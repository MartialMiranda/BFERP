'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Badge, IconButton, Menu, MenuItem, Typography, Divider, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import { selectNotifications, removeNotification, clearNotifications } from '../../store/slices/uiSlice';
import { AppDispatch } from '../../store';

/**
 * Notifications menu component
 * Shows notification count and displays notifications in a dropdown
 */
const NotificationsMenu = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  /**
   * Handle menu open
   */
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  /**
   * Handle menu close
   */
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  /**
   * Handle notification removal
   */
  const handleRemoveNotification = (id: string) => {
    dispatch(removeNotification(id));
  };
  
  /**
   * Handle clearing all notifications
   */
  const handleClearAll = () => {
    dispatch(clearNotifications());
    handleClose();
  };
  
  /**
   * Get color class based on notification severity
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200';
      case 'error':
        return 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200';
      case 'warning':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200';
      case 'info':
      default:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200';
    }
  };
  
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={handleOpen}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: 'max-w-md w-80',
          sx: {
            maxHeight: 400,
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box className="p-2 flex justify-between items-center">
          <Typography variant="subtitle1" className="font-semibold">
            Notificaciones
          </Typography>
          {notifications.length > 0 && (
            <Typography 
              variant="body2" 
              className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
              onClick={handleClearAll}
            >
              Limpiar todo
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" className="text-center py-4 text-gray-500 w-full">
              No hay notificaciones
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} className="block p-0">
              <Box className="flex items-start justify-between p-3 w-full">
                <Box className="flex-grow">
                  <Box className={`inline-block px-2 py-0.5 rounded text-xs mb-1 ${getSeverityColor(notification.severity)}`}>
                    {notification.severity === 'success' && 'Éxito'}
                    {notification.severity === 'error' && 'Error'}
                    {notification.severity === 'warning' && 'Advertencia'}
                    {notification.severity === 'info' && 'Información'}
                  </Box>
                  <Typography variant="body2">{notification.message}</Typography>
                </Box>
                <IconButton 
                  size="small" 
                  aria-label="delete" 
                  onClick={() => handleRemoveNotification(notification.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Divider />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationsMenu;
