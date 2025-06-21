import { useState, useEffect } from 'react';
import type { FacturaResponseDTO } from '../types';
import { getFacturas, descargarFacturaPdf } from '../services/facturaService';
import { Container, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, TextField, Button, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const FacturacionPage = () => {
    const [facturas, setFacturas] = useState<FacturaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const fetchFacturas = async (inicio?: string, fin?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFacturas(inicio, fin);
            setFacturas(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('No tienes permiso o hubo un error al cargar las facturas.');
            console.error(err);
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
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', alignItems: 'center' }}>
                <TextField label="Fecha de Inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                <TextField label="Fecha de Fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                <Button variant="contained" onClick={handleFiltrarClick}>Filtrar</Button>
            </Box>
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
                        {facturas.map((factura) => (
                            <TableRow key={factura.id}>
                                <TableCell>#{factura.id}</TableCell>
                                <TableCell>#{factura.comandaId}</TableCell>
                                <TableCell>{factura.numeroMesa}</TableCell>
                                <TableCell>{new Date(factura.fechaEmision).toLocaleString()}</TableCell>
                                <TableCell align="right">${factura.impuesto.toFixed(2)}</TableCell>
                                <TableCell align="right">${factura.total.toFixed(2)}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleDescargarClick(factura.id)} color="primary" aria-label="descargar pdf">
                                        <DownloadIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default FacturacionPage;