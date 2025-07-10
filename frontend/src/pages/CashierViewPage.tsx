import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimerIcon from '@mui/icons-material/Timer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { ComandaResponseDTO, ComandaAreaResponseDTO } from '../types';
import { getComandasPorMultiplesEstados, updateComandaEstado, getComandaAreasStatus } from '../services/comandaService';
import { useWebSocket } from '../context/WebSocketContext';
import { useNotification } from '../hooks/useNotification';
// import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';
// import SkeletonLoader from '../components/SkeletonLoader';
import OrderSummary from '../components/OrderSummary';
import { imprimirTicketCaja } from '../services/impresionService';
// import ProductCard from '../components/ProductCard';
import { getProductos } from '../services/productoService';
import { agregarItemsAComanda } from '../services/comandaService';
import type { Producto } from '../types';
import { crearComandaAPI } from '../services/comandaService';
import { getFacturas, updateFacturaEstado } from '../services/facturaService';
import { PointOfSale } from '@mui/icons-material';

// --- Componente interno para selección de productos ---
interface ProductSelectorWizardModalProps {
  open: boolean;
  onClose: () => void;
  productos: Producto[];
  initialSelected: { [productoId: number]: number };
  onConfirm: (selected: { [productoId: number]: number }) => void;
  loading?: boolean;
  confirmText: string;
}
const ProductSelectorWizardModal: React.FC<ProductSelectorWizardModalProps> = ({
  open, onClose, productos, initialSelected, onConfirm, loading, confirmText
}) => {
  const [step, setStep] = useState(0); // 0: selección, 1: confirmación
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ [productoId: number]: number }>(initialSelected);
  useEffect(() => {
    setSelected(initialSelected);
    setStep(0);
    setSearch('');
  }, [initialSelected, open]);
  const filtered = useMemo(() => productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase())), [productos, search]);
  const carrito = useMemo(() => productos.filter(p => selected[p.id] > 0), [productos, selected]);
  const total = useMemo(() => carrito.reduce((sum, p) => sum + (selected[p.id] * p.precio), 0), [carrito, selected]);
  const isMobile = window.innerWidth < 600;
  return (
    <ModernModal
  open={open}
  onClose={onClose}
  title={step === 0 ? 'Seleccionar productos' : 'Confirmar pedido'}
  variant="form"
  type="info"
  fullScreen={isMobile}
>
      {loading ? <LoadingSpinner message="Cargando productos..." /> : (
        step === 0 ? (
          <>
            <Box sx={{
              display: 'flex', flexDirection: 'column', gap: 2, height: isMobile ? '70vh' : 420, width: '100%', p: 0
            }}>
              <TextField
                fullWidth
                size="medium"
                label="Buscar producto"
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
                InputProps={{ style: { fontSize: 18, padding: 8 } }}
              />
              <Box sx={{ flex: 1, overflow: 'auto', pr: 1, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                {filtered.length === 0 ? (
                  <Typography color="text.secondary">No hay productos</Typography>
                ) : filtered.map(producto => (
                  <Card key={producto.id} sx={{
                    width: 220, minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2,
                    borderRadius: 3, boxShadow: 2, background: '#fff', gap: 1, transition: 'box-shadow 0.2s', ':hover': { boxShadow: 5 }
                  }}>
                    <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 48, height: 48, mb: 1, fontSize: 28 }}>{producto.nombre[0]}</Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{producto.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">${producto.precio.toFixed(2)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <IconButton size="small" onClick={() => setSelected(s => ({ ...s, [producto.id]: Math.max(0, (s[producto.id] || 0) - 1) }))} disabled={!selected[producto.id]}><RemoveIcon /></IconButton>
                      <TextField
                        type="number"
                        size="small"
                        value={selected[producto.id] || ''}
                        onChange={e => setSelected(s => ({ ...s, [producto.id]: Math.max(0, Number(e.target.value)) }))}
                        sx={{ width: 50 }}
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                      />
                      <IconButton size="small" onClick={() => setSelected(s => ({ ...s, [producto.id]: (s[producto.id] || 0) + 1 }))}><AddIcon /></IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={carrito.length === 0 || loading}
                onClick={() => setStep(1)}
                sx={{ minWidth: 220, fontWeight: 700, fontSize: 18 }}
              >
                Siguiente
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ p: isMobile ? 1 : 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Card sx={{ width: isMobile ? '100%' : 420, p: 3, borderRadius: 3, boxShadow: 3, background: '#fff' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Resumen del pedido</Typography>
                {carrito.length === 0 ? <Typography color="text.secondary">Vacío</Typography> : (
                  <List>
                    {carrito.map(p => (
                      <ListItem key={p.id}>
                        <ListItemText primary={p.nombre} secondary={`Cantidad: ${selected[p.id]}  |  $${(selected[p.id] * p.precio).toFixed(2)}`} />
                      </ListItem>
                    ))}
                  </List>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h5" sx={{ textAlign: 'right', fontWeight: 700, color: '#388e3c' }}>Total: ${total.toFixed(2)}</Typography>
              </Card>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={carrito.length === 0 || loading}
                  onClick={() => onConfirm(selected)}
                  sx={{ minWidth: 220, fontWeight: 700, fontSize: 18 }}
                >
                  {confirmText}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => setStep(0)}
                  sx={{ minWidth: 120, ml: 2 }}
                >
                  Atrás
                </Button>
              </Box>
            </Box>
          </>
        )
      )}
    </ModernModal>
  );
};

const CashierViewPage: React.FC = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    // refreshing state removed (was unused)
    const [comandasAreasStatus, setComandasAreasStatus] = useState<{ [comandaId: number]: ComandaAreaResponseDTO[] }>({});
    const [error, setError] = useState<string | null>(null);
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [printingId, setPrintingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState<ComandaResponseDTO | null>(null);
  const [addProductsModalOpen, setAddProductsModalOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedComandaForAdd, setSelectedComandaForAdd] = useState<ComandaResponseDTO | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<{ [productoId: number]: number }>({});
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [quickSaleModalOpen, setQuickSaleModalOpen] = useState(false);
  const [quickSaleProducts, setQuickSaleProducts] = useState<{ [productoId: number]: number }>({});
  const [quickSaleLoading, setQuickSaleLoading] = useState(false);
  const [quickSaleProductos, setQuickSaleProductos] = useState<Producto[]>([]);
  const [creatingQuickSale, setCreatingQuickSale] = useState(false);
  
  const { stompClient, isConnected } = useWebSocket();
  const { showError, showSuccess } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const fetchInitialComandas = useCallback(async () => {
        setLoading(true);
        try {
            // Obtener comandas LISTA y ENTREGADA
            const comandasNormales = await getComandasPorMultiplesEstados(['LISTA', 'ENTREGADA']);
            
            // Obtener ventas rápidas (EN_PROCESO con mesaId 9999)
            const ventasRapidas = await getComandasPorMultiplesEstados(['EN_PROCESO']);
            const ventasRapidasFiltradas = ventasRapidas.filter(comanda => comanda.numeroMesa === 9999);
            
            // Combinar ambas listas
            const todasLasComandas = [...comandasNormales, ...ventasRapidasFiltradas];
            setComandas(todasLasComandas);
            
            // Cargar estado de áreas para cada comanda
            const areasStatus: { [comandaId: number]: ComandaAreaResponseDTO[] } = {};
            for (const comanda of todasLasComandas) {
                try {
                    const areas = await getComandaAreasStatus(comanda.id);
                    areasStatus[comanda.id] = areas;
                } catch (error) {
                    console.error(`Error cargando áreas para comanda ${comanda.id}:`, error);
                    areasStatus[comanda.id] = [];
                }
            }
            setComandasAreasStatus(areasStatus);
        } catch {
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
                // Incluir ventas rápidas (EN_PROCESO con mesaId 9999) y comandas LISTA/ENTREGADA
                if (comandaActualizada.estado === 'LISTA' || 
                    comandaActualizada.estado === 'ENTREGADA' ||
                    (comandaActualizada.estado === 'EN_PROCESO' && comandaActualizada.numeroMesa === 9999)) {
                    setComandas(prevComandas => {
                        const comandaExistente = prevComandas.find(c => c.id === comandaActualizada.id);
                        if (comandaExistente) {
                            return prevComandas.map(c => c.id === comandaActualizada.id ? comandaActualizada : c);
                        }
                        return [comandaActualizada, ...prevComandas];
                    });
                    
                    // Mostrar mensaje apropiado según el tipo de comanda
                    if (comandaActualizada.numeroMesa === 9999) {
                        showSuccess('Venta rápida creada', 'Nueva venta rápida lista para cobrar');
                    } else {
                        showSuccess('Nueva comanda', `Mesa ${comandaActualizada.numeroMesa} lista para cobrar`);
                    }
                }
            });
            return () => { subscription.unsubscribe(); };
        }
  }, [isConnected, stompClient, fetchInitialComandas, showSuccess]);

  useEffect(() => {
    if (isConnected && stompClient) {
      const subscription = stompClient.subscribe('/topic/mesas', () => {
        // Mensaje no es una mesa válida o no se usa
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isConnected, stompClient]);

  const handleMarcarComoPagada = async (comanda: ComandaResponseDTO) => {
    setSubmittingId(comanda.id);
    try {
      await updateComandaEstado(comanda.id, 'PAGADA');
      // Buscar y actualizar la factura asociada a la comanda
      try {
        // Buscar la factura asociada (puedes tener un endpoint para esto, aquí se asume que la factura tiene el mismo id que la comanda)
        // Si tienes la lista de facturas en memoria, puedes buscarla ahí
        const facturas = await getFacturas();
        const factura = facturas.find(f => f.comandaId === comanda.id);
        if (factura) {
          await updateFacturaEstado(factura.id, 'PAGADA');
        }
      } catch {
        // Si no hay factura, no hacer nada
      }
      setComandas(prevComandas => prevComandas.filter(c => c.id !== comanda.id));
      showSuccess('Comanda pagada', `Mesa ${comanda.numeroMesa} marcada como pagada`);
    } catch {
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
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404) {
                showError('Impresora no configurada', 'Configure una impresora para el rol CAJA en Configuración');
            } else {
                showError('Error de impresión', 'Verifique que el Puente de Impresión esté conectado');
            }
        } finally {
            setPrintingId(null);
        }
    };

  const handleOpenAddProducts = async (comanda: ComandaResponseDTO) => {
    setSelectedComandaForAdd(comanda);
    setAddProductsModalOpen(true);
    setLoadingProductos(true);
    try {
      const productos = await getProductos();
      setProductos(productos);
    } catch {
      showError('Error al cargar productos', 'No se pudieron cargar los productos');
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleOpenQuickSale = async () => {
    setQuickSaleModalOpen(true);
    setQuickSaleLoading(true);
    try {
      const productos = await getProductos();
      setQuickSaleProductos(productos);
    } catch {
      showError('Error al cargar productos', 'No se pudieron cargar los productos para la venta rápida');
    } finally {
      setQuickSaleLoading(false);
    }
  };

  // Removed unused handlers: handleSelectProduct, handleAddProductsToComanda, handleOpenQuickSale, handleSelectQuickSaleProduct, handleCreateQuickSale

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'LISTA':
        return 'warning';
      case 'ENTREGADA':
        return 'info';
      case 'EN_PROCESO':
        return 'success'; // Para ventas rápidas
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
      case 'EN_PROCESO':
        return 'Venta Rápida'; // Para ventas rápidas
      default:
        return estado;
    }
  };

  const renderComandaCard = (comanda: ComandaResponseDTO) => {
    const areaStatuses = comandasAreasStatus[comanda.id] || [];
    
    return (
      <OrderSummary 
        key={comanda.id}
        comanda={comanda}
        areaStatuses={areaStatuses.map((area) => ({
          areaId: String(area.areaId),
          areaName: area.areaNombre,
          status: area.estado,
          type: area.areaNombre.toLowerCase().includes('cocina') ? 'KITCHEN' : 'BAR'
        }))}
        showAddButton={true}
        onAddProducts={() => handleOpenAddProducts(comanda)}
      />
    );
  };

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
            <RestaurantIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {comanda.numeroMesa == null ? 'Venta rápida' : `Mesa ${comanda.numeroMesa}`}
            </Typography>
            <Chip
              label={getEstadoText(comanda.estado)}
              color={getEstadoColor(comanda.estado) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
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
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
        <ModernButton
          variant="outlined"
          size="small"
          icon="add"
          onClick={() => handleOpenAddProducts(comanda)}
        >
          Agregar productos
        </ModernButton>
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
    </Paper>
  );

  const renderMobileView = () => (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PointOfSaleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Caja
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
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
            <PointOfSaleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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
          <IconButton
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip
          label={`${comandas.length} Pendientes`}
          color="warning"
          icon={<TimerIcon />}
        />
        <Chip
          label={`$${comandas.reduce((sum, c) => sum + c.total, 0).toFixed(2)} Total`}
          color="primary"
          icon={<AttachMoneyIcon />}
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
              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {renderComandaCard(comanda)}
                {/* Action Buttons debajo de la tarjeta */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
                  <ModernButton
                    variant="outlined"
                    size="small"
                    icon="add"
                    onClick={() => handleOpenAddProducts(comanda)}
                  >
                    Agregar
                  </ModernButton>
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

      {/* Modal para agregar productos */}
      <ProductSelectorWizardModal
  open={addProductsModalOpen}
  onClose={() => setAddProductsModalOpen(false)}
  productos={productos}
  initialSelected={selectedProducts}
  onConfirm={async (selected) => {
    const items = Object.entries(selected)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }));
    if (!selectedComandaForAdd) return;
    if (items.length === 0) {
      showError('Selecciona productos', 'Debes seleccionar al menos un producto');
      return;
    }
    try {
      setLoading(true);
      // Si la comanda no está EN_PROCESO, cambiar su estado antes de agregar productos
      let comandaActualizada = selectedComandaForAdd;
      if (comandaActualizada.estado !== 'EN_PROCESO') {
        comandaActualizada = await updateComandaEstado(comandaActualizada.id, 'EN_PROCESO');
      }
      const response = await agregarItemsAComanda(comandaActualizada.id, items);
      setComandas(prev => prev.map(c => c.id === response.data.id ? response.data : c));
      showSuccess('Productos agregados', 'Productos agregados a la comanda');
      setAddProductsModalOpen(false);
      setSelectedProducts({});
    } catch {
      showError('Error al agregar productos', 'No se pudieron agregar los productos');
    } finally {
      setLoading(false);
    }
  }}
  loading={loadingProductos}
  confirmText="Agregar a comanda"
/>

      {/* Modal para venta rápida */}
      <ProductSelectorWizardModal
  open={quickSaleModalOpen}
  onClose={() => setQuickSaleModalOpen(false)}
  productos={quickSaleProductos}
  initialSelected={quickSaleProducts}
  onConfirm={async (selected) => {
    const items = Object.entries(selected)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }));
    if (items.length === 0) {
      showError('Selecciona productos', 'Debes seleccionar al menos un producto');
      return;
    }
    setCreatingQuickSale(true);
    try {
      // Usar mesaId: 9999 para venta rápida
      const response = await crearComandaAPI({ mesaId: 9999, items });
      setComandas(prev => [response, ...prev]);
      showSuccess('Venta rápida creada', 'Comanda rápida creada correctamente');
      setQuickSaleModalOpen(false);
      setQuickSaleProducts({});
    } catch {
      showError('Error en venta rápida', 'No se pudo crear la venta rápida');
    } finally {
      setCreatingQuickSale(false);
    }
  }}
  loading={quickSaleLoading || creatingQuickSale}
  confirmText={creatingQuickSale ? 'Creando...' : 'Crear venta'}
/>
      <Fab
        color="secondary"
        aria-label="venta-rapida"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenQuickSale}
      >
        <PointOfSale />
      </Fab>
    </>
    );
};

export default CashierViewPage;