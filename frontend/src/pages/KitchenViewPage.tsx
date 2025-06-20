import { useState, useEffect } from 'react';
import type { ComandaResponseDTO } from '../types';
// CORRECCIÓN: Importa del servicio correcto y la función correcta
import { getComandasPorMultiplesEstados, updateComandaEstado } from '../services/comandaService';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

const KitchenViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComandasEnProceso = async () => {
        try {
            // CORRECCIÓN: Llama a la función correcta con un array de estados
            const data = await getComandasPorMultiplesEstados(['EN_PROCESO']);
            if (Array.isArray(data)) {
                setComandas(data);
                setError(null);
            } else {
                setComandas([]);
                setError('La respuesta de la API no tuvo el formato esperado.');
            }
        } catch (err) {
            setError('Error al cargar las comandas.');
            console.error(err);
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchComandasEnProceso();
        const interval = setInterval(fetchComandasEnProceso, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleMarcarComoLista = async (comandaId: number) => {
        try {
            await updateComandaEstado(comandaId, 'LISTA');
            setComandas(prevComandas => prevComandas.filter(c => c.id !== comandaId));
        } catch (err) {
            alert('Error al actualizar la comanda.');
        }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }} maxWidth="xl">
            <Typography variant="h4" align="center" gutterBottom>Comandas en Cocina</Typography>
            <Grid container spacing={3}>
                {comandas.length > 0 ? (
                    comandas.map(comanda => (
                        // CORRECCIÓN: Sin la prop "item"
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