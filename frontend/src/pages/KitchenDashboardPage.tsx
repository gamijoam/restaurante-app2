import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  useTheme,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Timer,
  PriorityHigh,
  Refresh,
  Visibility,
  Print,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { getComandasPorArea } from '../services/comandaService';
import { getAreasPreparacion } from '../services/preparationAreaService';
import type { PreparationArea, ComandaAreaResponseDTO } from '../types';

const KitchenDashboardPage: React.FC = () => {
  useAuth();
  const { showError } = useNotification();
  useTheme();

  const [areas, setAreas] = useState<PreparationArea[]>([]);
  const [comandasPorArea, setComandasPorArea] = useState<{ [areaId: number]: ComandaAreaResponseDTO[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (areas.length > 0) {
      loadComandasForAllAreas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas.length]); // Solo depender del length, no del array completo

  const loadAreas = async () => {
    try {
      setLoading(true);
      const areasData = await getAreasPreparacion();
      setAreas(areasData);
    } catch {
      showError('Error al cargar áreas de preparación');
    } finally {
      setLoading(false);
    }
  };

  const loadComandasForAllAreas = async () => {
    try {
      setRefreshing(true);
      const comandasData: { [areaId: number]: ComandaAreaResponseDTO[] } = {};
      
      for (const area of areas) {
        try {
          const comandas = await getComandasPorArea(area.id);
          comandasData[area.id] = comandas;
        } catch {
          comandasData[area.id] = [];
        }
      }
      
      setComandasPorArea(comandasData);
    } catch {
      showError('Error al cargar comandas');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadComandasForAllAreas();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'READY':
        return 'success';
      case 'DELIVERED':
        return 'default';
      default:
        return 'default';
    }
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'PENDIENTE';
      case 'IN_PROGRESS':
        return 'EN PREPARACIÓN';
      case 'READY':
        return 'LISTO';
      case 'DELIVERED':
        return 'ENTREGADO';
      default:
        return status;
    }
  };

  const getAreaStats = (areaId: number) => {
    const comandas = comandasPorArea[areaId] || [];
    const stats = {
      total: comandas.length,
      pending: comandas.filter(c => c.estado === 'PENDING').length,
      inProgress: comandas.filter(c => c.estado === 'IN_PROGRESS').length,
      ready: comandas.filter(c => c.estado === 'READY').length,
      delivered: comandas.filter(c => c.estado === 'DELIVERED').length,
    };
    return stats;
  };

  const renderAreaCard = (area: PreparationArea) => {
    const stats = getAreaStats(area.id);
    const comandas = comandasPorArea[area.id] || [];

    return (
      <ModernCard
        key={area.id}
        title={area.name}
        subtitle={area.description || 'Área de preparación'}
        chips={[
          `${stats.total} comandas`,
          `${stats.pending} pendientes`,
          `${stats.ready} listas`
        ]}
        variant="elevated"
        hover={true}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${stats.pending} Pendientes`}
              color="warning"
              size="small"
              icon={<Timer />}
            />
            <Chip
              label={`${stats.inProgress} En Proceso`}
              color="info"
              size="small"
              icon={<PriorityHigh />}
            />
            <Chip
              label={`${stats.ready} Listas`}
              color="success"
              size="small"
              icon={<CheckCircle />}
            />
          </Box>
        }
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Comandas recientes:
          </Typography>
          
          {comandas.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              No hay comandas activas
            </Alert>
          ) : (
            <List dense>
              {comandas.slice(0, 3).map((comanda) => (
                <ListItem key={comanda.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={500}>
                          Mesa {comanda.mesaId}
                        </Typography>
                        <Chip
                          label={getStatusText(comanda.estado)}
                          color={getStatusColor(comanda.estado) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {comanda.items.length} items • {new Date(comanda.fechaCreacion).toLocaleTimeString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Comandas
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ModernButton
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => window.location.href = `/kitchen-view`}
            >
              Ver Detalles
            </ModernButton>
            <ModernButton
              variant="outlined"
              size="small"
              startIcon={<Print />}
            >
              Imprimir
            </ModernButton>
          </Box>
        </Box>
      </ModernCard>
    );
  };

  const getOverallStats = () => {
    let totalComandas = 0;
    let totalPendientes = 0;
    let totalEnProceso = 0;
    let totalListas = 0;

    Object.values(comandasPorArea).forEach(comandas => {
      totalComandas += comandas.length;
      totalPendientes += comandas.filter(c => c.estado === 'PENDING').length;
      totalEnProceso += comandas.filter(c => c.estado === 'IN_PROGRESS').length;
      totalListas += comandas.filter(c => c.estado === 'READY').length;
    });

    return { totalComandas, totalPendientes, totalEnProceso, totalListas };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (areas.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No hay áreas de preparación configuradas. Contacta al administrador.
        </Alert>
      </Box>
    );
  }

  const overallStats = getOverallStats();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Dashboard de Cocina
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vista general de todas las áreas de preparación
          </Typography>
        </Box>
        <ModernButton
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Actualizar
        </ModernButton>
      </Box>

      {/* Estadísticas Generales */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Estadísticas Generales
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {overallStats.totalComandas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Comandas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {overallStats.totalPendientes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                {overallStats.totalEnProceso}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Proceso
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {overallStats.totalListas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Listas
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Áreas de Preparación */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Áreas de Preparación
      </Typography>
      
      <Grid container spacing={3}>
        {areas.map(renderAreaCard)}
      </Grid>
    </Box>
  );
};

export default KitchenDashboardPage; 