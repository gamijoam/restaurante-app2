import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Badge,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Restaurant,
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
import { getComandasPorArea, startPreparation, markAsReady, imprimirComandaArea } from '../services/comandaService';
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
  useAuth();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   
  useEffect(() => {
    if (areas.length > 0) {
      loadComandasForAllAreas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas]);

  // Auto-refresh cada 10 segundos para detectar nuevos items
  useEffect(() => {
    const interval = setInterval(() => {
      if (areas.length > 0) {
        loadComandasForAllAreas();
      }
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
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
    } catch {
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
          
          // Log detallado de cada comanda y sus items
          comandas.forEach((comanda: any) => {
            console.log(`Comanda ${comanda.id} - Mesa ${comanda.mesaId}:`);
            comanda.items.forEach((item: any) => {
              console.log(`  - Item: ${item.productoNombre}, esNuevo: ${item.esNuevo}`);
            });
          });
          
          comandasData[area.id] = comandas;
        } catch{
          console.error(`Error loading comandas for area ${area.id}:`);
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

  const handleAreaChange = (_event: React.SyntheticEvent, newValue: number) => {
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" component="div">
                Mesa {comanda.mesaId}
              </Typography>
              {comanda.items.some(item => item.esNuevo) && (
                <Chip
                  label="NUEVOS ITEMS"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontSize: '0.7rem', height: '24px' }}
                />
              )}
            </Box>
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
              color={getStatusColor(comanda.estado) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List dense>
          {comanda.items.map((item: { id: number; productoNombre: string; cantidad: number; observaciones?: string; esNuevo?: boolean }) => {
            console.log('Item en cocina:', item.productoNombre, 'esNuevo:', item.esNuevo);
            return (
            <ListItem 
              key={item.id} 
              sx={{ 
                px: 0,
                backgroundColor: item.esNuevo ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                borderLeft: item.esNuevo ? '4px solid #4CAF50' : 'none',
                borderRadius: item.esNuevo ? '4px' : '0',
                mb: item.esNuevo ? 1 : 0
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight={item.esNuevo ? 600 : 500}
                        color={item.esNuevo ? 'primary.main' : 'inherit'}
                      >
                        {item.productoNombre}
                      </Typography>
                      {item.esNuevo && (
                        <Chip
                          label="NUEVO"
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      )}
                    </Box>
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
          );
          })}
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
            onClick={async () => {
              try {
                await imprimirComandaArea(comanda.id);
                showSuccess('Impresión enviada', 'La comanda se envió a imprimir correctamente');
              } catch (error) {
                showError('Error al imprimir la comanda');
              }
            }}
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
    } catch {
      showError('Error al iniciar preparación');
    }
  };

  const handleMarkAsReady = async (comandaAreaId: number) => {
    try {
      await markAsReady(comandaAreaId);
      showSuccess('Comanda lista', 'La comanda ha sido marcada como lista');
      await loadComandasForAllAreas();
    } catch {
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
  if (!selectedArea) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Área de preparación no encontrada.</Alert>
      </Box>
    );
  }
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