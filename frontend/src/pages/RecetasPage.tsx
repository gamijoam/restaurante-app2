import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Alert,
    Chip,
    IconButton,
    useTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Stack,
    Divider,
    Tooltip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Switch,
    FormControlLabel,
    Badge,
    LinearProgress,
    Slider,
    Autocomplete,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Snackbar,
} from '@mui/material';
import { 
    Restaurant as RestaurantIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Email as EmailIcon,
    Inventory as InventoryIcon,
    LocalOffer as OfferIcon,
    Star as StarIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Settings as SettingsIcon,
    MoreVert as MoreIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Schedule as ScheduleIcon,
    AttachMoney as MoneyIcon,
    MenuBook as RecipeIcon,
    Add as AddProductIcon,
    Kitchen as KitchenIcon,
    Scale as ScaleIcon,
    Calculate as CalculateIcon,
    ListAlt as ListIcon,
    Assignment as AssignmentIcon,
    Book as BookIcon,
    Science as ScienceIcon,
    Build as BuildIcon,
    Create as CreateIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Check as CheckIcon2,
    Error as ErrorIcon,
    Success as SuccessIcon,
} from '@mui/icons-material';
import { getProductos, createProducto } from '../services/productoService';
import type { Producto } from '../types';
import { getIngredientes, type Ingrediente } from '../services/ingredienteService';
import { getRecetasByProducto, actualizarRecetaProducto, agregarIngredienteAProducto, actualizarReceta, deleteReceta, type RecetaIngrediente } from '../services/recetaService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';

const RecetasPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    // Estados principales
    const [productos, setProductos] = useState<Producto[]>([]);
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [recetas, setRecetas] = useState<RecetaIngrediente[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal de añadir ingrediente
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReceta, setEditingReceta] = useState<RecetaIngrediente | null>(null);
    const [formData, setFormData] = useState<RecetaIngrediente>({
        ingredienteId: 0,
        cantidad: 0,
        unidad: ''
    });
    
    // Estados para el modal de crear producto
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [newProductData, setNewProductData] = useState<Omit<Producto, 'id'>>({
        nombre: '',
        descripcion: '',
        precio: 0
    });
    
    // Estados para feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    
    // Estado para búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'stepper' | 'cards'>('stepper');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productosData, ingredientesData] = await Promise.all([
                getProductos(),
                getIngredientes()
            ]);
            setProductos(productosData);
            setIngredientes(ingredientesData);
        } catch (err) {
            showSnackbar('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProductoSelect = async (producto: Producto) => {
        setSelectedProducto(producto);
        setActiveStep(1);
        try {
            const recetasData = await getRecetasByProducto(producto.id!);
            setRecetas(recetasData);
            showSnackbar(`Receta cargada para: ${producto.nombre}`, 'success');
        } catch (err) {
            setRecetas([]);
            showSnackbar('No se encontró receta para este producto', 'error');
        }
    };

    const handleOpenDialog = (receta?: RecetaIngrediente) => {
        if (receta) {
            setEditingReceta(receta);
            setFormData(receta);
        } else {
            setEditingReceta(null);
            setFormData({
                ingredienteId: 0,
                cantidad: 0,
                unidad: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingReceta(null);
        setFormData({
            ingredienteId: 0,
            cantidad: 0,
            unidad: ''
        });
        setError(null);
        setSuccess(null);
    };

    const handleOpenProductDialog = () => {
        setNewProductData({
            nombre: '',
            descripcion: '',
            precio: 0
        });
        setOpenProductDialog(true);
    };

    const handleCloseProductDialog = () => {
        setOpenProductDialog(false);
        setNewProductData({
            nombre: '',
            descripcion: '',
            precio: 0
        });
        setError(null);
    };

    const handleCreateProduct = async () => {
        if (!newProductData.nombre.trim()) {
            setError('El nombre del producto es obligatorio');
            return;
        }

        if (newProductData.precio <= 0) {
            setError('El precio debe ser mayor a 0');
            return;
        }

        try {
            const nuevoProducto = await createProducto(newProductData);
            setProductos([...productos, nuevoProducto]);
            showSnackbar(`Producto "${nuevoProducto.nombre}" creado exitosamente`, 'success');
            handleCloseProductDialog();
            
            // Opcional: seleccionar automáticamente el nuevo producto
            handleProductoSelect(nuevoProducto);
        } catch (err) {
            showSnackbar('Error al crear el producto', 'error');
        }
    };

    const handleSubmit = async () => {
        if (!selectedProducto || !formData.ingredienteId || formData.ingredienteId === 0) {
            setError('Debes seleccionar un ingrediente válido');
            return;
        }

        if (!formData.cantidad || formData.cantidad <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        try {
            let nuevasRecetas = [...recetas];
            
            if (editingReceta) {
                // Actualizar receta existente
                const updatedReceta = await actualizarReceta(editingReceta.id!, formData);
                nuevasRecetas = nuevasRecetas.map(r => 
                    r.id === editingReceta.id ? updatedReceta : r
                );
                showSnackbar('Receta actualizada correctamente', 'success');
            } else {
                // Añadir nueva receta
                const nuevaReceta = await agregarIngredienteAProducto(selectedProducto.id!, formData);
                nuevasRecetas.push(nuevaReceta);
                showSnackbar('Ingrediente añadido a la receta', 'success');
            }
            
            setRecetas(nuevasRecetas);
            handleCloseDialog();
        } catch (err) {
            showSnackbar('Error al guardar la receta', 'error');
        }
    };

    const handleDeleteReceta = async (recetaId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente de la receta?')) {
            try {
                await deleteReceta(recetaId);
                setRecetas(recetas.filter(r => r.id !== recetaId));
                showSnackbar('Ingrediente eliminado de la receta', 'success');
            } catch (err) {
                showSnackbar('Error al eliminar el ingrediente', 'error');
            }
        }
    };

    const getIngredienteNombre = (receta: RecetaIngrediente) => {
        const ingrediente = ingredientes.find(i => i.id === receta.ingredienteId);
        return ingrediente ? ingrediente.nombre : 'Ingrediente no encontrado';
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: productos.length,
        conReceta: productos.filter(p => p.id && recetas.some(r => r.productoId === p.id)).length,
        sinReceta: productos.filter(p => p.id && !recetas.some(r => r.productoId === p.id)).length,
        ingredientes: ingredientes.length,
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando recetas...
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
                Gestión de Recetas
            </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra las recetas y ingredientes de los productos
                </Typography>
            </Box>

            {/* Alertas */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
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
                                {stats.conReceta}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Con Receta
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {stats.sinReceta}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sin Receta
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                {stats.ingredientes}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ingredientes
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
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                            <IconButton
                                onClick={() => setViewMode('stepper')}
                                color={viewMode === 'stepper' ? 'primary' : 'default'}
                            >
                                <AssignmentIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('cards')}
                                color={viewMode === 'cards' ? 'primary' : 'default'}
                            >
                                <RestaurantIcon />
                            </IconButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={loadData}
                                size="small"
                            >
                                Actualizar
                            </ModernButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <ModernButton
                            variant="primary"
                            startIcon={<AddProductIcon />}
                            onClick={handleOpenProductDialog}
                            fullWidth
                            disabled={!isGerente}
                        >
                            Nuevo Producto
                        </ModernButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <ModernButton
                            variant="outlined"
                            startIcon={<RecipeIcon />}
                            onClick={() => setActiveStep(0)}
                            fullWidth
                        >
                            Ver Productos
                        </ModernButton>
                    </Grid>
                </Grid>
            </Box>

            {/* Vista de Stepper */}
            {viewMode === 'stepper' ? (
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step>
                            <StepLabel>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RestaurantIcon />
                                    <Typography variant="h6">Seleccionar Producto</Typography>
                                </Box>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Selecciona un producto para gestionar su receta:
                                    </Typography>
                        <Grid container spacing={2}>
                            {filteredProductos.map((producto) => (
                                <Grid item xs={12} sm={6} md={4} key={producto.id}>
                                    <Card 
                                        sx={{ 
                                            cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                            '&:hover': { 
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: theme.shadows[8],
                                                        },
                                                        border: selectedProducto?.id === producto.id ? 2 : 1,
                                                        borderColor: selectedProducto?.id === producto.id ? 'primary.main' : 'divider',
                                        }}
                                        onClick={() => handleProductoSelect(producto)}
                                    >
                                        <CardContent>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                                {producto.nombre.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {producto.nombre}
                                            </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                ${producto.precio}
                                            </Typography>
                                                            </Box>
                                                        </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {producto.descripcion}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <ModernButton
                                        variant="primary"
                                        onClick={() => setActiveStep(1)}
                                        disabled={!selectedProducto}
                                    >
                                        Continuar
                                    </ModernButton>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <KitchenIcon />
                                    <Typography variant="h6">Gestionar Receta</Typography>
                                </Box>
                            </StepLabel>
                            <StepContent>
                                {selectedProducto && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Receta de: {selectedProducto.nombre}
                            </Typography>
                                            <ModernButton
                                                variant="primary"
                                                startIcon={<AddIcon />}
                                                onClick={() => handleOpenDialog()}
                                            >
                                                Añadir Ingrediente
                                            </ModernButton>
                        </Box>
                        
                                        {recetas.length > 0 ? (
                                            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ingrediente</TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cantidad</TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Unidad</TableCell>
                                                            <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                {recetas.map((receta) => (
                                                            <TableRow key={receta.id} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {getIngredienteNombre(receta)}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2">
                                                                        {receta.cantidad}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={receta.unidad}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                                        <Tooltip title="Editar">
                                            <IconButton
                                                                                size="small"
                                                onClick={() => handleOpenDialog(receta)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteReceta(receta.id!)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <KitchenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                                    No hay ingredientes en la receta
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Añade ingredientes para crear la receta
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </StepContent>
                        </Step>
                    </Stepper>
                </Paper>
            ) : (
                /* Vista de Cards */
                <Grid container spacing={2}>
                    {filteredProductos.map((producto) => (
                        <Grid item xs={12} sm={6} md={4} key={producto.id}>
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
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                mr: 2,
                                                width: 48,
                                                height: 48,
                                            }}
                                        >
                                            {producto.nombre.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {producto.nombre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ${producto.precio}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {producto.descripcion}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip
                                            label="Ver Receta"
                                            color="primary"
                                            size="small"
                                            icon={<RecipeIcon />}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            ID: {producto.id}
                                        </Typography>
                                    </Box>
                    </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <ModernButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<RecipeIcon />}
                                            onClick={() => handleProductoSelect(producto)}
                                            sx={{ flex: 1 }}
                                        >
                                            Ver Receta
                                        </ModernButton>
                                        {isGerente && (
                                            <ModernButton
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                sx={{ flex: 1 }}
                                            >
                                                Editar
                                            </ModernButton>
                                        )}
                                    </Box>
                    </CardActions>
                </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Mensaje cuando no hay productos */}
            {filteredProductos.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron productos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay productos registrados en el sistema'
                        }
                    </Typography>
                </Box>
            )}

            {/* Modal de crear producto */}
            <Dialog 
                open={openProductDialog} 
                onClose={handleCloseProductDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddProductIcon />
                    Crear Nuevo Producto
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre del Producto"
                        value={newProductData.nombre}
                        onChange={(e) => setNewProductData({ ...newProductData, nombre: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={newProductData.descripcion}
                        onChange={(e) => setNewProductData({ ...newProductData, descripcion: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Precio"
                        type="number"
                        value={newProductData.precio}
                        onChange={(e) => setNewProductData({ ...newProductData, precio: parseFloat(e.target.value) })}
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProductDialog}>Cancelar</Button>
                    <Button onClick={handleCreateProduct} variant="contained">
                        Crear Producto
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de añadir/editar ingrediente */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KitchenIcon />
                        {editingReceta ? 'Editar Ingrediente' : 'Añadir Ingrediente'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ingrediente</InputLabel>
                        <Select
                            value={formData.ingredienteId}
                            onChange={(e) => setFormData({ ...formData, ingredienteId: e.target.value as number })}
                            label="Ingrediente"
                        >
                            {ingredientes.map((ingrediente) => (
                                <MenuItem key={ingrediente.id} value={ingrediente.id}>
                                    {ingrediente.nombre} ({ingrediente.unidad})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Cantidad"
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: parseFloat(e.target.value) })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Unidad"
                        value={formData.unidad}
                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingReceta ? 'Actualizar' : 'Añadir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nuevo Producto"
                    onClick={handleOpenProductDialog}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000,
                    }}
                >
                    <AddProductIcon />
                </Fab>
            )}
        </Container>
    );
};

export default RecetasPage; 