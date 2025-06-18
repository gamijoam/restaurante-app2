import { useOrder } from '../hooks/useOrder'; // Asegúrate que la ruta sea correcta
import { Typography, List, ListItem, ListItemText, Divider, Button, Paper, CircularProgress } from '@mui/material';
import { useMemo, useState } from 'react';

const OrderSummary = () => {
    const { orderItems, submitOrder } = useOrder();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }, [orderItems]);

    const handleSubmit = async () => {
        // ----- LOG NÚMERO 1 -----
        console.log("1. Botón 'Crear Comanda' presionado. Iniciando envío...");

        setIsSubmitting(true);
        // Por ahora, enviaremos la comanda siempre a la mesa 1.
        await submitOrder(1);
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
                    {orderItems.map(item => (
                        <ListItem key={item.id} disableGutters>
                            <ListItemText
                                primary={`<span class="math-inline">\{item\.nombre\} \(x</span>{item.cantidad})`}
                                secondary={`Subtotal: $${(item.precio * item.cantidad).toFixed(2)}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" align="right">Total: ${total.toFixed(2)}</Typography>
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
        </Paper>
    );
};

export default OrderSummary;