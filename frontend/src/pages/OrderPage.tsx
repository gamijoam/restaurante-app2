import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Badge,
  Drawer,
  Fab,
  AppBar,
  Toolbar,
  Alert,
  TextField,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  Close,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { useOrder } from '../hooks/useOrder';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';
// import SkeletonLoader from '../components/SkeletonLoader';
import { getProductos } from '../services/productoService';
import { crearComandaConDivisionPorAreasAPI } from '../services/comandaService';
import { getComandaActivaPorMesa } from '../services/mesaService';
import type { Producto } from '../types';
import type { ComandaResponseDTO } from '../types';
import ProductCard from '../components/ProductCard';

interface OrderItem {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  itemPrincipalId?: number; // Para identificar si es un item principal o un adicional
}

const OrderPage: React.FC = () => {
    const { mesaId } = useParams<{ mesaId: string }>();
  const navigate = useNavigate();
  useAuth();
  const { showError, showSuccess } = useNotification();
  const { orderItems, addProductToOrder, updateItemQuantity, clearOrder, loadExistingOrder, activeComandaId } = useOrder();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar el tipo de selectedProducto a { principal: OrderItem, adicional: Producto | null } | null
  const [selectedAdicional, setSelectedAdicional] = useState<{ principal: OrderItem | null, adicional: Producto | null } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Eliminado: comandaActiva y setComandaActiva ya no se usan
  const [cantidades, setCantidades] = React.useState<{ [productoId: number]: number }>({});

    useEffect(() => {
        loadProductos();
        // Al montar, buscar comanda activa para la mesa
        if (mesaId) {
            getComandaActivaPorMesa(Number(mesaId))
                .then((comanda: ComandaResponseDTO) => {
                    if (comanda && comanda.items && comanda.estado !== 'PAGADA' && comanda.estado !== 'CANCELADA') {
                        // Eliminado: setComandaActiva(comanda);
                        // Usar la función del contexto para cargar la comanda activa
                        loadExistingOrder(comanda);
                    } else {
                        // Eliminado: setComandaActiva(null);
                        clearOrder();
                    }
                })
                .catch(() => {
                    // Eliminado: setComandaActiva(null);
                    clearOrder();
                });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mesaId]);

  const loadProductos = async () => {
            try {
      setLoading(true);
      setError(null);
      const response = await getProductos();
      setProductos(response);
    } catch {
      setError('Error al cargar los productos');
      showError('Error al cargar los productos', 'Intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  // const handleAddToCart = async (producto: Producto) => {
  //   try {
  //     await addProductToOrder(producto);
  //     showSuccess('Producto agregado', `${producto.nombre} agregado al pedido`);
  //   } catch {
  //     showError('Error al agregar producto', 'No se pudo agregar el producto al pedido');
  //   }
  // };

  // const handleRemoveFromCart = (productoId: number, itemPrincipalId?: number) => {
  //   removeItemFromOrder(productoId, itemPrincipalId);
  //   showSuccess('Producto removido', 'Producto removido del pedido');
  // };

  // const handleUpdateQuantity = (productoId: number, cantidad: number, itemPrincipalId?: number) => {
  //   updateItemQuantity(productoId, cantidad, itemPrincipalId);
  // };

  const getTotal = () => {
    return orderItems.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0);
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      showError('Pedido vacío', 'Agrega productos al pedido antes de guardar');
      return;
    }

    setSaving(true);
    try {
      const comandaData = {
        mesaId: parseInt(mesaId!),
        items: orderItems.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      };

      await crearComandaConDivisionPorAreasAPI(comandaData);
      showSuccess('Pedido guardado', 'El pedido se ha guardado exitosamente');
            clearOrder();
      navigate('/');
    } catch {
      showError('Error al guardar', 'No se pudo guardar el pedido');
    } finally {
      setSaving(false);
    }
  };

  // Reemplazar renderProductoCard por ProductCard
  const renderProductoCard = (producto: Producto) => (
    <ProductCard key={producto.id} producto={producto} />
  );

  // Nueva función para agrupar items principales y sus adicionales
  function groupOrderItems(orderItems: OrderItem[]) {
    const principales = orderItems.filter(item => !item.itemPrincipalId);
    return principales.map(principal => ({
      ...principal,
      adicionales: orderItems.filter(ad => ad.itemPrincipalId === principal.productoId)
    }));
  }

  const renderCartItem = (item: OrderItem, adicionales: OrderItem[] = []) => (
    <Paper
      key={item.productoId}
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {item.productoNombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${item.precioUnitario} c/u
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeComandaId === null ? (
            <TextField
              type="number"
              size="small"
              value={cantidades[item.productoId] || item.cantidad}
              onChange={e => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1) {
                  setCantidades(prev => ({ ...prev, [item.productoId]: val }));
                  updateItemQuantity(item.productoId, val, item.itemPrincipalId);
                }
              }}
              inputProps={{ min: 1, style: { width: 60 } }}
            />
          ) : (
            <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
              {item.cantidad}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Subtotal: ${item.cantidad * item.precioUnitario}
        </Typography>
      </Box>
      {/* Mostrar adicionales debajo del principal */}
      {adicionales.length > 0 && (
        <Box sx={{ mt: 1, ml: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Adicionales:</Typography>
          {adicionales.map(ad => (
            <Box key={ad.productoId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2">- {ad.productoNombre} (x{ad.cantidad})</Typography>
              <Typography variant="body2" color="text.secondary">${ad.precioUnitario}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );

  // Nueva función para agregar adicional
  // const handleAddAdicional = (producto: Producto, principal: OrderItem) => {
  //   addProductToOrder(producto, principal.productoId);
  //   showSuccess('Adicional agregado', `${producto.nombre} agregado como adicional de ${principal.productoNombre}`);
  //   setSelectedAdicional(null);
  // };

  const renderMobileView = () => (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mesa {mesaId} - Tomar Pedido
          </Typography>
          
          <Badge badgeContent={orderItems.length} color="error">
            <IconButton onClick={() => setCartOpen(true)}>
              <ShoppingCart />
            </IconButton>
          </Badge>
        </Toolbar>
      </AppBar>

      {/* Products Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Productos Disponibles
        </Typography>
        
        <Grid container spacing={2}>
          {productos.map(producto => (
            <Grid item xs={12} sm={6} key={producto.id}>
              {renderProductoCard(producto)}
                </Grid>
          ))}
                </Grid>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="cart"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setCartOpen(true)}
      >
        <Badge badgeContent={orderItems.length} color="error">
          <ShoppingCart />
        </Badge>
      </Fab>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pedido Actual
            </Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {orderItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No hay productos en el pedido
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              {groupOrderItems(orderItems).map(({ adicionales, ...principal }) => renderCartItem(principal, adicionales))}
            </Box>
          )}

          {orderItems.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <ModernButton
                variant="secondary"
                size="large"
                fullWidth
                onClick={() => setSelectedAdicional({ principal: null, adicional: null })}
                icon="add"
                sx={{ mb: 2 }}
              >
                Agregar adicional
              </ModernButton>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  Total: ${getTotal()}
                </Typography>
              </Box>
              <ModernButton
                variant="primary"
                size="large"
                fullWidth
                loading={saving}
                onClick={handleSaveOrder}
                icon="save"
              >
                Guardar Pedido
              </ModernButton>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );

  const renderDesktopView = () => (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Products Section */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Mesa {mesaId} - Tomar Pedido
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecciona los productos para el pedido
            </Typography>
          </Box>
          
          <ModernButton
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Volver
          </ModernButton>
        </Box>

        <Grid container spacing={3}>
          {productos.map(producto => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
              {renderProductoCard(producto)}
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Cart Section */}
      <Box sx={{ width: 400, borderLeft: '1px solid', borderColor: 'divider', p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Pedido Actual
        </Typography>

        {orderItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Carrito vacío
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agrega productos para comenzar el pedido
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, maxHeight: 400, overflow: 'auto' }}>
              {groupOrderItems(orderItems).map(({ adicionales, ...principal }) => renderCartItem(principal, adicionales))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
                Total: ${getTotal()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ModernButton
                variant="secondary"
                size="large"
                fullWidth
                onClick={() => setSelectedAdicional({ principal: null, adicional: null })}
                icon="add"
                sx={{ mb: 2 }}
              >
                Agregar adicional
              </ModernButton>
              <ModernButton
                variant="primary"
                size="large"
                fullWidth
                loading={saving}
                onClick={handleSaveOrder}
                icon="save"
              >
                Guardar Pedido
              </ModernButton>
              
              <ModernButton
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => setConfirmModalOpen(true)}
                icon="delete"
              >
                Limpiar Pedido
              </ModernButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando productos..." />;
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
          onClick={loadProductos}
        >
          Reintentar
        </ModernButton>
      </Box>
    );
  }

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Confirm Clear Modal */}
      <ModernModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Limpiar Pedido"
        message="¿Estás seguro de que quieres limpiar el pedido actual? Esta acción no se puede deshacer."
        variant="confirm"
        type="warning"
        onConfirm={() => {
          clearOrder();
          setConfirmModalOpen(false);
          showSuccess('Pedido limpiado', 'El pedido se ha limpiado exitosamente');
        }}
        confirmText="Limpiar"
        cancelText="Cancelar"
      />

      {/* Modal para seleccionar el producto adicional */}
      {selectedAdicional && (
        <ModernModal open={!!selectedAdicional} onClose={() => setSelectedAdicional(null)}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selecciona un producto para agregar como adicional
          </Typography>
          <Grid container spacing={2}>
            {productos.map(producto => (
              <Grid item xs={6} sm={4} key={producto.id}>
                <ModernCard
                  title={producto.nombre}
                  subtitle={producto.descripcion}
                  actions={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        type="number"
                        label="Cantidad"
                        size="small"
                        value={cantidades[producto.id] || 1}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1) {
                            setCantidades(prev => ({ ...prev, [producto.id]: val }));
                          }
                        }}
                        inputProps={{ min: 1, style: { width: 60 } }}
                      />
                      <ModernButton
                        variant="primary"
                        size="small"
                        icon="add"
                        onClick={() => {
                          const cantidad = cantidades[producto.id] || 1;
                          addProductToOrder(producto, undefined, cantidad);
                          showSuccess('Adicional agregado', `${producto.nombre} x${cantidad} agregado a la comanda`);
                          setSelectedAdicional(null);
                        }}
                      >
                        Agregar este producto
                      </ModernButton>
                    </Box>
                  }
                >
                  <Typography variant="body2">${producto.precio}</Typography>
                </ModernCard>
              </Grid>
            ))}
          </Grid>
        </ModernModal>
      )}
    </>
    );
};

export default OrderPage;