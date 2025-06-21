import { useState, useEffect, useCallback } from 'react';
import type { Mesa } from '../types';
import { getMesas } from '../services/mesaService';
import { useWebSocket } from '../context/WebSocketContext'; // Cambiado de AuthContext a useWebSocket
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Typography, CircularProgress, Alert, Card, CardActionArea, CardContent, Box } from '@mui/material';

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
    const { stompClient, isConnected } = useWebSocket();

    // Usamos useCallback con un array de dependencias vacío.
    // Esto asegura que la función fetchMesas nunca cambie.
    const fetchMesas = useCallback(async () => {
        try {
            const data = await getMesas();
            setMesas(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar las mesas.');
            console.error(err);
        } finally {
            // Solo quitamos el ícono de carga la primera vez
            if (loading) setLoading(false);
        }
    }, [loading]); // Dependemos de 'loading' para poder re-usar el if

    useEffect(() => {
        fetchMesas(); // Carga inicial

        if (isConnected && stompClient) {
            // Nos suscribimos al canal de mesas para actualizaciones en tiempo real
            const subscription = stompClient.subscribe('/topic/mesas', () => {
                console.log("Notificación recibida en /topic/mesas. Refrescando mesas...");
                fetchMesas();
            });
            return () => { subscription.unsubscribe(); };
        }
    }, [isConnected, stompClient, fetchMesas]);

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography variant="h4" align="center" gutterBottom>Seleccionar Mesa (En Tiempo Real)</Typography>
            <Grid container spacing={4}>
                {mesas.map(mesa => (
                    <Grid key={mesa.id} xs={12} sm={6} md={3}>
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