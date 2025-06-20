import { useState, useEffect, useCallback } from 'react'; // <-- Añade useCallback
import type { ComandaResponseDTO } from '../types';
import { getComandasPorMultiplesEstados, updateComandaEstado } from '../services/comandaService';
import { useWebSocket } from '../context/WebSocketContext';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

const KitchenViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { stompClient, isConnected } = useWebSocket();

    // 1. DEFINIMOS LA FUNCIÓN DE FORMA ESTABLE CON useCallback
    const fetchInitialComandas = useCallback(async () => {
        setLoading(true); // Siempre ponemos loading al buscar
        try {
            const data = await getComandasPorMultiplesEstados(['EN_PROCESO']);
            if (Array.isArray(data)) {
                setComandas(data);
            }
        } catch (err) {
            console.error("Error al cargar comandas:", err);
            setError('Error al cargar las comandas iniciales.');
        } finally {
            setLoading(false);
        }
    }, []); // El array vacío significa que esta función nunca cambiará

    // 2. EL useEffect AHORA ES MÁS SIMPLE Y ROBUSTO
    useEffect(() => {
        if (isConnected && stompClient) {
            // Carga inicial
            fetchInitialComandas();

            // Suscripción a nuevas comandas
            const subscription = stompClient.subscribe('/topic/cocina', (message) => {
                const comandaRecibida: ComandaResponseDTO = JSON.parse(message.body);
                // Añade la nueva comanda a la lista existente
                setComandas(prevComandas => {
                    // Evitar duplicados si ya existe
                    if (prevComandas.find(c => c.id === comandaRecibida.id)) {
                        return prevComandas;
                    }
                    return [comandaRecibida, ...prevComandas];
                });
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [isConnected, stompClient, fetchInitialComandas]); // Añadimos la función a las dependencias

    const handleMarcarComoLista = async (comandaId: number) => {
        try {
            await updateComandaEstado(comandaId, 'LISTA');
            // La actualización optimista funciona bien aquí
            setComandas(prevComandas => prevComandas.filter(c => c.id !== comandaId));
        } catch (err) {
            alert('Error al actualizar la comanda.');
        }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }} maxWidth="xl">
            <Typography variant="h4" align="center" gutterBottom>Comandas en Cocina (En Tiempo Real)</Typography>
            <Grid container spacing={3}>
                {comandas.length > 0 ? (
                    comandas.map(comanda => (
                        <Grid item key={comanda.id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Mesa #{comanda.numeroMesa}</Typography>
                                    <ul>
                                        {comanda.items.map(item => (
                                            <li key={item.productoId}>
                                                {`${item.productoNombre} (x${item.cantidad})`}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="contained" onClick={() => handleMarcarComoLista(comanda.id)}>
                                        Marcar como Lista
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ p: 2, width: '100%', textAlign: 'center' }}>No hay comandas pendientes.</Typography>
                )}
            </Grid>
        </Container>
    );
};

export default KitchenViewPage;