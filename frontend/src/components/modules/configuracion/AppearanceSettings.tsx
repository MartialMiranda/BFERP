'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  RadioGroup,
  Radio,
  Alert,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save, DarkMode, LightMode, FormatSize, Palette, Refresh } from '@mui/icons-material';

const themeColors = [
  { name: 'Default', primary: '#1976d2', secondary: '#9c27b0', mode: 'both' },
  { name: 'Emerald', primary: '#2e7d32', secondary: '#00796b', mode: 'both' },
  { name: 'Ruby', primary: '#d32f2f', secondary: '#c2185b', mode: 'both' },
  { name: 'Amber', primary: '#ff8f00', secondary: '#f57c00', mode: 'both' },
  { name: 'Indigo', primary: '#3f51b5', secondary: '#673ab7', mode: 'both' },
  { name: 'Graphite', primary: '#455a64', secondary: '#607d8b', mode: 'dark' },
  { name: 'Ocean', primary: '#0288d1', secondary: '#0097a7', mode: 'both' },
];

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme === 'dark' ? 'dark' : 'light');
  const [colorScheme, setColorScheme] = useState('Default');
  const [fontSize, setFontSize] = useState(16);
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
    setFontSize(newValue as number);
  };

  const handleSave = () => {
    // Aquí se guardarían los cambios en las preferencias del usuario
    console.log({
      theme: currentTheme,
      colorScheme,
      fontSize,
      compactMode,
      animationsEnabled
    });

    // Mostrar mensaje de éxito
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setCurrentTheme('light');
    setTheme('light');
    setColorScheme('Default');
    setFontSize(16);
    setCompactMode(false);
    setAnimationsEnabled(true);
  };

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {currentTheme === 'dark' ? (
                <DarkMode color="primary" sx={{ mr: 1 }} />
              ) : (
                <LightMode color="primary" sx={{ mr: 1 }} />
              )}
              <Typography variant="h6">Tema</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Elige entre el tema claro u oscuro para la interfaz de usuario.
            </Typography>
            
            <RadioGroup
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              row
            >
              <FormControlLabel 
                value="light" 
                control={<Radio />} 
                label="Claro" 
              />
              <FormControlLabel 
                value="dark" 
                control={<Radio />} 
                label="Oscuro" 
              />
              <FormControlLabel 
                value="system" 
                control={<Radio />} 
                label="Sistema" 
              />
            </RadioGroup>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Palette color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Esquema de color</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Selecciona un esquema de color para personalizar la apariencia de la aplicación.
            </Typography>
            
            <FormControl fullWidth size="small">
              <InputLabel id="color-scheme-label">Esquema de color</InputLabel>
              <Select
                labelId="color-scheme-label"
                value={colorScheme}
                label="Esquema de color"
                onChange={(e) => setColorScheme(e.target.value)}
              >
                {themeColors.map((color) => (
                  <MenuItem 
                    key={color.name} 
                    value={color.name}
                    disabled={currentTheme === 'dark' && color.mode === 'light'}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: color.primary,
                          mr: 1
                        }} 
                      />
                      {color.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
              {themeColors.slice(0, 5).map((color) => (
                <Box 
                  key={color.name}
                  onClick={() => setColorScheme(color.name)}
                  sx={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: '50%', 
                    bgcolor: color.primary,
                    cursor: 'pointer',
                    border: colorScheme === color.name ? '2px solid' : '1px solid',
                    borderColor: colorScheme === color.name ? 'primary.main' : 'divider'
                  }} 
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormatSize color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Tamaño de fuente</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Ajusta el tamaño de fuente para mejorar la legibilidad.
            </Typography>
            
            <Box sx={{ px: 2 }}>
              <Slider
                value={fontSize}
                onChange={handleFontSizeChange}
                aria-labelledby="font-size-slider"
                step={1}
                marks={[
                  { value: 12, label: 'Pequeño' },
                  { value: 16, label: 'Normal' },
                  { value: 20, label: 'Grande' }
                ]}
                min={12}
                max={20}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vista previa
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontSize: `${fontSize}px` }}>
                  Este es un ejemplo de texto con el tamaño de fuente seleccionado.
                </Typography>
              </Paper>
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Opciones adicionales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                />
              }
              label="Modo compacto"
            />
            <Typography variant="body2" color="text.secondary" paragraph>
              Reduce el espacio entre elementos para mostrar más contenido.
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
              }
              label="Animaciones"
            />
            <Typography variant="body2" color="text.secondary" paragraph>
              Habilita o deshabilita las animaciones de la interfaz.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        {saved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Preferencias de apariencia guardadas correctamente.
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Guardar preferencias
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
          >
            Restablecer valores predeterminados
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AppearanceSettings;
