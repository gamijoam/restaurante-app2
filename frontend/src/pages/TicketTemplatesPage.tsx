import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import TicketEditorPage from './TicketEditorPage';
import TicketTemplateManager from '../components/TicketTemplateManager';
import type { TicketTemplateDTO } from '../services/ticketTemplateService';

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
      id={`ticket-templates-tabpanel-${index}`}
      aria-labelledby={`ticket-templates-tab-${index}`}
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

const TicketTemplatesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editingTemplate, setEditingTemplate] = useState<TicketTemplateDTO | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditTemplate = (template: TicketTemplateDTO) => {
    setEditingTemplate(template);
    setTabValue(0); // Cambiar a la pestaña del editor
  };

  const handleTemplateSaved = () => {
    setEditingTemplate(null);
    // Opcional: cambiar a la pestaña de gestión
    // setTabValue(1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="ticket templates tabs"
            variant="fullWidth"
          >
            <Tab label="Editor de Plantillas" />
            <Tab label="Gestionar Plantillas" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TicketEditorPage 
            initialTemplate={editingTemplate}
            onTemplateSaved={handleTemplateSaved}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TicketTemplateManager onEditTemplate={handleEditTemplate} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TicketTemplatesPage; 