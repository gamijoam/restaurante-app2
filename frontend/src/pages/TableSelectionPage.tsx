import { useState, useEffect } from 'react';
import { getMesas } from '../services/mesaService';
import type { Mesa } from '../types';
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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMesas = async () => {
            try {
                const data = await getMesas();
                setMesas(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Error al cargar las mesas.');
            } finally {
                setLoading(false);
            }
        };
        fetchMesas();
    }, []);

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }} maxWidth="lg">
            <Typography variant="h4" align="center" gutterBottom>Seleccionar Mesa</Typography>
            <Grid container spacing={4}>
                {mesas.map(mesa => (
                    <Grid key={mesa.id} xs={12} sm={6} md={3}>
                        <Card sx={{ borderTop: 5, borderColor: getStatusColor(mesa.estado) }}>
                            <CardActionArea component={mesa.estado === 'LIBRE' ? RouterLink : 'div'} to={`/comanda/mesa/${mesa.id}`} disabled={mesa.estado !== 'LIBRE'}>
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