import { useState, useEffect } from 'react';
import type { ComandaResponseDTO } from '../types';
import { getComandasPorEstado, updateComandaEstado } from '../services/comandaService';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

const KitchenViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComandasEnProceso = async () => {
        // No ponemos setLoading(true) aquí para que el refresco sea más suave
        try {
            const data = await getComandasPorEstado('EN_PROCESO');
            if (Array.isArray(data)) {
                setComandas(data);
            } else {
                setComandas([]);
                setError('La respuesta de la API no tuvo el formato esperado.');
            }
        } catch (err) {
            setError('Error al cargar las comandas.');
        } finally {
            // Solo ponemos el loading a false la primera vez
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchComandasEnProceso(); // Carga inicial
        const interval = setInterval(fetchComandasEnProceso, 30000); // Refresca cada 30 segundos
        return () => clearInterval(interval); // Limpia el intervalo al salir
    }, []); // El array vacío asegura que esto solo se configure una vez

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