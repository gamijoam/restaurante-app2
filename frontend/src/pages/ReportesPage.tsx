import { useState } from 'react';
import type { ReporteVentasDTO } from '../types';
import { getReporteVentas } from '../services/reporteService';
import { Container, Typography, Button, TextField, Box, Alert } from '@mui/material';

const ReportesPage = () => {
    // Estados para las fechas, los datos del reporte y errores
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [reporte, setReporte] = useState<ReporteVentasDTO | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerarReporte = async () => {
        setError(null);
        setReporte(null);
        try {
            const data = await getReporteVentas(fechaInicio, fechaFin);
            setReporte(data);
        } catch (err) {
            setError('Error al generar el reporte o no tienes permiso para acceder.');
            console.error(err);
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Reporte de Ventas
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
                <TextField
                    label="Fecha de Inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Fecha de Fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={handleGenerarReporte}>
                    Generar
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {reporte && (
                <Box>
                    <Typography variant="h6">Resultados del {reporte.fechaInicio} al {reporte.fechaFin}:</Typography>
                    <Typography>Total Recaudado: ${reporte.totalRecaudado.toFixed(2)}</Typography>
                    <Typography>Número de Ventas: {reporte.numeroDeVentas}</Typography>
                    <Typography variant="h6" sx={{mt: 2}}>Productos más vendidos:</Typography>
                    <ul>
                        {reporte.productosMasVendidos.map(p => (
                            <li key={p.productoId}>{p.nombreProducto} - Vendidos: {p.cantidadTotal}</li>
                        ))}
                    </ul>
                </Box>
            )}
        </Container>
    );
};

export default ReportesPage;