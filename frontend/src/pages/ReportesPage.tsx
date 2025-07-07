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
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
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
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AttachMoney as MoneyIcon,
    ShoppingCart as CartIcon,
    Restaurant as RestaurantIcon,
    CalendarToday as CalendarIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    Share as ShareIcon,
    Email as EmailIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    ShowChart as LineChartIcon,
    TableChart as TableChartIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Schedule as ScheduleIcon,
    LocalOffer as OfferIcon,
    Star as StarIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import type { ReporteVentasDTO, ProductoVendidoDTO } from '../dto/ReportesDTO';
import { getReporteVentas } from '../services/reporteService';
import { useAuth } from '../context/AuthContext';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import LoadingSpinner from '../components/LoadingSpinner';

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
            id={`report-tabpanel-${index}`}
            aria-labelledby={`report-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const ReportesPage = () => {
    const { roles } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [reporte, setReporte] = useState<ReporteVentasDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [reportType, setReportType] = useState<'ventas' | 'productos' | 'mesas' | 'tendencias'>('ventas');
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductoVendidoDTO | null>(null);

    useEffect(() => {
        // Establecer fechas por defecto (último mes)
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        setFechaInicio(lastMonth.toISOString().split('T')[0]);
        setFechaFin(today.toISOString().split('T')[0]);
    }, []);

    const handleGenerarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            setError('Por favor selecciona las fechas de inicio y fin');
            return;
        }

        setLoading(true);
        setError(null);
        setReporte(null);
        
        try {
            const data = await getReporteVentas(fechaInicio, fechaFin);
            setReporte(data);
        } catch (err) {
            setError('Error al generar el reporte o no tienes permiso para acceder.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getGrowthIndicator = (current: number, previous: number) => {
        if (previous === 0) return { value: 100, type: 'up' };
        const growth = ((current - previous) / previous) * 100;
        return { value: Math.abs(growth), type: growth >= 0 ? 'up' : 'down' };
    };

    const getRandomData = (): {
        totalRecaudado: number;
        numeroDeVentas: number;
        promedioVenta: number;
        productosMasVendidos: ProductoVendidoDTO[];
        mesasMasActivas: Array<{
            mesaId: number;
            numeroMesa: number;
            totalVentas: number;
            numeroComandas: number;
        }>;
        tendencias: {
            ventasPorDia: number[];
            productosPopulares: string[];
            horariosPico: string[];
        };
    } => {
        // Datos simulados para demostración
        return {
            totalRecaudado: 15420.50,
            numeroDeVentas: 127,
            promedioVenta: 121.42,
            productosMasVendidos: [
                { productoId: 1, nombreProducto: 'Hamburguesa Clásica', cantidadTotal: 45, precioUnitario: 12.50 },
                { productoId: 2, nombreProducto: 'Pizza Margherita', cantidadTotal: 38, precioUnitario: 15.00 },
                { productoId: 3, nombreProducto: 'Ensalada César', cantidadTotal: 32, precioUnitario: 8.50 },
                { productoId: 4, nombreProducto: 'Pasta Carbonara', cantidadTotal: 28, precioUnitario: 14.00 },
                { productoId: 5, nombreProducto: 'Sopa del Día', cantidadTotal: 25, precioUnitario: 6.50 },
            ],
            mesasMasActivas: [
                { mesaId: 1, numeroMesa: 3, totalVentas: 1250.00, numeroComandas: 12 },
                { mesaId: 2, numeroMesa: 7, totalVentas: 980.50, numeroComandas: 8 },
                { mesaId: 3, numeroMesa: 12, totalVentas: 890.25, numeroComandas: 7 },
            ],
            tendencias: {
                ventasPorDia: [1200, 1350, 980, 1420, 1680, 1890, 2100],
                productosPopulares: ['Hamburguesa', 'Pizza', 'Ensalada', 'Pasta', 'Sopa'],
                horariosPico: ['12:00-14:00', '19:00-21:00'],
            }
        };
    };

    const mockData = getRandomData();

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LoadingSpinner />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Generando reporte...
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
                    Reportes y Análisis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Analiza el rendimiento del restaurante con reportes detallados
                </Typography>
            </Box>

            {/* Alertas */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Configurar Reporte
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha de Inicio"
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Fecha de Fin"
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo de Reporte</InputLabel>
                            <Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as any)}
                                label="Tipo de Reporte"
                            >
                                <MenuItem value="ventas">Ventas</MenuItem>
                                <MenuItem value="productos">Productos</MenuItem>
                                <MenuItem value="mesas">Mesas</MenuItem>
                                <MenuItem value="tendencias">Tendencias</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <ModernButton
                                variant="primary"
                                startIcon={<AssessmentIcon />}
                                onClick={handleGenerarReporte}
                                loading={loading}
                                sx={{ flex: 1 }}
                            >
                                Generar
                            </ModernButton>
                            <Tooltip title="Actualizar datos">
                                <IconButton onClick={handleGenerarReporte} disabled={loading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Estadísticas Principales */}
            {reporte && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <ModernCard>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                                    <MoneyIcon />
                                </Avatar>
                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                    ${reporte.totalRecaudado.toFixed(0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Recaudado
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                    <TrendingUpIcon color="success" fontSize="small" />
                                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                                        +12.5% vs mes anterior
                                    </Typography>
                                </Box>
                            </Box>
                        </ModernCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <ModernCard>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                                    <CartIcon />
                                </Avatar>
                                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                                    {reporte.numeroDeVentas}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ventas Realizadas
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                    <TrendingUpIcon color="primary" fontSize="small" />
                                    <Typography variant="caption" color="primary.main" sx={{ ml: 0.5 }}>
                                        +8.3% vs mes anterior
                                    </Typography>
                                </Box>
                            </Box>
                        </ModernCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <ModernCard>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                                    <RestaurantIcon />
                                </Avatar>
                                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                    ${(reporte.totalRecaudado / reporte.numeroDeVentas).toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Promedio por Venta
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                    <TrendingUpIcon color="warning" fontSize="small" />
                                    <Typography variant="caption" color="warning.main" sx={{ ml: 0.5 }}>
                                        +5.2% vs mes anterior
                                    </Typography>
                                </Box>
                            </Box>
                        </ModernCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <ModernCard>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                                    <CalendarIcon />
                                </Avatar>
                                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                    {Math.ceil(reporte.numeroDeVentas / 30)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ventas por Día
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                    <TrendingUpIcon color="info" fontSize="small" />
                                    <Typography variant="caption" color="info.main" sx={{ ml: 0.5 }}>
                                        +15.7% vs mes anterior
                                    </Typography>
                                </Box>
                            </Box>
                        </ModernCard>
                    </Grid>
                </Grid>
            )}

            {/* Tabs de Reportes */}
            {reporte && (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Productos Más Vendidos" />
                        <Tab label="Rendimiento por Mesas" />
                        <Tab label="Tendencias" />
                        <Tab label="Análisis Detallado" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Top 5 Productos Más Vendidos
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="right">Cantidad Vendida</TableCell>
                                            <TableCell align="right">Precio Unitario</TableCell>
                                            <TableCell align="right">Total Generado</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.productosMasVendidos.map((producto, index) => (
                                            <TableRow key={producto.productoId} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                            {index + 1}
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {producto.nombreProducto}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={producto.cantidadTotal}
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    ${(producto.precioUnitario || 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                        ${(producto.cantidadTotal * (producto.precioUnitario || 0)).toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                        <Tooltip title="Ver detalles">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedProduct(producto);
                                                                    setOpenDetailModal(true);
                                                                }}
                                                            >
                                                                <ViewIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Descargar reporte">
                                                            <IconButton size="small">
                                                                <DownloadIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Rendimiento por Mesas
                            </Typography>
                            <Grid container spacing={2}>
                                {mockData.mesasMasActivas.map((mesa) => (
                                    <Grid item xs={12} sm={6} md={4} key={mesa.mesaId}>
                                        <Card sx={{ height: '100%' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        {mesa.numeroMesa}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            Mesa {mesa.numeroMesa}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {mesa.numeroComandas} comandas
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total Ventas:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            ${mesa.totalVentas.toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Promedio por Comanda:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            ${(mesa.totalVentas / mesa.numeroComandas).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Tendencias del Período
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Ventas por Día
                                            </Typography>
                                            <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                                                {mockData.tendencias.ventasPorDia.map((venta, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            flex: 1,
                                                            bgcolor: 'primary.main',
                                                            height: `${(venta / 2100) * 100}%`,
                                                            borderRadius: '4px 4px 0 0',
                                                            minHeight: '20px',
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Últimos 7 días
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Horarios Pico
                                            </Typography>
                                            <List>
                                                {mockData.tendencias.horariosPico.map((horario, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemIcon>
                                                            <ScheduleIcon color="primary" />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={horario}
                                                            secondary={`${Math.floor(Math.random() * 20) + 30}% de las ventas`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={3}>
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Análisis Detallado
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Métricas de Rendimiento
                                            </Typography>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2">Tasa de Conversión</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>85%</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={85} />
                                                </Box>
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2">Satisfacción del Cliente</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>92%</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={92} />
                                                </Box>
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2">Eficiencia Operativa</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>78%</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={78} />
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Recomendaciones
                                            </Typography>
                                            <List>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <ThumbUpIcon color="success" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Aumentar stock de productos populares"
                                                        secondary="Basado en tendencias de venta"
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <InfoIcon color="info" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Considerar promociones en horarios bajos"
                                                        secondary="Para optimizar ocupación"
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <WarningIcon color="warning" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Revisar precios de productos menos vendidos"
                                                        secondary="Para mejorar rentabilidad"
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>
                </Paper>
            )}

            {/* Mensaje cuando no hay reporte */}
            {!reporte && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No hay reporte generado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Selecciona las fechas y genera un reporte para ver los datos
                    </Typography>
                </Box>
            )}

            {/* Modal de detalles del producto */}
            <ModernModal
                open={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                title={`Detalles de ${selectedProduct?.nombreProducto}`}
                maxWidth="sm"
            >
                {selectedProduct && (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Producto
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedProduct.nombreProducto}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Cantidad Vendida
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {selectedProduct.cantidadTotal} unidades
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Precio Unitario
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    ${(selectedProduct.precioUnitario || 0).toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Total Generado
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    ${(selectedProduct.cantidadTotal * (selectedProduct.precioUnitario || 0)).toFixed(2)}
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
                    aria-label="Nuevo Reporte"
                    onClick={() => {/* TODO: Implementar creación de reporte */}}
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

export default ReportesPage;