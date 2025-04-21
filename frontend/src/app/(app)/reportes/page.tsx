'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Box, CircularProgress, Alert, Tab, Tabs } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import ProjectStatistics from '@/components/modules/reportes/ProjectStatistics';
import TaskStatistics from '@/components/modules/reportes/TaskStatistics';
import UserPerformance from '@/components/modules/reportes/UserPerformance';
import ActivityTimeline from '@/components/modules/reportes/ActivityTimeline';
import { reportService } from '@/services/reportService';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carga los datos necesarios para la pestaña activa
        if (activeTab === 0) {
          const [projectStats, taskStats] = await Promise.all([
            reportService.getProjectStats(),
            reportService.getTaskStats()
          ]);
          
          setStatsData({
            projectStats,
            taskStats
          });
        } else if (activeTab === 1) {
          const userPerformance = await reportService.getUserPerformance();
          setStatsData({
            ...statsData,
            userPerformance
          });
        } else if (activeTab === 2) {
          const recentActivity = await reportService.getRecentActivity();
          setStatsData({
            ...statsData,
            recentActivity
          });
        }
      } catch (err) {
        console.error('Error al cargar datos de reportes:', err);
        setError('No se pudieron cargar los datos de reportes. Por favor, inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <PageHeader title="Reportes y Estadísticas" />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="reportes tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Estadísticas Generales" {...a11yProps(0)} />
          <Tab label="Rendimiento del Equipo" {...a11yProps(1)} />
          <Tab label="Actividad Reciente" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ProjectStatistics data={statsData?.projectStats} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TaskStatistics data={statsData?.taskStats} />
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <UserPerformance data={statsData?.userPerformance || []} />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <ActivityTimeline data={statsData?.recentActivity || []} />
          </TabPanel>
        </>
      )}
    </Container>
  );
}
