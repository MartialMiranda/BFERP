'use client';

import { Paper, Typography, Box, Divider, Tabs, Tab } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';
import { TaskStats, PriorityStats } from '@/services/reportService';

interface TaskStatisticsProps {
  data: {
    estado: TaskStats;
    prioridad: PriorityStats;
  } | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-stats-tabpanel-${index}`}
      aria-labelledby={`task-stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const TaskStatistics = ({ data }: TaskStatisticsProps) => {
  const [tabValue, setTabValue] = useState(0);

  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 3, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  const { estado, prioridad } = data;

  const estadoData = [
    { name: 'Pendientes', value: estado.pendiente, color: '#ff9800' },
    { name: 'En Progreso', value: estado['en progreso'], color: '#2196f3' },
    { name: 'Completadas', value: estado.completada, color: '#4caf50' },
  ];

  const prioridadData = [
    { name: 'Alta', value: prioridad.alta, color: '#f44336' },
    { name: 'Media', value: prioridad.media, color: '#ff9800' },
    { name: 'Baja', value: prioridad.baja, color: '#4caf50' },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: '300px' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Estadísticas de Tareas
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tareas Totales: <strong>{estado.total}</strong>
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="task statistics tabs">
            <Tab label="Por Estado" />
            <Tab label="Por Prioridad" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {estadoData.some(item => item.value > 0) ? (
            <Box sx={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart
                  data={estadoData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} tareas`, 'Cantidad']} />
                  <Legend />
                  <Bar dataKey="value" name="Tareas" fill="#8884d8">
                    {estadoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
              <Typography variant="body2" color="text.secondary">
                No hay datos suficientes para mostrar el gráfico
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {prioridadData.some(item => item.value > 0) ? (
            <Box sx={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart
                  data={prioridadData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} tareas`, 'Cantidad']} />
                  <Legend />
                  <Bar dataKey="value" name="Tareas" fill="#8884d8">
                    {prioridadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
              <Typography variant="body2" color="text.secondary">
                No hay datos suficientes para mostrar el gráfico
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default TaskStatistics;
