import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Chip,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fab,
    Tooltip,
    Stack,
    Avatar,
    Badge,
    useTheme,
    useMediaQuery,
    Alert,
    Skeleton,
    Divider,
    Button,
    InputAdornment,
    Slider,
    FormControlLabel,
    Switch,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    Add as AddIcon,
    ShoppingCart as CartIcon,
    Star as StarIcon,
    LocalOffer as TagIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Sort as SortIcon,
    TrendingUp as TrendingIcon,
    Inventory as StockIcon,
} from '@mui/icons-material';
import { getProductos, getStockDisponibleProducto } from '../services/productoService';
import type { Producto } from '../types';
import { useOrder } from '../hooks/useOrder';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernModal from '../components/ModernModal';

interface ProductoWithStock extends Producto {
    stock?: number;
    categoria?: string;
    imagen?: string;
    destacado?: boolean;
}

const ProductList = () => {
    const { roles } = useAuth();
    const { addProductToOrder } = useOrder();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [productos, setProductos] = useState<ProductoWithStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState<string>('TODAS');
    const [filterPrecio, setFilterPrecio] = useState<[number, number]>([0, 1000]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'nombre' | 'precio' | 'stock'>('nombre');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

    useEffect(() => {
        loadProductos();
    }, []);

    const loadProductos = async () => {
        try {
            setLoading(true);
            const data = await getProductos();
            const productosWithStock = await Promise.all(
                (Array.isArray(data) ? data : []).map(async (producto) => {
                    try {
                        const stock = await getStockDisponibleProducto(producto.id);
                        return {
                            ...producto,
                            stock,
                            categoria: getCategoriaFromProducto(producto),
                            imagen: getImagenFromProducto(producto),
                            destacado: Math.random() > 0.7, // Simular productos destacados
                        };
                    } catch (err) {
                        return {
                            ...producto,
                            stock: 0,
                            categoria: getCategoriaFromProducto(producto),
                            imagen: getImagenFromProducto(producto),
                            destacado: false,
                        };
                    }
                })
            );
            setProductos(productosWithStock);
        } catch (err) {
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const getCategoriaFromProducto = (producto: Producto): string => {
        // Simular categorías basadas en el nombre del producto
        const nombre = producto.nombre.toLowerCase();
        if (nombre.includes('pizza') || nombre.includes('pasta')) return 'Pizzas y Pastas';
        if (nombre.includes('hamburguesa') || nombre.includes('burger')) return 'Hamburguesas';
        if (nombre.includes('bebida') || nombre.includes('agua') || nombre.includes('cola')) return 'Bebidas';
        if (nombre.includes('postre') || nombre.includes('dulce')) return 'Postres';
        if (nombre.includes('ensalada')) return 'Ensaladas';
        return 'Otros';
    };

    const getImagenFromProducto = (producto: Producto): string => {
        // Simular imágenes basadas en el nombre del producto
        const nombre = producto.nombre.toLowerCase();
        if (nombre.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop';
        if (nombre.includes('hamburguesa')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58e9?w=400&h=300&fit=crop';
        if (nombre.includes('bebida')) return 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop';
        if (nombre.includes('postre')) return 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop';
        return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop';
    };

    const getCategoriaColor = (categoria: string) => {
        switch (categoria) {
            case 'Pizzas y Pastas': return theme.palette.primary.main;
            case 'Hamburguesas': return theme.palette.warning.main;
            case 'Bebidas': return theme.palette.info.main;
            case 'Postres': return theme.palette.secondary.main;
            case 'Ensaladas': return theme.palette.success.main;
            default: return theme.palette.grey[500];
        }
    };

    const filteredAndSortedProductos = productos
        .filter(producto => {
            const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategoria = filterCategoria === 'TODAS' || producto.categoria === filterCategoria;
            const matchesPrecio = producto.precio >= filterPrecio[0] && producto.precio <= filterPrecio[1];
            const matchesAvailable = !showOnlyAvailable || (producto.stock && producto.stock > 0);
            const matchesFeatured = !showOnlyFeatured || producto.destacado;
            
            return matchesSearch && matchesCategoria && matchesPrecio && matchesAvailable && matchesFeatured;
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'nombre':
                    aValue = a.nombre.toLowerCase();
                    bValue = b.nombre.toLowerCase();
                    break;
                case 'precio':
                    aValue = a.precio;
                    bValue = b.precio;
                    break;
                case 'stock':
                    aValue = a.stock || 0;
                    bValue = b.stock || 0;
                    break;
                default:
                    aValue = a.nombre.toLowerCase();
                    bValue = b.nombre.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const categorias = ['TODAS', 'Pizzas y Pastas', 'Hamburguesas', 'Bebidas', 'Postres', 'Ensaladas', 'Otros'];
    const stats = {
        total: productos.length,
        disponibles: productos.filter(p => p.stock && p.stock > 0).length,
        destacados: productos.filter(p => p.destacado).length,
        categorias: new Set(productos.map(p => p.categoria)).size,
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando productos...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Menú de Productos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Explora nuestra selección de productos deliciosos
                </Typography>
            </Box>

            {/* Alertas */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Estadísticas */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Productos
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                {stats.disponibles}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Disponibles
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {stats.destacados}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Destacados
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                {stats.categorias}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Categorías
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
            </Grid>

            {/* Filtros y controles */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                value={filterCategoria}
                                onChange={(e) => setFilterCategoria(e.target.value)}
                                label="Categoría"
                            >
                                {categorias.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                label="Ordenar por"
                            >
                                <MenuItem value="nombre">Nombre</MenuItem>
                                <MenuItem value="precio">Precio</MenuItem>
                                <MenuItem value="stock">Stock</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                            <IconButton
                                onClick={() => setViewMode('grid')}
                                color={viewMode === 'grid' ? 'primary' : 'default'}
                            >
                                <ViewModuleIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                            >
                                <ViewListIcon />
                            </IconButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={loadProductos}
                                size="small"
                            >
                                Actualizar
                            </ModernButton>
                        </Box>
                    </Grid>
                </Grid>

                {/* Filtros adicionales */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showOnlyAvailable}
                                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                            />
                        }
                        label="Solo disponibles"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showOnlyFeatured}
                                onChange={(e) => setShowOnlyFeatured(e.target.checked)}
                            />
                        }
                        label="Solo destacados"
                    />
                    <Box sx={{ minWidth: 200 }}>
                        <Typography variant="body2" gutterBottom>
                            Rango de precio: ${filterPrecio[0]} - ${filterPrecio[1]}
                        </Typography>
                        <Slider
                            value={filterPrecio}
                            onChange={(e, newValue) => setFilterPrecio(newValue as [number, number])}
                            valueLabelDisplay="auto"
                            min={0}
                            max={1000}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Lista de productos */}
            {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {filteredAndSortedProductos.map((producto) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[8],
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={producto.imagen}
                                    alt={producto.nombre}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, flex: 1 }}>
                                            {producto.nombre}
                                        </Typography>
                                        {producto.destacado && (
                                            <StarIcon color="warning" sx={{ fontSize: 20 }} />
                                        )}
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                        {producto.descripcion}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Chip
                                            label={producto.categoria}
                                            size="small"
                                            sx={{
                                                bgcolor: getCategoriaColor(producto.categoria || ''),
                                                color: 'white',
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                            ${producto.precio.toFixed(2)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <StockIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {producto.stock !== undefined ? producto.stock : '...'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <ModernButton
                                        variant="primary"
                                        startIcon={<CartIcon />}
                                        onClick={() => addProductToOrder(producto)}
                                        disabled={producto.stock === 0}
                                        fullWidth
                                        size="small"
                                    >
                                        {producto.stock === 0 ? 'Sin stock' : 'Agregar'}
                                    </ModernButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Stack spacing={2}>
                    {filteredAndSortedProductos.map((producto) => (
                        <Card key={producto.id} sx={{ display: 'flex', p: 2 }}>
                            <CardMedia
                                component="img"
                                sx={{ width: 120, height: 120, borderRadius: 1, mr: 2 }}
                                image={producto.imagen}
                                alt={producto.nombre}
                            />
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {producto.nombre}
                                        </Typography>
                                        {producto.destacado && <StarIcon color="warning" />}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {producto.descripcion}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={producto.categoria}
                                            size="small"
                                            sx={{
                                                bgcolor: getCategoriaColor(producto.categoria || ''),
                                                color: 'white',
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Stock: {producto.stock !== undefined ? producto.stock : '...'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                        ${producto.precio.toFixed(2)}
                                    </Typography>
                                    <ModernButton
                                        variant="primary"
                                        startIcon={<CartIcon />}
                                        onClick={() => addProductToOrder(producto)}
                                        disabled={producto.stock === 0}
                                        size="small"
                                    >
                                        {producto.stock === 0 ? 'Sin stock' : 'Agregar'}
                                    </ModernButton>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Mensaje cuando no hay productos */}
            {filteredAndSortedProductos.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron productos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterCategoria !== 'TODAS' 
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay productos disponibles en el sistema'
                        }
                    </Typography>
                </Box>
            )}

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nuevo Producto"
                    onClick={() => {/* TODO: Implementar creación de producto */}}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000,
                    }}
                >
                    <AddIcon />
                </Fab>
            )}
        </Container>
    );
};

export default ProductList;