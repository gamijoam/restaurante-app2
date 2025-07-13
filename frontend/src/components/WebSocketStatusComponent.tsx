import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Chip,
  Button
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  Refresh,
  CheckCircle,
  Error,
  Info,
  Warning
} from '@mui/icons-material';
import { useWebSocket } from '../context/WebSocketContextProduction';

const WebSocketStatusComponent: React.FC = () => {
  const { isConnected, reconnect } = useWebSocket();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Verificar estado del WebSocket
  useEffect(() => {
    const checkWebSocketStatus = () => {
      setLastCheck(new Date());
      if (!isConnected) {
        setConnectionAttempts(prev => prev + 1);
      } else {
        setConnectionAttempts(0);
      }
    };

    // Verificar cada 15 segundos (optimizado de 5s)
    const interval = setInterval(checkWebSocketStatus, 15000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleReconnect = () => {
    console.log('🔄 Reconexión manual iniciada desde componente...');
    reconnect();
    setConnectionAttempts(0);
  };

  const getStatusMessage = () => {
    if (isConnected) {
      return 'El WebSocket está conectado y funcionando correctamente.';
    } else if (connectionAttempts > 3) {
      return 'El WebSocket está desconectado después de múltiples intentos. La impresión puede no funcionar.';
    } else {
      return 'El WebSocket está desconectado. Intentando reconectar automáticamente...';
    }
  };

  const getSeverity = () => {
    if (isConnected) return 'success';
    if (connectionAttempts > 3) return 'error';
    return 'warning';
  };

  const getIcon = () => {
    if (isConnected) return <CheckCircle />;
    if (connectionAttempts > 3) return <Error />;
    return <Warning />;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6">
          🔧 Estado del WebSocket
        </Typography>
        <Chip
          icon={isConnected ? <Wifi /> : <WifiOff />}
          label={isConnected ? 'Conectado' : 'Desconectado'}
          color={isConnected ? 'success' : 'error'}
          size="small"
        />
        {!isConnected && connectionAttempts > 0 && (
          <Chip
            label={`${connectionAttempts} intentos`}
            color="warning"
            size="small"
          />
        )}
      </Box>

      <Alert 
        severity={getSeverity()}
        icon={getIcon()}
        sx={{ mb: 2 }}
        action={
          !isConnected && (
            <Button
              color="inherit"
              size="small"
              onClick={handleReconnect}
              startIcon={<Refresh />}
            >
              Reconectar
            </Button>
          )
        }
      >
        <Typography variant="body2">
          {getStatusMessage()}
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Info fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          Última verificación: {lastCheck.toLocaleTimeString()}
        </Typography>
      </Box>

      {!isConnected && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Impacto en la aplicación:</strong>
            <br />
            • La impresión puede no funcionar correctamente
            <br />
            • Las notificaciones en tiempo real pueden estar limitadas
            <br />
            • El resto de la aplicación seguirá funcionando normalmente
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Para verificar el estado:</strong>
          <br />
          1. Abre la consola del navegador (F12)
          <br />
          2. Busca mensajes que empiecen con 🔄, ✅, o ❌
          <br />
          3. Si ves "WebSocket conectado", el sistema está funcionando
        </Typography>
      </Box>
    </Paper>
  );
};

export default WebSocketStatusComponent; 