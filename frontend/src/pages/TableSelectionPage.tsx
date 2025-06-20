import { useState, useEffect } from 'react';
import type { Mesa } from '../types';
import { getMesas } from '../services/mesaService';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Typography, CircularProgress, Alert, Card, CardActionArea, CardContent } from '@mui/material';

const getStatusColor = (estado: Mesa['estado']) => {
    switch (estado) {
        case 'LIBRE': return 'success.main';
        case 'OCUPADA': return 'error.main';
        case 'RESERVADA': return 'warning.main';
        default: return 'text.secondary';
    }
};

const TableSelectionPage = () => {
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para buscar las mesas
    const fetchMesas = async () => {
        try {
            const data = await getMesas();
            setMesas(Array.isArray(data) ? data : []);
        } catch (err) {
            // Para el polling, no queremos mostrar un error grande, solo registrarlo.
            console.error("Error al refrescar las mesas: ", err);
            setError('Error al cargar las mesas.');
        } finally {
            // Solo quitamos el ícono de carga la primera vez
            if (loading) setLoading(false);
        }
    };

    // useEffect con la lógica de Polling
    useEffect(() => {
        fetchMesas(); // Carga inicial

        // Polling: Refresca la lista de mesas cada 10 segundos
        const interval = setInterval(fetchMesas, 10000); 

        // Se ejecuta cuando el usuario navega a otra página para detener el polling
        return () => clearInterval(interval); 
    }, []); // El array vacío asegura que esto solo se configure una vez

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography variant="h4" align="center" gutterBottom>Seleccionar Mesa</Typography>
            <Grid container spacing={4}>
                {mesas.map(mesa => (
                    <Grid item key={mesa.id} xs={12} sm={6} md={3}>
                        <Card sx={{ borderTop: 5, borderColor: getStatusColor(mesa.estado) }}>
                            <CardActionArea component={RouterLink} to={`/comanda/mesa/${mesa.id}`}>
                                <CardContent>
                                    <Typography variant="h5" component="div">Mesa {mesa.numero}</Typography>
                                    <Typography variant="body2" color="text.secondary">Capacidad: {mesa.capacidad}</Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>{mesa.estado}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default TableSelectionPage;