import ProductList from './ProductList';
import OrderSummary from '../components/OrderSummary';
import { Container, Grid, Typography, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';

const OrderPage = () => {
    // 1. Leemos el parámetro de la URL
    const { mesaId } = useParams<{ mesaId: string }>();

    // 2. Convertimos el ID a número para evitar errores.
    const idMesaNum = mesaId ? parseInt(mesaId, 10) : NaN;

    // 3. Si la URL no tiene un ID válido, mostramos un error.
    if (isNaN(idMesaNum)) {
        return <Alert severity="error">Número de mesa inválido.</Alert>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Tomando orden para la Mesa #{idMesaNum}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <ProductList />
                </Grid>
                <Grid item xs={12} md={4}>
                    {/* 4. Pasamos el ID de la mesa como prop a OrderSummary */}
                    <OrderSummary mesaId={idMesaNum} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default OrderPage;