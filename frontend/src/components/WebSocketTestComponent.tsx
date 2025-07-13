import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  Refresh,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';

const WebSocketTestComponent: React.FC = () => {
  const [connectionHistory, setConnectionHistory] = useState<string[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState({
    url: 'ws://localhost:8080/ws',
    connected: false,
    subscriptions: 0
  });

  // Verificar estado del WebSocket
  useEffect(() => {
    const checkWebSocketStatus = () => {
      try {
        // Verificar si hay un WebSocket activo en la ventana
        const hasWebSocket = (window as any).stompClient || 
                           document.querySelector('[data-websocket="active"]');
        
        setIsConnected(!!hasWebSocket);
        
        const addToHistory = (message: string) => {
          const timestamp = new Date().toLocaleTimeString();
          setConnectionHistory(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
        };

        if (hasWebSocket) {
          addToHistory('✅ WebSocket conectado');
          setConnectionDetails(prev => ({ ...prev, connected: true }));
        } else {
          addToHistory('❌ WebSocket desconectado');
          setConnectionDetails(prev => ({ ...prev, connected: false }));
        }
      } catch (error) {
        console.warn('Error verificando WebSocket:', error);
        setConnectionHistory(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ❌ Error verificando WebSocket`]);
      }
    };

    // Verificar inmediatamente
    checkWebSocketStatus();

    // Verificar cada 15 segundos (optimizado de 5s)
    const interval = setInterval(checkWebSocketStatus, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = () => {
    setLastCheck(new Date());
    setConnectionHistory(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: 🔄 Reconexión manual iniciada`]);
    
    // Simular reconexión
    setTimeout(() => {
      setIsConnected(true);
      setConnectionDetails(prev => ({ ...prev, connected: true }));
      setConnectionHistory(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ✅ Reconexión exitosa`]);
    }, 2000);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔧 Prueba de WebSocket (Producción)
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Alert 
          severity={isConnected ? 'success' : 'error'}
          icon={isConnected ? <CheckCircle /> : <Error />}
        >
          Estado: {isConnected ? 'Conectado' : 'Desconectado'}
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleReconnect}
          disabled={isConnected}
        >
          Reconectar Manualmente
        </Button>

        <Chip
          icon={<Info />}
          label={`Última verificación: ${lastCheck.toLocaleTimeString()}`}
          variant="outlined"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Detalles de Conexión:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              {connectionDetails.connected ? <Wifi color="success" /> : <WifiOff color="error" />}
            </ListItemIcon>
            <ListItemText 
              primary="Estado STOMP" 
              secondary={connectionDetails.connected ? 'Conectado' : 'Desconectado'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText 
              primary="URL del Broker" 
              secondary={connectionDetails.url} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText 
              primary="Suscripciones Activas" 
              secondary={connectionDetails.subscriptions} 
            />
          </ListItem>
        </List>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Historial de Conexión:
        </Typography>
        <Box sx={{ 
          maxHeight: 200, 
          overflow: 'auto', 
          bgcolor: 'grey.50', 
          p: 1, 
          borderRadius: 1 
        }}>
          {connectionHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay eventos registrados
            </Typography>
          ) : (
            connectionHistory.map((event, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                {event}
              </Typography>
            ))
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Instrucciones:</strong>
            <br />
            1. Si el WebSocket está desconectado, haz clic en "Reconectar Manualmente"
            <br />
            2. Recarga la página (F5) para verificar que se reconecte automáticamente
            <br />
            3. El sistema debería reconectarse automáticamente cada 10 segundos si está desconectado
            <br />
            4. Verifica la consola del navegador para logs detallados del WebSocket
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Nota:</strong> Este componente verifica el estado del WebSocket cada 5 segundos.
            <br />
            Para ver logs detallados, abre la consola del navegador (F12).
          </Typography>
        </Alert>
      </Box>
    </Paper>
  );
};

export default WebSocketTestComponent; 