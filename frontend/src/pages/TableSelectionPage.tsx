import { useState, useEffect, useCallback } from 'react';
import { getMesas, type Mesa } from '../services/mesaService';
import { useWebSocket } from '../context/WebSocketContext';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Grid, Typography, CircularProgress, Alert, Card, CardActionArea, CardContent, Box } from '@mui/material';

const getStatusColor = (estado: Mesa['estado']) => {
    switch (estado) {
        case 'LIBRE': return 'success.main';
        case 'OCUPADA': return 'error.main';
        case 'RESERVADA': return 'warning.main';
        case 'MANTENIMIENTO': return 'error.main';
        case 'LISTA_PARA_PAGAR': return 'warning.main';
        default: return 'text.secondary';
    }
};

const getStatusText = (estado: Mesa['estado']) => {
    switch (estado) {
        case 'LIBRE': return 'Libre';
        case 'OCUPADA': return 'Ocupada';
        case 'RESERVADA': return 'Reservada';
        case 'MANTENIMIENTO': return 'En Mantenimiento';
        case 'LISTA_PARA_PAGAR': return 'Lista para pagar';
        default: return estado;
    }
};

const isMesaSelectable = (estado: Mesa['estado']) => {
    return estado === 'LIBRE' || estado === 'RESERVADA' || estado === 'OCUPADA';
};

const TableSelectionPage = () => {
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { stompClient, isConnected } = useWebSocket();

    const fetchMesas = useCallback(async () => {
        try {
            const data = await getMesas();
            setMesas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar las mesas:", err);
            setError('Error al cargar la información de las mesas.');
        } finally {
            if (loading) setLoading(false);
        }
    }, [loading]); // La dependencia de 'loading' es intencional para el flujo de carga inicial

    useEffect(() => {
        // Carga inicial al montar el componente
        fetchMesas();

        // Lógica de WebSocket para actualizaciones en tiempo real
        if (isConnected && stompClient) {
            console.log("TableSelectionPage: Suscribiendo a /topic/mesas");
            const subscription = stompClient.subscribe('/topic/mesas', (message) => {
                console.log("TableSelectionPage: Notificación recibida:", message.body);
                // Agregar un pequeño delay para evitar race conditions
                setTimeout(() => {
                fetchMesas();
                }, 100);
            });
            return () => {
                console.log("TableSelectionPage: Desuscribiendo de /topic/mesas");
                subscription.unsubscribe();
            };
        }
    }, [isConnected, stompClient, fetchMesas]);

    if (loading) {
        return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    }

    if (error) {
        return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography variant="h4" align="center" gutterBottom>Seleccionar Mesa (En Tiempo Real)</Typography>
            <Grid container spacing={4}>
                {mesas.map(mesa => (
                    <Grid item key={mesa.id} xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            borderTop: 5, 
                            borderColor: getStatusColor(mesa.estado),
                            opacity: isMesaSelectable(mesa.estado) ? 1 : 0.6
                        }}>
                            <CardActionArea 
                                component={isMesaSelectable(mesa.estado) ? RouterLink : 'div'}
                                to={isMesaSelectable(mesa.estado) ? `/comanda/mesa/${mesa.id}` : undefined}
                                disabled={!isMesaSelectable(mesa.estado)}
                                sx={{ 
                                    cursor: isMesaSelectable(mesa.estado) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h5" component="div">Mesa {mesa.numero}</Typography>
                                    <Typography variant="body2" color="text.secondary">Capacidad: {mesa.capacidad}</Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                                        {getStatusText(mesa.estado)}
                                    </Typography>
                                    {!isMesaSelectable(mesa.estado) && (
                                        <Typography variant="caption" display="block" color="error" sx={{ mt: 1 }}>
                                            No disponible
                                        </Typography>
                                    )}
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