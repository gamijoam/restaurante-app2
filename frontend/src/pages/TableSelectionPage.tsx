import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Alert,
  Fab
} from '@mui/material';
import {
  TableRestaurant,
  Restaurant,
  People,
  AccessTime,
  Refresh,
  ViewList,
  GridView
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
// import LoadingSpinner from '../components/LoadingSpinner';
// import SkeletonLoader from '../components/SkeletonLoader';
import { getMesas, type Mesa } from '../services/mesaService';
import { useWebSocket } from '../context/WebSocketContextProduction';

interface MesaWithComanda extends Mesa {
  comandaActual?: {
    total?: number;
    items?: unknown[];
    [key: string]: unknown;
  };
}

const TableSelectionPage: React.FC = () => {
  // const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [mesas, setMesas] = useState<MesaWithComanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter] = useState<'all' | 'libre' | 'ocupada' | 'reservada'>('all');

  const { stompClient, isConnected } = useWebSocket();

  useEffect(() => {
    loadMesas();

    if (isConnected && stompClient) {
      const subscription = stompClient.subscribe('/topic/mesas', (message) => {
        try {
          const mesaActualizada = JSON.parse(message.body);
          setMesas(prevMesas =>
            prevMesas.map(m => m.id === mesaActualizada.id ? { ...m, ...mesaActualizada } : m)
          );
        } catch {
          // Mensaje no es una mesa válida
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isConnected, stompClient]);

  const loadMesas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMesas();
      setMesas(response as MesaWithComanda[]);
    } catch {
      setError('Error al cargar las mesas');
      showError('Error al cargar las mesas', 'Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  const handleMesaClick = (mesa: MesaWithComanda) => {
    navigate(`/order/${mesa.id}`);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return 'success';
      case 'OCUPADA':
        return 'error';
      case 'RESERVADA':
        return 'warning';
      case 'MANTENIMIENTO':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return 'Libre';
      case 'OCUPADA':
        return 'Ocupada';
      case 'RESERVADA':
        return 'Reservada';
      case 'MANTENIMIENTO':
        return 'Mantenimiento';
      default:
        return estado;
    }
  };

  const filteredMesas = mesas.filter(mesa => {
    if (filter === 'all') return true;
    return mesa.estado.toLowerCase() === filter;
  });

  const renderMesaCard = (mesa: MesaWithComanda) => (
    <Fade in={true} timeout={300}>
      <Box 
        sx={{ 
          cursor: mesa.estado === 'LIBRE' ? 'pointer' : 'default',
          opacity: mesa.estado !== 'LIBRE' ? 0.7 : 1,
          '&:hover': mesa.estado === 'LIBRE' ? {
            transform: 'translateY(-4px)',
          } : {},
        }}
        onClick={() => handleMesaClick(mesa)}
      >
        <ModernCard
          key={mesa.id}
          title={`Mesa ${mesa.numero}`}
          subtitle={mesa.nombre || 'Sin ubicación'}
          chips={[getEstadoText(mesa.estado)]}
          variant="elevated"
          hover={mesa.estado === 'LIBRE'}
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={getEstadoText(mesa.estado)}
                color={getEstadoColor(mesa.estado) as 'success' | 'error' | 'warning' | 'default'}
                size="small"
                variant="filled"
              />
              {mesa.comandaActual && (
                <Chip
                  label={`$${mesa.comandaActual.total || 0}`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TableRestaurant color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Mesa {mesa.numero}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacidad: {mesa.capacidad} personas
              </Typography>
            </Box>
          </Box>

          {mesa.comandaActual && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Comanda activa:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  {mesa.comandaActual.items?.length || 0} items
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  ${mesa.comandaActual.total || 0}
                </Typography>
              </Box>
            </Box>
          )}
        </ModernCard>
      </Box>
    </Fade>
  );

  const renderMobileView = () => (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Seleccionar Mesa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Elige una mesa libre para tomar el pedido
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          label={`${mesas.filter(m => m.estado === 'LIBRE').length} Libres`}
          color="success"
          size="small"
        />
        <Chip
          label={`${mesas.filter(m => m.estado === 'OCUPADA').length} Ocupadas`}
          color="error"
          size="small"
        />
        <Chip
          label={`${mesas.filter(m => m.estado === 'RESERVADA').length} Reservadas`}
          color="warning"
          size="small"
        />
      </Box>

      {/* Mesas List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredMesas.map(mesa => (
          <Paper
            key={mesa.id}
            sx={{
              p: 2,
              borderRadius: 2,
              cursor: mesa.estado === 'LIBRE' ? 'pointer' : 'default',
              opacity: mesa.estado !== 'LIBRE' ? 0.7 : 1,
              '&:hover': mesa.estado === 'LIBRE' ? {
                backgroundColor: 'action.hover',
              } : {},
            }}
            onClick={() => handleMesaClick(mesa)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Mesa {mesa.numero}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mesa.capacidad} personas • {mesa.nombre || 'Sin ubicación'}
                </Typography>
              </Box>
              <Chip
                label={getEstadoText(mesa.estado)}
                color={getEstadoColor(mesa.estado) as 'success' | 'error' | 'warning' | 'default'}
                size="small"
              />
            </Box>
            
            {mesa.comandaActual && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Comanda activa: {mesa.comandaActual.items?.length || 0} items
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  ${mesa.comandaActual.total || 0}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );

  const renderDesktopView = () => (
    <Box sx={{ p: 3 }}>
      {/* Debug indicator */}
      <Box sx={{ 
        mb: 2, 
        p: 1, 
        bgcolor: 'primary.light', 
        borderRadius: 1,
        color: 'primary.contrastText',
        fontSize: '0.75rem'
      }}>
        🎯 Layout corregido: Contenido no se solapa con sidebar
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Seleccionar Mesa
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Elige una mesa libre para tomar el pedido
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <ModernButton
            variant="outlined"
            icon="refresh"
            onClick={loadMesas}
            loading={loading}
            tooltip="Actualizar mesas"
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
          label={`${mesas.filter(m => m.estado === 'LIBRE').length} Libres`}
          color="success"
          icon={<Restaurant />}
        />
        <Chip
          label={`${mesas.filter(m => m.estado === 'OCUPADA').length} Ocupadas`}
          color="error"
          icon={<People />}
        />
        <Chip
          label={`${mesas.filter(m => m.estado === 'RESERVADA').length} Reservadas`}
          color="warning"
          icon={<AccessTime />}
        />
      </Box>

      {/* Mesas Grid */}
      <Grid container spacing={3}>
        {filteredMesas.map(mesa => (
          <Grid
            item
            key={mesa.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2}
          >
            {renderMesaCard(mesa)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* <SkeletonLoader variant="grid" count={8} height={200} /> */}
      </Box>
    );
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
          onClick={loadMesas}
        >
          Reintentar
        </ModernButton>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={loadMesas}
        >
          <Refresh />
        </Fab>
      )}
    </Box>
  );
};

export default TableSelectionPage;