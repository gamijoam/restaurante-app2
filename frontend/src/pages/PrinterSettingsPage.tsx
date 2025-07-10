import type { SelectChangeEvent } from '@mui/material/Select';
import React, { useState, useEffect, useCallback } from 'react';
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
    Tooltip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Print as PrintIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Computer as ComputerIcon,
    Wifi as WifiIcon,
    Usb as UsbIcon,
    SettingsEthernet as SerialIcon,
    Restaurant as KitchenIcon,
    PointOfSale as CashierIcon,
    LocalBar as BarIcon,
    NetworkCheck as NetworkIcon,
} from '@mui/icons-material';
import {
    getAllPrinterConfigs,
    savePrinterConfig,
    deletePrinterConfig,
    type PrinterConfig
} from '../services/printerConfigService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';

const PrinterSettingsPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [configs, setConfigs] = useState<PrinterConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('TODOS');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [currentConfig, setCurrentConfig] = useState<Partial<PrinterConfig>>({
        role: 'COCINA',
        printerType: 'TCP',
        printerTarget: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<PrinterConfig | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllPrinterConfigs();
            setConfigs(data);
        } catch {
            setError('Error al cargar las configuraciones de impresoras');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent
    ) => {
        const { name, value } = e.target;
        setCurrentConfig(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentConfig.role || !currentConfig.printerType || !currentConfig.printerTarget) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        try {
            await savePrinterConfig(currentConfig as PrinterConfig);
            setSuccess('Configuración guardada exitosamente.');
            fetchConfigs();
            resetForm();
            setOpenDialog(false);
        } catch {
            setError('Error al guardar la configuración.');
        }
    };

    const handleEdit = (config: PrinterConfig) => {
        setCurrentConfig(config);
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
            try {
                await deletePrinterConfig(id);
                setSuccess('Configuración eliminada exitosamente.');
                fetchConfigs();
            } catch {
                setError('Error al eliminar la configuración.');
            }
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setCurrentConfig({
            role: 'COCINA',
            printerType: 'TCP',
            printerTarget: ''
        });
        setError(null);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'COCINA':
                return 'warning';
            case 'CAJA':
                return 'info';
            case 'BARRA':
                return 'success';
            default:
                return 'default';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'COCINA':
                return 'Cocina';
            case 'CAJA':
                return 'Caja';
            case 'BARRA':
                return 'Barra';
            default:
                return role;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'COCINA':
                return <KitchenIcon />;
            case 'CAJA':
                return <CashierIcon />;
            case 'BARRA':
                return <BarIcon />;
            default:
                return <SettingsIcon />;
        }
    };

    const getPrinterTypeColor = (type: string) => {
        switch (type) {
            case 'TCP':
                return 'primary';
            case 'USB':
                return 'success';
            case 'WIN':
                return 'info';
            case 'SERIAL':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getPrinterTypeText = (type: string) => {
        switch (type) {
            case 'TCP':
                return 'Red (TCP/IP)';
            case 'USB':
                return 'USB';
            case 'WIN':
                return 'Driver Windows';
            case 'SERIAL':
                return 'Serial';
            default:
                return type;
        }
    };

    const getPrinterTypeIcon = (type: string) => {
        switch (type) {
            case 'TCP':
                return <WifiIcon />;
            case 'USB':
                return <UsbIcon />;
            case 'WIN':
                return <ComputerIcon />;
            case 'SERIAL':
                return <SerialIcon />;
            default:
                return <SettingsIcon />;
        }
    };

    const filteredConfigs = configs.filter(config => {
        const matchesSearch = config.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            config.printerTarget.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            config.printerType.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'TODOS' || config.role === filterRole;
        
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: configs.length,
        cocina: configs.filter(c => c.role === 'COCINA').length,
        caja: configs.filter(c => c.role === 'CAJA').length,
        barra: configs.filter(c => c.role === 'BARRA').length,
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando configuraciones de impresoras...
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
                    Configuración de Impresoras
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra las configuraciones de impresoras para diferentes roles
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
                                Total Configuraciones
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {stats.cocina}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cocina
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                {stats.caja}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Caja
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                {stats.barra}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Barra
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
                            placeholder="Buscar configuraciones..."
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
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={filterRole}
                                onChange={(e: SelectChangeEvent) => setFilterRole(e.target.value)}
                                label="Rol"
                            >
                                <MenuItem value="TODOS">Todos los roles</MenuItem>
                                <MenuItem value="COCINA">Cocina</MenuItem>
                                <MenuItem value="CAJA">Caja</MenuItem>
                                <MenuItem value="BARRA">Barra</MenuItem>
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
                                <PrintIcon />
                            </IconButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchConfigs}
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
                            onClick={() => {
                                resetForm();
                                setOpenDialog(true);
                            }}
                            fullWidth
                            disabled={!isGerente}
                        >
                            Nueva Config
                        </ModernButton>
                    </Grid>
                </Grid>
            </Box>

            {/* Vista de tabla */}
            {viewMode === 'table' ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Configuración</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rol</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tipo</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Destino</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredConfigs.map((config) => (
                                <TableRow key={config.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <PrintIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    Config #{config.id}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {config.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getRoleText(config.role)}
                                            color={getRoleColor(config.role) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                            size="small"
                                            icon={getRoleIcon(config.role)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getPrinterTypeText(config.printerType)}
                                            color={getPrinterTypeColor(config.printerType) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                            size="small"
                                            icon={getPrinterTypeIcon(config.printerType)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {config.printerTarget}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedConfig(config);
                                                        setOpenDetailModal(true);
                                                    }}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {isGerente && (
                                                <>
                                                    <Tooltip title="Editar configuración">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(config)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar configuración">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(config.id!)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                /* Vista de cards */
                <Grid container spacing={2}>
                    {filteredConfigs.map((config) => (
                        <Grid item xs={12} sm={6} md={4} key={config.id}>
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
                                            <PrintIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                Config #{config.id}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {config.id}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SettingsIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {getPrinterTypeText(config.printerType)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <NetworkIcon fontSize="small" color="action" />
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                {config.printerTarget}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Chip
                                            label={getRoleText(config.role)}
                                            color={getRoleColor(config.role) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                            size="small"
                                            icon={getRoleIcon(config.role)}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            Tipo: {config.printerType}
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
                                                setSelectedConfig(config);
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
                                                    onClick={() => handleEdit(config)}
                                                    sx={{ flex: 1 }}
                                                >
                                                    Editar
                                                </ModernButton>
                                                <ModernButton
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDelete(config.id!)}
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
                    ))}
                </Grid>
            )}

            {/* Mensaje cuando no hay configuraciones */}
            {filteredConfigs.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PrintIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron configuraciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterRole !== 'TODOS'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay configuraciones de impresoras registradas'
                        }
                    </Typography>
                </Box>
            )}

            {/* Modal de detalles de la configuración */}
            <ModernModal
                open={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                title={`Detalles de Configuración #${selectedConfig?.id}`}
                maxWidth="sm"
            >
                {selectedConfig && (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedConfig.id}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Rol
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {getRoleText(selectedConfig.role)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Tipo de Conexión
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {getPrinterTypeText(selectedConfig.printerType)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Destino
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                    {selectedConfig.printerTarget}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Configuración:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={getRoleText(selectedConfig.role)}
                                        color={getRoleColor(selectedConfig.role) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                        size="small"
                                        icon={getRoleIcon(selectedConfig.role)}
                                    />
                                    <Chip
                                        label={getPrinterTypeText(selectedConfig.printerType)}
                                        color={getPrinterTypeColor(selectedConfig.printerType) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                        size="small"
                                        icon={getPrinterTypeIcon(selectedConfig.printerType)}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </ModernModal>

            {/* Modal de crear/editar configuración */}
            <Dialog 
                open={openDialog} 
                onClose={() => {
                    setOpenDialog(false);
                    resetForm();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon />
                        {isEditing ? 'Editar Configuración' : 'Nueva Configuración'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                name="role"
                                value={currentConfig.role || 'COCINA'}
                                onChange={handleInputChange}
                                label="Rol"
                            >
                                <MenuItem value="COCINA">Cocina</MenuItem>
                                <MenuItem value="CAJA">Caja</MenuItem>
                                <MenuItem value="BARRA">Barra</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Conexión</InputLabel>
                            <Select
                                name="printerType"
                                value={currentConfig.printerType || 'TCP'}
                                onChange={handleInputChange}
                                label="Tipo de Conexión"
                            >
                                <MenuItem value="TCP">Red (TCP/IP)</MenuItem>
                                <MenuItem value="USB">USB</MenuItem>
                                <MenuItem value="WIN">Driver de Windows</MenuItem>
                                <MenuItem value="SERIAL">Serial</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="printerTarget"
                            label="Destino (ej: 192.168.1.100:9100 o EPSON-TM-T20)"
                            value={currentConfig.printerTarget || ''}
                            onChange={handleInputChange}
                            fullWidth
                                    helperText="Para TCP: IP:Puerto, Para USB: Nombre del dispositivo, Para WIN: Nombre de la impresora"
                        />
                    </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDialog(false);
                        resetForm();
                    }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                            {isEditing ? 'Actualizar' : 'Guardar'}
                        </Button>
                </DialogActions>
            </Dialog>

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nueva Configuración"
                    onClick={() => {
                        resetForm();
                        setOpenDialog(true);
                    }}
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

export default PrinterSettingsPage;