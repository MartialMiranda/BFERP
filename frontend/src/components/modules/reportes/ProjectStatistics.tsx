'use client';

import { Paper, Typography, Box, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProjectStats } from '@/services/reportService';

interface ProjectStatisticsProps {
  data: ProjectStats | null;
}

const COLORS = ['#2196f3', '#4caf50', '#f44336'];

const ProjectStatistics = ({ data }: ProjectStatisticsProps) => {
  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 3, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  const chartData = [
    { name: 'Activos', value: data.activo, color: COLORS[0] },
    { name: 'Completados', value: data.completado, color: COLORS[1] },
    { name: 'Cancelados', value: data.cancelado, color: COLORS[2] }
  ].filter(item => item.value > 0);

  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: '300px' }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Estadísticas de Proyectos
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Proyectos Totales: <strong>{data.total}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Activos: <strong>{data.activo}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completados: <strong>{data.completado}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cancelados: <strong>{data.cancelado}</strong>
        </Typography>
      </Box>

      {chartData.length > 0 ? (
        <Box sx={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} proyectos`, 'Cantidad']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
          <Typography variant="body2" color="text.secondary">
            No hay datos suficientes para mostrar el gráfico
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProjectStatistics;
