import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Typography,
  Button,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  Refresh,
  Print,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useNotification } from '../hooks/useNotification';

const PrintingHealthMonitor: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [lastPrintTime, setLastPrintTime] = useState<Date | null>(null);
  const [printCount, setPrintCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Verificar estado del WebSocket
  useEffect(() => {
    const checkWebSocketStatus = () => {
      try {
        // Verificar si hay un WebSocket activo
        const hasWebSocket = (window as any).stompClient;
        setIsConnected(!!hasWebSocket);
      } catch (error) {
        console.warn('Error verificando WebSocket:', error);
        setIsConnected(false);
      }
    };

    // Verificar inmediatamente
    checkWebSocketStatus();

    // Verificar cada 15 segundos (optimizado de 5s)
    const interval = setInterval(checkWebSocketStatus, 15000);

    return () => clearInterval(interval);
  }, []);

  // Escuchar eventos de impresión
  useEffect(() => {
    const handlePrintEvent = () => {
      setLastPrintTime(new Date());
      setPrintCount(prev => prev + 1);
    };

    window.addEventListener('print-completed', handlePrintEvent);
    
    return () => {
      window.removeEventListener('print-completed', handlePrintEvent);
    };
  }, []);

  const handleReconnect = () => {
    try {
      // Simular reconexión
      showSuccess('Reconexión iniciada', 'Intentando reconectar al sistema de impresión...');
      
      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showError('Error de reconexión', 'No se pudo iniciar la reconexión');
    }
  };

  const getStatusColor = () => {
    if (isConnected) return 'success';
    return 'error';
  };

  const getStatusIcon = () => {
    if (isConnected) return <Wifi />;
    return <WifiOff />;
  };

  const getStatusText = () => {
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      {/* Chip de estado principal */}
      <Chip
        icon={getStatusIcon()}
        label={getStatusText()}
        color={getStatusColor()}
        onClick={() => setShowDetails(!showDetails)}
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8
          }
        }}
      />

      {/* Panel de detalles */}
      <Collapse in={showDetails}>
        <Box sx={{ 
          mt: 1, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1, 
          boxShadow: 3,
          minWidth: 300,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Estado del Sistema de Impresión
          </Typography>

          {/* Estado de conexión */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {isConnected ? (
              <CheckCircle color="success" sx={{ mr: 1 }} />
            ) : (
              <Error color="error" sx={{ mr: 1 }} />
            )}
            <Typography variant="body2">
              WebSocket: {isConnected ? 'Conectado' : 'Desconectado'}
            </Typography>
          </Box>

          {/* Estadísticas de impresión */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Impresiones realizadas: {printCount}
            </Typography>
            {lastPrintTime && (
              <Typography variant="body2" color="text.secondary">
                Última impresión: {lastPrintTime.toLocaleTimeString()}
              </Typography>
            )}
          </Box>

          {/* Botón de reconexión */}
          {!isConnected && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              El sistema de impresión está desconectado. 
              Las impresiones pueden fallar.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReconnect}
              disabled={isConnected}
            >
              Reconectar
            </Button>
            
            <Tooltip title="Verificar impresoras">
              <IconButton size="small">
                <Print />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Información adicional */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            El sistema se reconecta automáticamente si hay problemas.
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PrintingHealthMonitor; 