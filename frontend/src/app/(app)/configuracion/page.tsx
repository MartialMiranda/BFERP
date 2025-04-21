'use client';

import { useState } from 'react';
import { Container, Grid, Box, Paper, Typography, Tabs, Tab, Divider } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import UserSettingsForm from '@/components/modules/configuracion/UserSettingsForm';
import NotificationSettings from '@/components/modules/configuracion/NotificationSettings';
import AppearanceSettings from '@/components/modules/configuracion/AppearanceSettings';
import SystemInformation from '@/components/modules/configuracion/SystemInformation';

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
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ConfiguracionPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Configuración" 
        subtitle="Personaliza tu experiencia en el sistema ERP" 
      />

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="configuración tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Perfil" id="config-tab-0" aria-controls="config-tabpanel-0" />
            <Tab label="Notificaciones" id="config-tab-1" aria-controls="config-tabpanel-1" />
            <Tab label="Apariencia" id="config-tab-2" aria-controls="config-tabpanel-2" />
            <Tab label="Sistema" id="config-tab-3" aria-controls="config-tabpanel-3" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UserSettingsForm />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <NotificationSettings />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <AppearanceSettings />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <SystemInformation />
        </TabPanel>
      </Paper>
    </Container>
  );
}
