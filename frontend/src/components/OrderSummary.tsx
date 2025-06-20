import { useOrder } from '../hooks/useOrder';
import { Typography, List, ListItem, ListItemText, Divider, Button, Paper, CircularProgress } from '@mui/material';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const OrderSummary = () => {
    const { orderItems, submitNewOrder, activeComandaId } = useOrder();
    const { mesaId } = useParams<{ mesaId: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    }, [orderItems]);

    const handleSubmit = async () => {
        const idMesaNum = mesaId ? parseInt(mesaId, 10) : 0;
        if (!idMesaNum) {
            alert("Error: No se ha seleccionado una mesa válida.");
            return;
        }
        setIsSubmitting(true);
        if (!activeComandaId) {
            await submitNewOrder(idMesaNum);
        }
        setIsSubmitting(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Comanda Actual</Typography>
            <Divider sx={{ mb: 2 }} />
            {orderItems.length === 0 ? (
                <Typography color="text.secondary">No hay productos en la comanda.</Typography>
            ) : (
                <List>
                    {orderItems.map((item, index) => (
                        // --- CORRECCIÓN DE LA KEY ---
                        <ListItem key={`${item.productoId}-${index}`} disableGutters>
                            <ListItemText
                                primary={`${item.productoNombre} (x${item.cantidad})`}
                                secondary={`Subtotal: $${(item.precioUnitario * item.cantidad).toFixed(2)}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" align="right">Total: ${total.toFixed(2)}</Typography>
            {activeComandaId === null && (
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={orderItems.length === 0 || isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Crear Comanda'}
                </Button>
            )}
        </Paper>
    );
};

export default OrderSummary;