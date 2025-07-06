import { useState, useEffect } from 'react';
import type { FacturaResponseDTO } from '../types';
import { getFacturas, descargarFacturaPdf } from '../services/facturaService';
import { 
    Container, 
    Typography, 
    CircularProgress, 
    Alert, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Box, 
    TextField, 
    Button, 
    IconButton,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const FacturacionPage = () => {
    const [facturas, setFacturas] = useState<FacturaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [totalFiltrado, setTotalFiltrado] = useState(0);
    const [cantidadFacturas, setCantidadFacturas] = useState(0);

    const fetchFacturas = async (inicio?: string, fin?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFacturas(inicio, fin);
            const facturasArray = Array.isArray(data) ? data : [];
            setFacturas(facturasArray);
            
            // Calcular total y cantidad de facturas filtradas
            const total = facturasArray.reduce((sum, factura) => sum + factura.total, 0);
            setTotalFiltrado(total);
            setCantidadFacturas(facturasArray.length);
        } catch (err) {
            setError('No tienes permiso o hubo un error al cargar las facturas.');
            console.error(err);
            setTotalFiltrado(0);
            setCantidadFacturas(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacturas(); // Carga inicial
    }, []);

    const handleFiltrarClick = () => {
        fetchFacturas(fechaInicio, fechaFin);
    };

    const handleDescargarClick = async (facturaId: number) => {
        try {
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
        }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Historial de Facturación
            </Typography>
            
            {/* Filtros */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', alignItems: 'center' }}>
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
                <Button variant="contained" onClick={handleFiltrarClick}>
                    Filtrar
                </Button>
            </Box>

            {/* Resumen del Filtro */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AttachMoneyIcon fontSize="large" />
                            <Box>
                                <Typography variant="h6" component="div">
                                    Total del Período Filtrado
                                </Typography>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                    ${totalFiltrado.toFixed(2)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                {cantidadFacturas}
                            </Typography>
                            <Box>
                                <Typography variant="h6" component="div">
                                    Facturas Encontradas
                                </Typography>
                                <Typography variant="body2">
                                    en el período seleccionado
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla de Facturas */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Factura ID</TableCell>
                            <TableCell>Comanda ID</TableCell>
                            <TableCell>Nº Mesa</TableCell>
                            <TableCell>Fecha de Emisión</TableCell>
                            <TableCell align="right">Impuesto</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facturas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No se encontraron facturas en el período seleccionado
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            facturas.map((factura) => (
                                <TableRow key={factura.id}>
                                    <TableCell>#{factura.id}</TableCell>
                                    <TableCell>#{factura.comandaId}</TableCell>
                                    <TableCell>{factura.numeroMesa}</TableCell>
                                    <TableCell>{new Date(factura.fechaEmision).toLocaleString()}</TableCell>
                                    <TableCell align="right">${factura.impuesto.toFixed(2)}</TableCell>
                                    <TableCell align="right">${factura.total.toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton 
                                            onClick={() => handleDescargarClick(factura.id)} 
                                            color="primary" 
                                            aria-label="descargar pdf"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default FacturacionPage;