import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    Add as AddIcon,
    Receipt as ReceiptIcon,
    AttachMoney as MoneyIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Sort as SortIcon,
    TrendingUp as TrendingIcon,
    CalendarToday as CalendarIcon,
    Print as PrintIcon,
    Email as EmailIcon,
    Share as ShareIcon,
    Assessment as AssessmentIcon,
    AccountBalance as BankIcon,
} from '@mui/icons-material';
import type { FacturaResponseDTO } from '../types';
import { getFacturas, descargarFacturaPdf } from '../services/facturaService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernModal from '../components/ModernModal';

interface FacturaWithStats extends FacturaResponseDTO {
    status?: 'paid' | 'pending' | 'overdue';
    priority?: 'high' | 'medium' | 'low';
}

const FacturacionPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [facturas, setFacturas] = useState<FacturaWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('TODOS');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [sortBy, setSortBy] = useState<'fecha' | 'total' | 'id'>('fecha');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedFactura, setSelectedFactura] = useState<FacturaWithStats | null>(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);

    useEffect(() => {
        loadFacturas();
    }, []);

    const loadFacturas = async (inicio?: string, fin?: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getFacturas(inicio, fin);
            const facturasArray = (Array.isArray(data) ? data : []).map(factura => ({
                ...factura,
                status: getStatusFromFactura(factura),
                priority: getPriorityFromFactura(factura),
            }));
            setFacturas(facturasArray);
        } catch (err) {
            setError('Error al cargar las facturas');
        } finally {
            setLoading(false);
        }
    };

    const getStatusFromFactura = (factura: FacturaResponseDTO): 'paid' | 'pending' | 'overdue' => {
        // Simular estados basados en la fecha y total
        const fecha = new Date(factura.fechaEmision);
        const hoy = new Date();
        const diasDiferencia = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
        
        if (factura.total > 100) return 'paid';
        if (diasDiferencia > 30) return 'overdue';
        return 'pending';
    };

    const getPriorityFromFactura = (factura: FacturaResponseDTO): 'high' | 'medium' | 'low' => {
        if (factura.total > 200) return 'high';
        if (factura.total > 100) return 'medium';
        return 'low';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return theme.palette.success.main;
            case 'pending': return theme.palette.warning.main;
            case 'overdue': return theme.palette.error.main;
            default: return theme.palette.grey[500];
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Pagada';
            case 'pending': return 'Pendiente';
            case 'overdue': return 'Vencida';
            default: return 'Desconocido';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return theme.palette.error.main;
            case 'medium': return theme.palette.warning.main;
            case 'low': return theme.palette.success.main;
            default: return theme.palette.grey[500];
        }
    };

    const filteredAndSortedFacturas = facturas
        .filter(factura => {
            const matchesSearch = factura.id.toString().includes(searchTerm) ||
                                factura.comandaId.toString().includes(searchTerm) ||
                                factura.numeroMesa.toString().includes(searchTerm);
            const matchesStatus = filterStatus === 'TODOS' || factura.status === filterStatus;
            const matchesDate = (!fechaInicio || new Date(factura.fechaEmision) >= new Date(fechaInicio)) &&
                               (!fechaFin || new Date(factura.fechaEmision) <= new Date(fechaFin));
            
            return matchesSearch && matchesStatus && matchesDate;
        })
        .sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'fecha':
                    aValue = new Date(a.fechaEmision).getTime();
                    bValue = new Date(b.fechaEmision).getTime();
                    break;
                case 'total':
                    aValue = a.total;
                    bValue = b.total;
                    break;
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                default:
                    aValue = new Date(a.fechaEmision).getTime();
                    bValue = new Date(b.fechaEmision).getTime();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const stats = {
        total: facturas.length,
        totalAmount: facturas.reduce((sum, f) => sum + f.total, 0),
        totalTax: facturas.reduce((sum, f) => sum + f.impuesto, 0),
        paid: facturas.filter(f => f.status === 'paid').length,
        pending: facturas.filter(f => f.status === 'pending').length,
        overdue: facturas.filter(f => f.status === 'overdue').length,
    };

    const handleDescargarPdf = async (facturaId: number) => {
        try {
            setDownloadingPdf(facturaId);
            const pdfBlob = await descargarFacturaPdf(facturaId);
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-${facturaId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            alert("Error al descargar el PDF.");
            console.error(err);
        } finally {
            setDownloadingPdf(null);
        }
    };

    const handleFiltrar = () => {
        loadFacturas(fechaInicio, fechaFin);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Cargando facturas...
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
                    Gestión de Facturación
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra y consulta el historial de facturas del restaurante
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
                                Total Facturas
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                ${stats.totalAmount.toFixed(0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Recaudado
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {stats.pending}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Pendientes
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <ModernCard>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                                {stats.overdue}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Vencidas
                            </Typography>
                        </Box>
                    </ModernCard>
                </Grid>
            </Grid>

            {/* Filtros y controles */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Buscar facturas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="Estado"
                            >
                                <MenuItem value="TODOS">Todos los estados</MenuItem>
                                <MenuItem value="paid">Pagadas</MenuItem>
                                <MenuItem value="pending">Pendientes</MenuItem>
                                <MenuItem value="overdue">Vencidas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                label="Ordenar por"
                            >
                                <MenuItem value="fecha">Fecha</MenuItem>
                                <MenuItem value="total">Total</MenuItem>
                                <MenuItem value="id">ID</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                            <IconButton
                                onClick={() => setViewMode('table')}
                                color={viewMode === 'table' ? 'primary' : 'default'}
                            >
                                <ViewListIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('cards')}
                                color={viewMode === 'cards' ? 'primary' : 'default'}
                            >
                                <ViewModuleIcon />
                            </IconButton>
                            <ModernButton
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => loadFacturas()}
                                size="small"
                            >
                                Actualizar
                            </ModernButton>
                        </Box>
                    </Grid>
                </Grid>

                {/* Filtros de fecha */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="Fecha de Inicio"
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                    <TextField
                        label="Fecha de Fin"
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                    <ModernButton
                        variant="primary"
                        startIcon={<FilterIcon />}
                        onClick={() => handleFiltrar()}
                        size="small"
                    >
                        Filtrar
                    </ModernButton>
                </Box>
            </Box>

            {/* Vista de tabla */}
            {viewMode === 'table' ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Factura ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Comanda ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Mesa</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Impuesto</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Total</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Estado</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedFacturas.map((factura) => (
                                <TableRow key={factura.id} hover>
                                    <TableCell>#{factura.id}</TableCell>
                                    <TableCell>#{factura.comandaId}</TableCell>
                                    <TableCell>{factura.numeroMesa}</TableCell>
                                    <TableCell>
                                        {new Date(factura.fechaEmision).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">${factura.impuesto.toFixed(2)}</TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ${factura.total.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={getStatusText(factura.status || '')}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusColor(factura.status || ''),
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedFactura(factura);
                                                        setOpenDetailModal(true);
                                                    }}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Descargar PDF">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDescargarPdf(factura.id)}
                                                    disabled={downloadingPdf === factura.id}
                                                >
                                                    {downloadingPdf === factura.id ? (
                                                        <LoadingSpinner />
                                                    ) : (
                                                        <DownloadIcon />
                                                    )}
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
                /* Vista de cards */
                <Grid container spacing={2}>
                    {filteredAndSortedFacturas.map((factura) => (
                        <Grid item xs={12} sm={6} md={4} key={factura.id}>
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
                                                bgcolor: getStatusColor(factura.status || ''),
                                                mr: 2,
                                                width: 48,
                                                height: 48,
                                            }}
                                        >
                                            <ReceiptIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                Factura #{factura.id}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Comanda #{factura.comandaId}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {new Date(factura.fechaEmision).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AssessmentIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                Mesa {factura.numeroMesa}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                            ${factura.total.toFixed(2)}
                                        </Typography>
                                        <Chip
                                            label={getStatusText(factura.status || '')}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusColor(factura.status || ''),
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">
                                        Impuesto: ${factura.impuesto.toFixed(2)}
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                        <ModernButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => {
                                                setSelectedFactura(factura);
                                                setOpenDetailModal(true);
                                            }}
                                            sx={{ flex: 1 }}
                                        >
                                            Ver
                                        </ModernButton>
                                        <ModernButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleDescargarPdf(factura.id)}
                                            disabled={downloadingPdf === factura.id}
                                            sx={{ flex: 1 }}
                                        >
                                            {downloadingPdf === factura.id ? '...' : 'PDF'}
                                        </ModernButton>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Mensaje cuando no hay facturas */}
            {filteredAndSortedFacturas.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron facturas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterStatus !== 'TODOS' || fechaInicio || fechaFin
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay facturas registradas en el sistema'
                        }
                    </Typography>
                </Box>
            )}

            {/* Modal de detalles */}
            <ModernModal
                open={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                title={`Detalles de Factura #${selectedFactura?.id}`}
                maxWidth="sm"
            >
                {selectedFactura && (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Factura ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    #{selectedFactura.id}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Comanda ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    #{selectedFactura.comandaId}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Mesa
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedFactura.numeroMesa}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha de Emisión
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {new Date(selectedFactura.fechaEmision).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Impuesto
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                                    ${selectedFactura.impuesto.toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Total
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    ${selectedFactura.total.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </ModernModal>

            {/* FAB para móviles */}
            {isGerente && isMobile && (
                <Fab
                    color="primary"
                    aria-label="Nueva Factura"
                    onClick={() => {/* TODO: Implementar creación de factura */}}
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

export default FacturacionPage;