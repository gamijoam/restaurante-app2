import { useState, useEffect } from 'react';
import type { ComandaResponseDTO } from '../types';
import { getComandasPorMultiplesEstados, updateComandaEstado } from '../services/comandaService';
import { Container, Grid, Typography, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';

const CashierViewPage = () => {
    const [comandas, setComandas] = useState<ComandaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComandasACobrar = async () => {
        // Log para ver el polling en acción
        console.log("Polling: Buscando comandas para cobrar...");
        try {
            const data = await getComandasPorMultiplesEstados(['LISTA', 'ENTREGADA']);
            if (Array.isArray(data)) {
                setComandas(data);
            }
        } catch (err) {
            setError('Error al cargar las comandas a cobrar.');
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchComandasACobrar();
        const interval = setInterval(fetchComandasACobrar, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleMarcarComoPagada = async (comandaId: number) => {
        // --- LOGS DE DEPURACIÓN ---
        console.log(`1. Iniciando pago para comanda ID: ${comandaId}`);
        try {
            await updateComandaEstado(comandaId, 'PAGADA');
            console.log('2. Petición a la API completada con éxito.');

            setComandas(prevComandas => {
                console.log('3. Estado ANTES de filtrar:', prevComandas);
                const nuevasComandas = prevComandas.filter(c => c.id !== comandaId);
                console.log('4. Estado DESPUÉS de filtrar:', nuevasComandas);
                return nuevasComandas;
            });

        } catch (err) {
            alert('Error al actualizar la comanda.');
            console.error(err);
        }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    // El resto del JSX no cambia
    return (
        <Container sx={{ py: 4 }} maxWidth="xl">
            <Typography variant="h4" align="center" gutterBottom>Comandas por Cobrar</Typography>
            <Grid container spacing={3}>
                {comandas.length > 0 ? (
                    comandas.map(comanda => (
                        <Grid item key={comanda.id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Mesa #{comanda.numeroMesa}</Typography>
                                    <Typography variant="h5" color="text.secondary" sx={{ my: 1 }}>
                                        Total: ${comanda.total.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption">Estado: {comanda.estado}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="contained" color="success" onClick={() => handleMarcarComoPagada(comanda.id)}>
                                        Cobrar y Cerrar Mesa
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ p: 2, width: '100%', textAlign: 'center' }}>No hay comandas pendientes de pago.</Typography>
                )}
            </Grid>
        </Container>
    );
};

export default CashierViewPage;