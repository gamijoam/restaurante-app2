import { useEffect, useState } from 'react';
import ProductList from './ProductList';
import OrderSummary from '../components/OrderSummary';
import { Container, Grid, Typography, Alert, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { getComandaActivaPorMesa } from '../services/mesaService';

const OrderPage = () => {
    const { mesaId } = useParams<{ mesaId: string }>();
    const { loadExistingOrder, clearOrder } = useOrder();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const idMesaNum = mesaId ? parseInt(mesaId, 10) : NaN;
        if (isNaN(idMesaNum)) {
            setLoading(false);
            return;
        }

        const checkForActiveOrder = async () => {
            try {
                // Intentamos buscar una comanda activa para esta mesa
                const comandaActiva = await getComandaActivaPorMesa(idMesaNum);
                // Si la encontramos, la cargamos en nuestro contexto
                loadExistingOrder(comandaActiva);
            } catch (error) {
                // Si da un error (ej. 404 Not Found), significa que no hay orden activa.
                // Limpiamos el contexto para empezar una orden nueva.
                clearOrder();
            } finally {
                setLoading(false);
            }
        };

        checkForActiveOrder();

        // Al salir de la página, limpiamos la orden para no dejar datos residuales
        return () => {
            clearOrder();
        };
    }, [mesaId, loadExistingOrder, clearOrder]);

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (!mesaId || isNaN(parseInt(mesaId, 10))) return <Alert severity="error">Número de mesa inválido.</Alert>;
    console.log(`OrderPage está renderizando y va a pasar mesaId: ${mesaId}`);
    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Comanda para la Mesa #{mesaId}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <ProductList />
                </Grid>
                <Grid item xs={12} md={4}>
                    <OrderSummary mesaId={parseInt(mesaId, 10)} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default OrderPage;