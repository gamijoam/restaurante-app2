import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Paper,
    Box,
    Grid,
    Chip,
    IconButton,
    Alert,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Fab,
    Tooltip,
    Divider,
    Stack,
    Avatar,
    Badge,
    useTheme,
    useMediaQuery,
    Skeleton,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    TableRestaurant as TableIcon,
    People as PeopleIcon,
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { getMesas, createMesa, updateMesaEstado, deleteMesa, type Mesa } from '../services/mesaService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernModal from '../components/ModernModal';

const GestionMesasPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<string>('TODOS');
    const [formData, setFormData] = useState<Partial<Mesa>>({
        numero: 0,
        capacidad: 4,
        estado: 'LIBRE',
        nombre: '',
        posicionX: 100,
        posicionY: 100
    });

    useEffect(() => {
        loadMesas();
    }, []);

    const loadMesas = async () => {
        try {
            setLoading(true);
            const data = await getMesas();
            setMesas(data);
        } catch (err) {
            setError('Error al cargar las mesas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mesa?: Mesa) => {
        if (mesa) {
            setEditingMesa(mesa);
            setFormData(mesa);
        } else {
            setEditingMesa(null);
            setFormData({
                numero: 0,
                capacidad: 4,
                estado: 'LIBRE',
                nombre: '',
                posicionX: 100,
                posicionY: 100
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMesa(null);
        setFormData({
            numero: 0,
            capacidad: 4,
            estado: 'LIBRE',
            nombre: '',
            posicionX: 100,
            posicionY: 100
        });
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingMesa) {
                await updateMesaEstado(editingMesa.id!, formData.estado!);
                setSuccess('Mesa actualizada correctamente');
            } else {
                await createMesa(formData as Omit<Mesa, 'id'>);
                setSuccess('Mesa creada correctamente');
            }
            handleCloseDialog();
            loadMesas();
        } catch (err) {
            setError('Error al guardar la mesa');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
            try {
                await deleteMesa(id);
                setSuccess('Mesa eliminada correctamente');
                loadMesas();
            } catch (err) {
                setError('Error al eliminar la mesa');
            }
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'LIBRE': return theme.palette.success.main;
            case 'OCUPADA': return theme.palette.warning.main;
            case 'RESERVADA': return theme.palette.info.main;
            case 'MANTENIMIENTO': return theme.palette.error.main;
            case 'LISTA_PARA_PAGAR': return theme.palette.secondary.main;
            default: return theme.palette.grey[500];
        }
    };

    const getEstadoTexto = (estado: string) => {
        switch (estado) {
            case 'LIBRE': return 'Libre';
            case 'OCUPADA': return 'Ocupada';
            case 'RESERVADA': return 'Reservada';
            case 'MANTENIMIENTO': return 'Mantenimiento';
            case 'LISTA_PARA_PAGAR': return 'Lista para pagar';
            default: return 'Desconocido';
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'LIBRE': return '🟢';
            case 'OCUPADA': return '🟡';
            case 'RESERVADA': return '🔵';
            case 'MANTENIMIENTO': return '🔴';
            case 'LISTA_PARA_PAGAR': return '🟣';
            default: return '⚪';
        }
    };

    const filteredMesas = mesas.filter(mesa => {
        const matchesSearch = mesa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            mesa.numero.toString().includes(searchTerm);
        const matchesFilter = filterEstado === 'TODOS' || mesa.estado === filterEstado;
        return matchesSearch && matchesFilter;
    });

    const getEstadisticas = () => {
        const total = mesas.length;
        const libre = mesas.filter(m => m.estado === 'LIBRE').length;
        const ocupada = mesas.filter(m => m.estado === 'OCUPADA').length;
        const reservada = mesas.filter(m => m.estado === 'RESERVADA').length;
        const mantenimiento = mesas.filter(m => m.estado === 'MANTENIMIENTO').length;
        const listaPagar = mesas.filter(m => m.estado === 'LISTA_PARA_PAGAR').length;

        return { total, libre, ocupada, reservada, mantenimiento, listaPagar };
    };

    const stats = getEstadisticas();

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando mesas...
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
                    Gestión de Mesas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra y configura las mesas del restaurante
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
                                Total Mesas
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                {stats.libre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Libres
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {stats.ocupada}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ocupadas
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                {stats.reservada}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Reservadas
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
            </Grid>

            {/* Filtros y búsqueda */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Buscar mesas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Filtrar por estado</InputLabel>
                            <Select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                label="Filtrar por estado"
                            >
                                <MenuItem value="TODOS">Todos los estados</MenuItem>
                                <MenuItem value="LIBRE">Libre</MenuItem>
                                <MenuItem value="OCUPADA">Ocupada</MenuItem>
                                <MenuItem value="RESERVADA">Reservada</MenuItem>
                                <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                                <MenuItem value="LISTA_PARA_PAGAR">Lista para pagar</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                            <ModernButton
                                variant="primary"
                                startIcon={<RefreshIcon />}
                                onClick={loadMesas}
                                size="small"
                            >
                                Actualizar
                            </ModernButton>
                            {isGerente && (
                                <ModernButton
                                    variant="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                    size="small"
                                >
                                    Nueva Mesa
                                </ModernButton>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Lista de mesas */}
            <Grid container spacing={2}>
                {filteredMesas.map((mesa) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={mesa.id}>
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
                                            bgcolor: getEstadoColor(mesa.estado),
                                            mr: 2,
                                            width: 48,
                                            height: 48,
                                        }}
                                    >
                                        <TableIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Mesa {mesa.numero}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {mesa.nombre || 'Sin nombre'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack spacing={1} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PeopleIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            Capacidad: {mesa.capacidad} personas
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            Posición: ({mesa.posicionX}, {mesa.posicionY})
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Chip
                                    label={getEstadoTexto(mesa.estado)}
                                    sx={{
                                        bgcolor: getEstadoColor(mesa.estado),
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-label': {
                                            px: 2,
                                        },
                                    }}
                                    icon={<span>{getEstadoIcon(mesa.estado)}</span>}
                                />
                            </CardContent>

                            {isGerente && (
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <ModernButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => handleOpenDialog(mesa)}
                                            sx={{ flex: 1 }}
                                        >
                                            Ver
                                        </ModernButton>
                                        <ModernButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleOpenDialog(mesa)}
                                            sx={{ flex: 1 }}
                                        >
                                            Editar
                                        </ModernButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDelete(mesa.id!)}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: 'error.light',
                                                    color: 'white',
                                                },
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </CardActions>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Mensaje cuando no hay mesas */}
            {filteredMesas.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <TableIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron mesas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterEstado !== 'TODOS' 
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay mesas configuradas en el sistema'
                        }
                    </Typography>
                </Box>
            )}

            {/* Modal para crear/editar mesa */}
            <ModernModal
                open={openDialog}
                onClose={handleCloseDialog}
                title={editingMesa ? 'Editar Mesa' : 'Nueva Mesa'}
                maxWidth="sm"
                actions={
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <ModernButton
                            variant="outlined"
                            onClick={handleCloseDialog}
                        >
                            Cancelar
                        </ModernButton>
                        <ModernButton
                            variant="primary"
                            onClick={handleSubmit}
                            loading={loading}
                        >
                            {editingMesa ? 'Actualizar' : 'Crear'}
                        </ModernButton>
                    </Box>
                }
            >
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Número de mesa"
                                type="number"
                                value={formData.numero}
                                onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) || 0 })}
                                required
                                disabled={!!editingMesa}
                                helperText={editingMesa ? "No se puede cambiar el número de mesa" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Capacidad"
                                type="number"
                                value={formData.capacidad}
                                onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 4 })}
                                required
                                inputProps={{ min: 1, max: 20 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre de la mesa"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Mesa del Rincón, Mesa VIP"
                                helperText="Opcional: nombre descriptivo para la mesa"
                            />
                        </Grid>
                        {editingMesa && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                        label="Estado"
                                    >
                                        <MenuItem value="LIBRE">Libre</MenuItem>
                                        <MenuItem value="OCUPADA">Ocupada</MenuItem>
                                        <MenuItem value="RESERVADA">Reservada</MenuItem>
                                        <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                                        <MenuItem value="LISTA_PARA_PAGAR">Lista para pagar</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Posición X"
                                type="number"
                                value={formData.posicionX}
                                onChange={(e) => setFormData({ ...formData, posicionX: parseInt(e.target.value) || 100 })}
                                helperText="Posición horizontal en el mapa"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Posición Y"
                                type="number"
                                value={formData.posicionY}
                                onChange={(e) => setFormData({ ...formData, posicionY: parseInt(e.target.value) || 100 })}
                                helperText="Posición vertical en el mapa"
                            />
                        </Grid>
                    </Grid>
                </Box>
            </ModernModal>

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nueva Mesa"
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

export default GestionMesasPage; 