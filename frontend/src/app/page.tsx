'use client';

import Image from "next/image";
import Link from "next/link";
import { Button, Typography, Card, CardContent, Container, Grid, Box, Paper } from "@mui/material";
import { AccountCircle, Business, Assignment, Groups, Dashboard } from "@mui/icons-material";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsAuthenticated } from '../store/slices/authSlice';

export default function Home() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 8
        }}
      >
        <Box sx={{ maxWidth: { xs: '100%', md: '50%' }, mb: { xs: 4, md: 0 } }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              background: 'linear-gradient(90deg, #1976d2 0%, #9c27b0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Sistema ERP
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Gestión integral de proyectos, tareas y equipos para su empresa
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              component={Link} 
              href="/login" 
              variant="contained" 
              size="large"
              startIcon={<AccountCircle />}
            >
              Iniciar Sesión
            </Button>
            <Button 
              component={Link} 
              href="/register" 
              variant="outlined" 
              size="large"
            >
              Registrarse
            </Button>
          </Box>
        </Box>
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            width: '45%',
            height: '350px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Reemplazamos la imagen con un icono de Material UI */}
          <Paper 
            elevation={4} 
            sx={{ 
              p: 5, 
              borderRadius: 2, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(120deg, #f0f0f0, #e0e0e0)'
            }}
          >
            <Dashboard sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" align="center">
              Panel de control intuitivo <br/> para gestionar su empresa
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Features Section */}
      <Typography 
        variant="h3" 
        component="h2" 
        align="center" 
        sx={{ mb: 6 }}
      >
        Características principales
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Gestión de Proyectos
              </Typography>
              <Typography>
                Administre todos sus proyectos de manera eficiente, asignando recursos, estableciendo plazos y controlando presupuestos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Seguimiento de Tareas
              </Typography>
              <Typography>
                Organice y priorice tareas, establezca plazos, asigne responsables y visualice el progreso en tiempo real.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Groups sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Colaboración en Equipo
              </Typography>
              <Typography>
                Mejore la comunicación entre equipos, comparta documentos y realice seguimiento en tiempo real de las actividades colaborativas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box component="footer" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {new Date().getFullYear()} Sistema ERP. Todos los derechos reservados.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Link href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="primary">Acerca de</Typography>
          </Link>
          <Link href="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="primary">Contacto</Typography>
          </Link>
          <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="primary">Privacidad</Typography>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
