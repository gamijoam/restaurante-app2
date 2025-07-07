import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import ConfiguracionPage from './ConfiguracionPage';
import TicketTemplatesPage from './TicketTemplatesPage';
import PrinterSettingsPage from './PrinterSettingsPage';

const ConfiguracionGeneralPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Impuesto" />
          <Tab label="Plantillas de Tickets" />
          <Tab label="Impresora" />
        </Tabs>
      </Paper>
      <Box>
        {tab === 0 && <ConfiguracionPage />}
        {tab === 1 && <TicketTemplatesPage />}
        {tab === 2 && <PrinterSettingsPage />}
      </Box>
    </Box>
  );
};

export default ConfiguracionGeneralPage; 