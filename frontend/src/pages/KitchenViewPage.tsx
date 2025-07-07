import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Badge,
  AppBar,
  Toolbar,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  LinearProgress,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Kitchen,
  Restaurant,
  Timer,
  CheckCircle,
  AccessTime,
  LocalDining,
  Refresh,
  FilterList,
  ViewList,
  GridView,
  AttachMoney,
  TimerOutlined,
  Done,
  Schedule,
  PriorityHigh,
} from '@mui/icons-material';
import type { ComandaResponseDTO } from '../types';
import { getComandasPorMultiplesEstados, updateComandaEstado } from '../services/comandaService';
import { useWebSocket } from '../context/WebSocketContext';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

const KitchenViewPage: React.FC = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState<ComandaResponseDTO | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal'>('all');
  
    const { stompClient, isConnected } = useWebSocket();
  const { showError, showSuccess } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const fetchInitialComandas = useCallback(async () => {
    setLoading(true);
        try {
            const data = await getComandasPorMultiplesEstados(['EN_PROCESO']);
            if (Array.isArray(data)) {
                setComandas(data);
            }
        } catch (err) {
            console.error("Error al cargar comandas:", err);
            setError('Error al cargar las comandas iniciales.');
      showError('Error al cargar comandas', 'No se pudieron cargar las comandas en proceso');
        } finally {
            setLoading(false);
        }
  }, [showError]);

    useEffect(() => {
        if (isConnected && stompClient) {
            fetchInitialComandas();

            const subscription = stompClient.subscribe('/topic/cocina', (message) => {
                const comandaRecibida: ComandaResponseDTO = JSON.parse(message.body);
                setComandas(prevComandas => {
                    if (prevComandas.find(c => c.id === comandaRecibida.id)) {
            return prevComandas.map(c => c.id === comandaRecibida.id ? comandaRecibida : c);
                    }
                    return [comandaRecibida, ...prevComandas];
                });
        showSuccess('Nueva comanda', `Mesa ${comandaRecibida.numeroMesa} agregada a cocina`);
            });

            return () => {
                subscription.unsubscribe();
            };
        }
  }, [isConnected, stompClient, fetchInitialComandas, showSuccess]);

  const handleMarcarComoLista = async (comanda: ComandaResponseDTO) => {
    setSubmittingId(comanda.id);
    try {
      await updateComandaEstado(comanda.id, 'LISTA');
      setComandas(prevComandas => prevComandas.filter(c => c.id !== comanda.id));
      showSuccess('Comanda lista', `Mesa ${comanda.numeroMesa} marcada como lista`);
        } catch (err) {
      showError('Error al actualizar', 'No se pudo marcar la comanda como lista');
    } finally {
      setSubmittingId(null);
    }
  };

  const getTiempoEstimado = (comanda: ComandaResponseDTO) => {
    // Simulación de tiempo estimado basado en cantidad de items
    const tiempoBase = 10; // minutos base
    const tiempoPorItem = 2; // minutos por item
    return tiempoBase + (comanda.items.length * tiempoPorItem);
  };

  const getPrioridad = (comanda: ComandaResponseDTO) => {
    const tiempoEstimado = getTiempoEstimado(comanda);
    const totalItems = comanda.items.length;
    
    if (totalItems > 5 || tiempoEstimado > 20) return 'high';
    if (totalItems > 3 || tiempoEstimado > 15) return 'medium';
    return 'low';
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getPrioridadText = (prioridad: string) => {
    switch (prioridad) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      default:
        return 'Baja';
    }
  };

  const filteredComandas = comandas.filter(comanda => {
    if (filter === 'all') return true;
    const prioridad = getPrioridad(comanda);
    if (filter === 'urgent') return prioridad === 'high';
    return prioridad === 'low' || prioridad === 'medium';
  });

  const renderComandaCard = (comanda: ComandaResponseDTO) => {
    const prioridad = getPrioridad(comanda);
    const tiempoEstimado = getTiempoEstimado(comanda);

    return (
      <ModernCard
        key={comanda.id}
        title={`Mesa ${comanda.numeroMesa}`}
        subtitle={`${comanda.items.length} items • ${tiempoEstimado} min estimados`}
        chips={[getPrioridadText(prioridad)]}
        variant="elevated"
        hover={true}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={getPrioridadText(prioridad)}
              color={getPrioridadColor(prioridad) as any}
              size="small"
              icon={<PriorityHigh />}
            />
            <Chip
              label={`${tiempoEstimado} min`}
              color="info"
              size="small"
              variant="outlined"
              icon={<Timer />}
            />
          </Box>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Kitchen color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mesa {comanda.numeroMesa}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {comanda.items.length} productos • ${comanda.total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Lista de items */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Productos a preparar:
          </Typography>
          <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
            {comanda.items.map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 0.5,
                p: 0.5,
                borderRadius: 1,
                bgcolor: 'background.light'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.cantidad}x {item.productoNombre}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  ${(item.cantidad * item.precioUnitario).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            ${comanda.total.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tiempo: {tiempoEstimado} min
          </Typography>
        </Box>
      </ModernCard>
    );
  };

  const renderComandaListItem = (comanda: ComandaResponseDTO) => {
    const prioridad = getPrioridad(comanda);
    const tiempoEstimado = getTiempoEstimado(comanda);

    return (
      <Paper
        key={comanda.id}
        sx={{
          p: 2,
          mb: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: `4px solid ${theme.palette[getPrioridadColor(prioridad)].main}`,
        }}
      >
        {/* Contenido principal de la tarjeta */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Kitchen color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mesa {comanda.numeroMesa}
            </Typography>
            <Chip
              label={getPrioridadText(prioridad)}
              color={getPrioridadColor(prioridad) as any}
              size="small"
            />
            <Chip
              label={`${tiempoEstimado} min`}
              color="info"
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {comanda.items.length} productos • ${comanda.total.toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {comanda.items.slice(0, 3).map((item, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                {item.cantidad}x {item.productoNombre}
              </Typography>
            ))}
            {comanda.items.length > 3 && (
              <Typography variant="body2" color="text.secondary">
                +{comanda.items.length - 3} más...
              </Typography>
            )}
          </Box>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 2 }}>
            ${comanda.total.toFixed(2)}
          </Typography>
        </Box>
        {/* Divider y botón fuera del Box principal */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
          <ModernButton
            variant="primary"
            size="small"
            icon="save"
            loading={submittingId === comanda.id}
            onClick={() => {
              setSelectedComanda(comanda);
              setConfirmModalOpen(true);
            }}
          >
            Marcar Lista
          </ModernButton>
        </Box>
      </Paper>
    );
  };

  const renderMobileView = () => (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Kitchen color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Cocina
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton onClick={fetchInitialComandas} disabled={loading}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Comandas en Proceso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {comandas.length} comandas activas
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={`${comandas.filter(c => getPrioridad(c) === 'high').length} Urgentes`}
            color="error"
            size="small"
          />
          <Chip
            label={`${comandas.filter(c => getPrioridad(c) === 'medium').length} Normales`}
            color="warning"
            size="small"
          />
          <Chip
            label={`${comandas.filter(c => getPrioridad(c) === 'low').length} Simples`}
            color="success"
            size="small"
          />
        </Box>

        {comandas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Kitchen sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hay comandas en proceso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las comandas aparecerán aquí cuando estén en cocina
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredComandas.map(renderComandaListItem)}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={fetchInitialComandas}
        disabled={loading}
      >
        <Refresh />
      </Fab>
    </Box>
  );

  const renderDesktopView = () => (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Vista de Cocina
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona las comandas en proceso en tiempo real
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <ModernButton
            variant="outlined"
            icon="refresh"
            onClick={fetchInitialComandas}
            loading={loading}
          >
            Actualizar
          </ModernButton>
          
          <IconButton
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {viewMode === 'grid' ? <ViewList /> : <GridView />}
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip
          label={`${comandas.filter(c => getPrioridad(c) === 'high').length} Urgentes`}
          color="error"
          icon={<PriorityHigh />}
        />
        <Chip
          label={`${comandas.filter(c => getPrioridad(c) === 'medium').length} Normales`}
          color="warning"
          icon={<Schedule />}
        />
        <Chip
          label={`${comandas.filter(c => getPrioridad(c) === 'low').length} Simples`}
          color="success"
          icon={<Done />}
        />
        <Chip
          label={`${comandas.length} Total`}
          color="primary"
          icon={<Kitchen />}
        />
      </Box>

      {/* Comandas Grid */}
      {comandas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Kitchen sx={{ fontSize: 96, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No hay comandas en proceso
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Las comandas aparecerán aquí cuando estén en cocina
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredComandas.map(comanda => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={comanda.id}>
              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {renderComandaCard(comanda)}
                {/* Action Button debajo de la tarjeta */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                  <ModernButton
                    variant="primary"
                    size="small"
                    icon="save"
                    loading={submittingId === comanda.id}
                    onClick={() => {
                      setSelectedComanda(comanda);
                      setConfirmModalOpen(true);
                    }}
                  >
                    Marcar Lista
                  </ModernButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando comandas..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <ModernButton
          variant="primary"
          icon="refresh"
          onClick={fetchInitialComandas}
        >
          Reintentar
        </ModernButton>
      </Box>
    );
  }

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Confirm Ready Modal */}
      <ModernModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Comanda Lista"
        message={`¿Estás seguro de que la comanda de la Mesa ${selectedComanda?.numeroMesa} está lista para servir?`}
        variant="confirm"
        type="success"
        onConfirm={() => {
          if (selectedComanda) {
            handleMarcarComoLista(selectedComanda);
          }
          setConfirmModalOpen(false);
        }}
        confirmText="Confirmar Lista"
        cancelText="Cancelar"
      />
    </>
    );
};

export default KitchenViewPage;