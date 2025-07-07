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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PointOfSale,
  Receipt,
  Print,
  CheckCircle,
  AccessTime,
  Restaurant,
  Refresh,
  FilterList,
  ViewList,
  GridView,
  AttachMoney,
  LocalDining,
  Timer,
  Payment,
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
import { imprimirTicketCaja } from '../services/impresionService';

const CashierViewPage: React.FC = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [printingId, setPrintingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState<ComandaResponseDTO | null>(null);
  
  const { stompClient, isConnected } = useWebSocket();
  const { showError, showSuccess } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const fetchInitialComandas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getComandasPorMultiplesEstados(['LISTA', 'ENTREGADA']);
            setComandas(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar las comandas a cobrar.');
      showError('Error al cargar comandas', 'No se pudieron cargar las comandas pendientes');
        } finally {
            setLoading(false);
        }
  }, [showError]);

    useEffect(() => {
        if (isConnected && stompClient) {
            fetchInitialComandas();
            const subscription = stompClient.subscribe('/topic/caja', (message) => {
                const comandaActualizada: ComandaResponseDTO = JSON.parse(message.body);
                if (comandaActualizada.estado === 'LISTA' || comandaActualizada.estado === 'ENTREGADA') {
                    setComandas(prevComandas => {
                        const comandaExistente = prevComandas.find(c => c.id === comandaActualizada.id);
                        if (comandaExistente) {
                            return prevComandas.map(c => c.id === comandaActualizada.id ? comandaActualizada : c);
                        }
                        return [comandaActualizada, ...prevComandas];
                    });
          showSuccess('Nueva comanda', `Mesa ${comandaActualizada.numeroMesa} lista para cobrar`);
                }
            });
            return () => { subscription.unsubscribe(); };
        }
  }, [isConnected, stompClient, fetchInitialComandas, showSuccess]);

  const handleMarcarComoPagada = async (comanda: ComandaResponseDTO) => {
    setSubmittingId(comanda.id);
        try {
      await updateComandaEstado(comanda.id, 'PAGADA');
      setComandas(prevComandas => prevComandas.filter(c => c.id !== comanda.id));
      showSuccess('Comanda pagada', `Mesa ${comanda.numeroMesa} marcada como pagada`);
        } catch (err) {
      showError('Error al pagar', 'No se pudo marcar la comanda como pagada');
        } finally {
            setSubmittingId(null);
        }
    };

  const handlePrintClick = async (comanda: ComandaResponseDTO) => {
    setPrintingId(comanda.id);
        try {
      await imprimirTicketCaja(comanda.id);
      showSuccess('Ticket impreso', `Ticket de mesa ${comanda.numeroMesa} enviado a impresora`);
        } catch (error: any) {
            if (error.response?.status === 404) {
        showError('Impresora no configurada', 'Configure una impresora para el rol CAJA en Configuración');
            } else {
        showError('Error de impresión', 'Verifique que el Puente de Impresión esté conectado');
            }
        } finally {
            setPrintingId(null);
        }
    };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'LISTA':
        return 'warning';
      case 'ENTREGADA':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'LISTA':
        return 'Lista para Cobrar';
      case 'ENTREGADA':
        return 'Entregada';
      default:
        return estado;
    }
  };

  const renderComandaCard = (comanda: ComandaResponseDTO) => (
    <Paper
      key={comanda.id}
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Restaurant color="primary" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Mesa {comanda.numeroMesa}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {comanda.items.length} productos • {comanda.total.toFixed(2)} items
          </Typography>
        </Box>
      </Box>

      {/* Lista de items */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Productos:
        </Typography>
        <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
          {comanda.items.slice(0, 3).map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                {item.cantidad}x {item.productoNombre}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                ${(item.cantidad * item.precioUnitario).toFixed(2)}
              </Typography>
            </Box>
          ))}
          {comanda.items.length > 3 && (
            <Typography variant="body2" color="text.secondary">
              +{comanda.items.length - 3} más...
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
          ${comanda.total.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );

  const renderComandaListItem = (comanda: ComandaResponseDTO) => (
    <Paper
      key={comanda.id}
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Restaurant color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mesa {comanda.numeroMesa}
            </Typography>
            <Chip
              label={getEstadoText(comanda.estado)}
              color={getEstadoColor(comanda.estado) as any}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {comanda.items.length} productos
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
            ${comanda.total.toFixed(2)}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ModernButton
              variant="outlined"
              size="small"
              icon="print"
              loading={printingId === comanda.id}
              onClick={() => handlePrintClick(comanda)}
            >
              Imprimir
            </ModernButton>
            
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
              Cobrar
            </ModernButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  const renderMobileView = () => (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PointOfSale color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Caja
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
            Comandas por Cobrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {comandas.length} comandas pendientes
          </Typography>
        </Box>

        {comandas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PointOfSale sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hay comandas pendientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las comandas aparecerán aquí cuando estén listas para cobrar
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {comandas.map(renderComandaListItem)}
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
            Vista de Caja
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los pagos y facturación de comandas
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
          label={`${comandas.length} Pendientes`}
          color="warning"
          icon={<Timer />}
        />
        <Chip
          label={`$${comandas.reduce((sum, c) => sum + c.total, 0).toFixed(2)} Total`}
          color="primary"
          icon={<AttachMoney />}
        />
      </Box>

      {/* Comandas Grid */}
      {comandas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PointOfSale sx={{ fontSize: 96, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No hay comandas pendientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Las comandas aparecerán aquí cuando estén listas para cobrar
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {comandas.map(comanda => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={comanda.id}>
              <Box sx={{ position: 'relative' }}>
                {renderComandaCard(comanda)}
                
                {/* Action Buttons */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: 16,
                  display: 'flex',
                  gap: 1
                }}>
                  <ModernButton
                    variant="outlined"
                    size="small"
                    icon="print"
                    loading={printingId === comanda.id}
                    onClick={() => handlePrintClick(comanda)}
                  >
                    Imprimir
                  </ModernButton>
                  
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
                    Cobrar
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

      {/* Confirm Payment Modal */}
      <ModernModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Pago"
        message={`¿Estás seguro de que quieres marcar como pagada la comanda de la Mesa ${selectedComanda?.numeroMesa} por $${selectedComanda?.total.toFixed(2)}?`}
        variant="confirm"
        type="success"
        onConfirm={() => {
          if (selectedComanda) {
            handleMarcarComoPagada(selectedComanda);
          }
          setConfirmModalOpen(false);
        }}
        confirmText="Confirmar Pago"
        cancelText="Cancelar"
      />
    </>
    );
};

export default CashierViewPage;