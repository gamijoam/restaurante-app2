import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { usePrintService } from '../services/printService';
import { validatePrintData } from '../services/printService';
import { useWebSocket } from '../context/WebSocketContextProduction';

const PrintTestComponent: React.FC = () => {
  const { sendPrintJob } = usePrintService();
  const { isConnected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [ticketType, setTicketType] = useState<'COCINA' | 'CAJA'>('COCINA');
  const [mesa, setMesa] = useState('Mesa 1');
  const [producto, setProducto] = useState('Producto de Prueba');

  const testPrintJob = {
    printerType: 'THERMAL',
    printerTarget: 'TEST_PRINTER',
    ticketType: ticketType,
    ticketData: {
      nombreMesa: mesa,
      comandaId: 'TEST-' + Date.now(),
      fechaHora: new Date().toISOString(),
      items: [
        {
          nombreProducto: producto,
          cantidad: 1,
          precioTotal: 10.00,
          notas: 'Nota de prueba'
        }
      ],
      total: 10.00
    }
  };

  const handleTestPrint = async () => {
    if (!isConnected) {
      setResult('❌ Error: Sistema de impresión no conectado');
      return;
    }

    if (!validatePrintData(testPrintJob.ticketData)) {
      setResult('❌ Error: Datos del ticket inválidos');
      return;
    }

    setIsLoading(true);
    setResult('🔄 Enviando trabajo de impresión...');

    try {
      const success = await sendPrintJob(testPrintJob);
      
      if (success) {
        setResult('✅ Trabajo de impresión enviado exitosamente');
      } else {
        setResult('❌ Error al enviar trabajo de impresión');
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        🧪 Prueba del Sistema de Impresión
      </Typography>

      <Alert severity={isConnected ? 'success' : 'error'} sx={{ mb: 2 }}>
        Estado: {isConnected ? 'Conectado' : 'Desconectado'}
      </Alert>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Ticket</InputLabel>
          <Select
            value={ticketType}
            label="Tipo de Ticket"
            onChange={(e) => setTicketType(e.target.value as 'COCINA' | 'CAJA')}
          >
            <MenuItem value="COCINA">Cocina</MenuItem>
            <MenuItem value="CAJA">Caja</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Mesa"
          value={mesa}
          onChange={(e) => setMesa(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Producto"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleTestPrint}
        disabled={!isConnected || isLoading}
        fullWidth
        sx={{ mb: 2 }}
      >
        {isLoading ? '🔄 Enviando...' : '🖨️ Probar Impresión'}
      </Button>

      {result && (
        <Alert severity={result.includes('✅') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Esta prueba envía un trabajo de impresión de prueba al sistema.
        Si funciona sin bloquearse, el sistema está funcionando correctamente.
      </Typography>
    </Paper>
  );
};

export default PrintTestComponent; 