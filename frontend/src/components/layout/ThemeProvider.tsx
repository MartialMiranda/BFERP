'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Provider component that encapsulates theme logic
 * Manages both Material UI and Tailwind themes
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mounted, setMounted] = useState(false);

  // Define light theme
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#4caf50', // Verde principal
        light: '#a5d6a7', // Verde medio pastel
        dark: '#3d8b40', // Verde oscuro
      },
      secondary: {
        main: '#81c784', // Verde secundario más claro
        light: '#e8f5e9',
        dark: '#519657',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#66bb6a',
      },
      success: {
        main: '#4caf50',
      },
      background: {
        default: '#f8fbf8', // Fondo muy ligeramente verdoso
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '0.375rem',
          },
          containedPrimary: {
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#3d8b40',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4caf50',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4caf50',
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: '#4caf50',
            '&:hover': {
              color: '#3d8b40',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: '#e0e0e0',
          },
        },
      },
    },
  });

  // Define dark theme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#4caf50', // Verde principal
        light: '#a5d6a7', // Verde medio pastel
        dark: '#3d8b40', // Verde oscuro
      },
      secondary: {
        main: '#81c784', // Verde secundario más claro
        light: '#e8f5e9', 
        dark: '#519657',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#66bb6a',
      },
      success: {
        main: '#4caf50',
      },
      background: {
        default: '#1a261a', // Fondo oscuro verdoso
        paper: '#223322', // Panel oscuro verdoso
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '0.375rem',
          },
        },
      },
    },
  });

  // Hydration fix - prevent theme mismatch during SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeListener>
        {(theme) => (
          <MuiThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
            <CssBaseline />
            {children}
          </MuiThemeProvider>
        )}
      </ThemeListener>
    </NextThemesProvider>
  );
};

// Theme listener component to bridge next-themes with Material UI
function ThemeListener({ children }: { children: (theme: string) => ReactNode }) {
  const [theme, setTheme] = useState<string>('light');
  
  useEffect(() => {
    // Check for dark mode preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDarkMode ? 'dark' : 'light');
    
    // Listen for theme changes from next-themes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  return <>{children(theme)}</>;
}
