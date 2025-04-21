'use client';

import { Typography, Box, Button, Breadcrumbs, Link } from '@mui/material';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
}

/**
 * Componente de encabezado de página reutilizable con título, subtítulo opcional,
 * migas de pan y botón de acción opcional.
 */
const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  const pathname = usePathname();
  
  // Generar migas de pan basadas en la ruta actual
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    // No mostrar migas de pan si estamos en una ruta principal
    if (paths.length <= 1) return null;
    
    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={NextLink} href="/" color="inherit">
          Inicio
        </Link>
        
        {paths.map((path, index) => {
          // Ignorar el segmento (app) que es parte de la estructura de carpetas de Next.js
          if (path === '(app)') return null;
          
          const routePath = `/${paths.slice(0, index + 1).join('/')}`;
          const isLast = index === paths.length - 1;
          
          // Convertir el nombre de la ruta a un formato más legible
          const readablePath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          
          return isLast ? (
            <Typography key={path} color="text.primary">
              {readablePath}
            </Typography>
          ) : (
            <Link 
              component={NextLink} 
              key={path} 
              href={routePath}
              color="inherit"
            >
              {readablePath}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      {generateBreadcrumbs()}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          action.href ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={action.icon}
              component={NextLink}
              href={action.href}
            >
              {action.label}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
