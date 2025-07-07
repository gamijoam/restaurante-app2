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
    InputAdornment,
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
} from '@mui/icons-material';
import { getIngredientes, createIngrediente, updateIngrediente, deleteIngrediente, type Ingrediente, ingresarStockIngrediente } from '../services/ingredienteService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';

const IngredientesPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStock, setFilterStock] = useState<string>('TODOS');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null);
    const [selectedIngrediente, setSelectedIngrediente] = useState<Ingrediente | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [formData, setFormData] = useState<Ingrediente>({
        nombre: '',
        stock: 0,
        unidad: '',
        descripcion: '',
        precioUnitario: 0
    });
    const [openStockDialog, setOpenStockDialog] = useState(false);
    const [stockForm, setStockForm] = useState<{ ingredienteId: number; cantidad: number }>({ ingredienteId: 0, cantidad: 0 });

    useEffect(() => {
        loadIngredientes();
    }, []);

    const loadIngredientes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getIngredientes();
            setIngredientes(data);
        } catch (err) {
            setError('Error al cargar los ingredientes');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (ingrediente?: Ingrediente) => {
        if (ingrediente) {
            setEditingIngrediente(ingrediente);
            setFormData(ingrediente);
        } else {
            setEditingIngrediente(null);
            setFormData({
                nombre: '',
                stock: 0,
                unidad: '',
                descripcion: '',
                precioUnitario: 0
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingIngrediente(null);
        setFormData({
            nombre: '',
            stock: 0,
            unidad: '',
            descripcion: '',
            precioUnitario: 0
        });
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingIngrediente) {
                await updateIngrediente(editingIngrediente.id!, formData);
                setSuccess('Ingrediente actualizado correctamente');
            } else {
                await createIngrediente(formData);
                setSuccess('Ingrediente creado correctamente');
            }
            handleCloseDialog();
            loadIngredientes();
        } catch (err) {
            setError('Error al guardar el ingrediente');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
            try {
                await deleteIngrediente(id);
                setSuccess('Ingrediente eliminado correctamente');
                loadIngredientes();
            } catch (err) {
                setError('Error al eliminar el ingrediente');
            }
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { status: 'agotado', color: 'error' as const };
        if (stock <= 10) return { status: 'bajo', color: 'warning' as const };
        return { status: 'disponible', color: 'success' as const };
    };

    const getStockText = (stock: number) => {
        if (stock <= 0) return 'Agotado';
        if (stock <= 10) return 'Stock Bajo';
        return 'Disponible';
    };

    const filteredIngredientes = ingredientes.filter(ingrediente => {
        const matchesSearch = ingrediente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ingrediente.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        
        const stockStatus = getStockStatus(ingrediente.stock);
        const matchesStock = filterStock === 'TODOS' || 
                           (filterStock === 'AGOTADOS' && stockStatus.status === 'agotado') ||
                           (filterStock === 'BAJOS' && stockStatus.status === 'bajo') ||
                           (filterStock === 'DISPONIBLES' && stockStatus.status === 'disponible');
        
        return matchesSearch && matchesStock;
    });

    const stats = {
        total: ingredientes.length,
        disponibles: ingredientes.filter(i => getStockStatus(i.stock).status === 'disponible').length,
        bajos: ingredientes.filter(i => getStockStatus(i.stock).status === 'bajo').length,
        agotados: ingredientes.filter(i => getStockStatus(i.stock).status === 'agotado').length,
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando ingredientes...
                    </Typography>
                </Box>
            </Container>
        );
    }

    const selectedUnidad = ingredientes.find(i => i.id === stockForm.ingredienteId)?.unidad || '';

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
                    Gestión de Ingredientes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra el inventario de ingredientes del restaurante
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
                                Total Ingredientes
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
                                {stats.bajos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Stock Bajo
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                                {stats.agotados}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Agotados
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
                            placeholder="Buscar ingredientes..."
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
                            <InputLabel>Estado de Stock</InputLabel>
                            <Select
                                value={filterStock}
                                onChange={(e) => setFilterStock(e.target.value)}
                                label="Estado de Stock"
                            >
                                <MenuItem value="TODOS">Todos</MenuItem>
                                <MenuItem value="DISPONIBLES">Disponibles</MenuItem>
                                <MenuItem value="BAJOS">Stock Bajo</MenuItem>
                                <MenuItem value="AGOTADOS">Agotados</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                            <IconButton
                                onClick={() => setViewMode('table')}
                                color={viewMode === 'table' ? 'primary' : 'default'}
                            >
                                <ViewIcon />
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
                                onClick={loadIngredientes}
                                size="small"
                            >
                                Actualizar
                            </ModernButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <ModernButton
                            variant="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                            fullWidth
                            disabled={!isGerente}
                        >
                            Nuevo
                        </ModernButton>
                    </Grid>
                    {isGerente && (
                        <Grid item xs={12} sm={6} md={2}>
                            <ModernButton
                                variant="primary"
                                startIcon={<InventoryIcon />}
                                onClick={() => setOpenStockDialog(true)}
                                fullWidth
                            >
                                Ingresar Stock
                            </ModernButton>
                        </Grid>
                    )}
                </Grid>
            </Box>

            {/* Vista de tabla */}
            {viewMode === 'table' ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ingrediente</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Stock</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Unidad</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Descripción</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                            {filteredIngredientes.map((ingrediente) => {
                                const stockStatus = getStockStatus(ingrediente.stock);
                                return (
                                    <TableRow key={ingrediente.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {ingrediente.nombre.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {ingrediente.nombre}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {ingrediente.stock}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ingrediente.unidad}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStockText(ingrediente.stock)}
                                                color={stockStatus.color}
                                                size="small"
                                                icon={stockStatus.status === 'agotado' ? <WarningIcon /> : 
                                                      stockStatus.status === 'bajo' ? <InfoIcon /> : <CheckIcon />}
                                            />
                                        </TableCell>
                                <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {ingrediente.descripcion}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedIngrediente(ingrediente);
                                                            setOpenDetailModal(true);
                                                        }}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {isGerente && (
                                                    <>
                                                        <Tooltip title="Editar ingrediente">
                                    <IconButton
                                                                size="small"
                                        onClick={() => handleOpenDialog(ingrediente)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar ingrediente">
                                    <IconButton
                                                                size="small"
                                        color="error"
                                        onClick={() => handleDelete(ingrediente.id!)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                </TableCell>
                            </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            ) : (
                /* Vista de cards */
                <Grid container spacing={2}>
                    {filteredIngredientes.map((ingrediente) => {
                        const stockStatus = getStockStatus(ingrediente.stock);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={ingrediente.id}>
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
                                                    bgcolor: stockStatus.color === 'error' ? 'error.main' : 
                                                             stockStatus.color === 'warning' ? 'warning.main' : 'success.main',
                                                    mr: 2,
                                                    width: 48,
                                                    height: 48,
                                                }}
                                            >
                                                {ingrediente.nombre.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {ingrediente.nombre}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {ingrediente.unidad}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Stack spacing={1} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <InventoryIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    Stock: {ingrediente.stock}
                                                </Typography>
                                            </Box>
                                            {ingrediente.descripcion && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <InfoIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {ingrediente.descripcion}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Chip
                                                label={getStockText(ingrediente.stock)}
                                                color={stockStatus.color}
                                                size="small"
                                                icon={stockStatus.status === 'agotado' ? <WarningIcon /> : 
                                                      stockStatus.status === 'bajo' ? <InfoIcon /> : <CheckIcon />}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {ingrediente.id}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                            <ModernButton
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ViewIcon />}
                                                onClick={() => {
                                                    setSelectedIngrediente(ingrediente);
                                                    setOpenDetailModal(true);
                                                }}
                                                sx={{ flex: 1 }}
                                            >
                                                Ver
                                            </ModernButton>
                                            {isGerente && (
                                                <>
                                                    <ModernButton
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleOpenDialog(ingrediente)}
                                                        sx={{ flex: 1 }}
                                                    >
                                                        Editar
                                                    </ModernButton>
                                                    <ModernButton
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleDelete(ingrediente.id!)}
                                                        sx={{ flex: 1 }}
                                                        color="error"
                                                    >
                                                        Eliminar
                                                    </ModernButton>
                                                </>
                                            )}
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Mensaje cuando no hay ingredientes */}
            {filteredIngredientes.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron ingredientes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterStock !== 'TODOS'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay ingredientes registrados en el sistema'
                        }
                    </Typography>
                </Box>
            )}

            {/* Modal de detalles del ingrediente */}
            <ModernModal
                open={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                title={`Detalles de ${selectedIngrediente?.nombre}`}
                maxWidth="sm"
            >
                {selectedIngrediente && (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedIngrediente.id}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Nombre
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedIngrediente.nombre}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Stock
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedIngrediente.stock}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Unidad
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedIngrediente.unidad}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Estado de Stock
                                </Typography>
                                <Chip
                                    label={getStockText(selectedIngrediente.stock)}
                                    color={getStockStatus(selectedIngrediente.stock).color}
                                    icon={getStockStatus(selectedIngrediente.stock).status === 'agotado' ? <WarningIcon /> : 
                                          getStockStatus(selectedIngrediente.stock).status === 'bajo' ? <InfoIcon /> : <CheckIcon />}
                                />
                            </Grid>
                            {selectedIngrediente.descripcion && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Descripción
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {selectedIngrediente.descripcion}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}
            </ModernModal>

            {/* Modal de crear/editar ingrediente */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RestaurantIcon />
                    {editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
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
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Precio Unitario"
                        type="number"
                        value={formData.precioUnitario}
                        onChange={e => setFormData({ ...formData, precioUnitario: parseFloat(e.target.value) })}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingIngrediente ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de ingreso de stock */}
            <ModernModal open={openStockDialog} onClose={() => setOpenStockDialog(false)} title="Ingresar Stock a Ingrediente">
                <FormControl fullWidth margin="normal">
                    <InputLabel>Ingrediente</InputLabel>
                    <Select
                        value={stockForm.ingredienteId}
                        label="Ingrediente"
                        onChange={e => setStockForm({ ...stockForm, ingredienteId: Number(e.target.value) })}
                    >
                        {ingredientes.map(ing => (
                            <MenuItem key={ing.id} value={ing.id}>{ing.nombre}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Buscar la unidad del ingrediente seleccionado */}
                <TextField
                    label="Cantidad a ingresar"
                    type="number"
                    value={stockForm.cantidad}
                    onChange={e => setStockForm({ ...stockForm, cantidad: parseFloat(e.target.value) })}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                        endAdornment: selectedUnidad ? (
                          <InputAdornment position="end">{selectedUnidad}</InputAdornment>
                        ) : null
                      }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <ModernButton
                        variant="primary"
                        onClick={async () => {
                            if (!stockForm.ingredienteId || stockForm.cantidad <= 0) return;
                            await ingresarStockIngrediente(stockForm.ingredienteId, stockForm.cantidad);
                            setOpenStockDialog(false);
                            setStockForm({ ingredienteId: 0, cantidad: 0 });
                            loadIngredientes();
                        }}
                    >
                        Confirmar Ingreso
                    </ModernButton>
                </Box>
            </ModernModal>

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nuevo Ingrediente"
                    onClick={() => handleOpenDialog()}
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

export default IngredientesPage; 