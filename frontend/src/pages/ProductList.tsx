import { useState, useEffect } from 'react';
import { getProductos } from '../services/productoService';
import type { Producto } from '../types';
import ProductCard from '../components/ProductCard'; // Importamos nuestro nuevo componente
import { Container, Grid, Typography, CircularProgress, Alert } from '@mui/material'; // Componentes de MUI

const ProductList = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const data = await getProductos();
                // Aseguramos que data es un array antes de guardarlo
                setProductos(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Error al cargar los productos.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    if (loading) {
        return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    }

    if (error) {
        return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
    }

   return (
    <Container sx={{ py: 4 }} maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom>
            Menú de Productos
        </Typography>
        <Grid container spacing={4}>
            {productos.map(producto => (
                // LA CORRECCIÓN ESTÁ EN LA LÍNEA DE ABAJO
                <Grid key={producto.id} xs={12} sm={6} md={4}>
                    <ProductCard producto={producto} />
                </Grid>
            ))}
        </Grid>
    </Container>
);
}
export default ProductList;