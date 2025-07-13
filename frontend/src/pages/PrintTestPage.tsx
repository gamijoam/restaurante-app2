import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import PrintTestComponent from '../components/PrintTestComponent';
import PrintingHealthMonitor from '../components/PrintingHealthMonitor';
import WebSocketStatusComponent from '../components/WebSocketStatusComponent';

const PrintTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧪 Prueba del Sistema de Impresión
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta página te permite probar el sistema de impresión sin afectar las comandas reales.
          Si las pruebas funcionan sin bloquearse, el sistema está funcionando correctamente.
        </Alert>

        <WebSocketStatusComponent />
        
        <PrintTestComponent />
        
        {/* Monitor de salud siempre visible */}
        <PrintingHealthMonitor />
      </Box>
    </Container>
  );
};

export default PrintTestPage; 