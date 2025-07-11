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
  Tabs,
  Tab,
  Badge,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  Restaurant,
  LocalDining,
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
import { getComandasPorArea, startPreparation, markAsReady } from '../services/comandaService';
import { getAreasPreparacion } from '../services/preparationAreaService';
import type { PreparationArea, ComandaAreaResponseDTO } from '../types';

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
      id={`area-tabpanel-${index}`}
      aria-labelledby={`area-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const KitchenViewPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showError, showSuccess } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [areas, setAreas] = useState<PreparationArea[]>([]);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [comandasPorArea, setComandasPorArea] = useState<{ [areaId: number]: ComandaAreaResponseDTO[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (areas.length > 0) {
      loadComandasForAllAreas();
    }
  }, [areas]);

  const loadAreas = async () => {
    try {
      setLoading(true);
      console.log('Cargando áreas de preparación...');
      const areasData = await getAreasPreparacion();
      console.log('Áreas cargadas:', areasData);
      console.log('Primera área:', areasData[0]);
      console.log('Estructura de área:', JSON.stringify(areasData[0], null, 2));
      setAreas(areasData);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      showError('Error al cargar áreas de preparación');
    } finally {
      setLoading(false);
    }
  };

  const loadComandasForAllAreas = async () => {
    try {
      setRefreshing(true);
      console.log('Cargando comandas para todas las áreas...');
      const comandasData: { [areaId: number]: ComandaAreaResponseDTO[] } = {};
      
      for (const area of areas) {
        try {
          console.log(`Cargando comandas para área ${area.id} (${area.name})`);
          const comandas = await getComandasPorArea(area.id);
          console.log(`Comandas encontradas para área ${area.id}:`, comandas);
          comandasData[area.id] = comandas;
        } catch (error) {
          console.error(`Error loading comandas for area ${area.id}:`, error);
          comandasData[area.id] = [];
        }
      }
      
      console.log('Todas las comandas cargadas:', comandasData);
      setComandasPorArea(comandasData);
    } catch (error) {
      console.error('Error al cargar comandas:', error);
      showError('Error al cargar comandas');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAreaChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedAreaIndex(newValue);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Timer color="warning" />;
      case 'IN_PROGRESS':
        return <PriorityHigh color="info" />;
      case 'READY':
        return <CheckCircle color="success" />;
      case 'DELIVERED':
        return <CheckCircle color="disabled" />;
      default:
        return <Timer />;
    }
  };

  const renderComandaCard = (comanda: ComandaAreaResponseDTO) => (
    <Card key={comanda.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div">
              Mesa {comanda.mesaId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comanda #{comanda.comandaId} - {comanda.areaNombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(comanda.fechaCreacion).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(comanda.estado)}
            <Chip
              label={comanda.estado}
              color={getStatusColor(comanda.estado) as any}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List dense>
          {comanda.items.map((item: any) => (
            <ListItem key={item.id} sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={500}>
                      {item.productoNombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      x{item.cantidad}
                    </Typography>
                  </Box>
                }
                secondary={
                  item.observaciones && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Obs: {item.observaciones}
                    </Typography>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ModernButton
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
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
        
        {comanda.estado === 'PENDING' && (
          <ModernButton
            variant="primary"
            size="small"
            onClick={() => handleStartPreparation(comanda.id)}
          >
            Iniciar Preparación
          </ModernButton>
        )}
        
        {comanda.estado === 'IN_PROGRESS' && (
          <ModernButton
            variant="success"
            size="small"
            onClick={() => handleMarkAsReady(comanda.id)}
          >
            Marcar como Listo
          </ModernButton>
        )}
      </CardActions>
    </Card>
  );

  const handleStartPreparation = async (comandaAreaId: number) => {
    try {
      await startPreparation(comandaAreaId);
      showSuccess('Preparación iniciada', 'La comanda ha sido marcada como en preparación');
      await loadComandasForAllAreas();
    } catch (error) {
      showError('Error al iniciar preparación');
    }
  };

  const handleMarkAsReady = async (comandaAreaId: number) => {
    try {
      await markAsReady(comandaAreaId);
      showSuccess('Comanda lista', 'La comanda ha sido marcada como lista');
      await loadComandasForAllAreas();
    } catch (error) {
      showError('Error al marcar como listo');
    }
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

  const selectedArea = areas[selectedAreaIndex];
  const comandasDelArea = comandasPorArea[selectedArea?.id] || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Vista de Cocina
        </Typography>
        <ModernButton
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Actualizar
        </ModernButton>
      </Box>

      <ModernCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={selectedAreaIndex}
            onChange={handleAreaChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
          >
            {areas.map((area, index) => (
              <Tab
                key={area.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Restaurant />
                    {area.name}
                    <Badge
                      badgeContent={comandasPorArea[area.id]?.length || 0}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                id={`area-tab-${index}`}
                aria-controls={`area-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {areas.map((area, index) => (
          <TabPanel key={area.id} value={selectedAreaIndex} index={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                {area.name}
              </Typography>
              <Chip
                label={`${comandasPorArea[area.id]?.length || 0} comandas`}
                color="primary"
                variant="outlined"
              />
            </Box>

            {comandasPorArea[area.id]?.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay comandas pendientes para {area.name}
              </Alert>
            ) : (
              <Box>
                {comandasPorArea[area.id]?.map(renderComandaCard)}
              </Box>
            )}
          </TabPanel>
        ))}
      </ModernCard>
    </Box>
  );
};

export default KitchenViewPage;