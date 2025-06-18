import { useOrder } from '../hooks/useOrder';
import { Typography, List, ListItem, ListItemText, Divider, Button, Paper, CircularProgress } from '@mui/material';
import { useMemo, useState } from 'react';

// 1. Definimos las props que este componente recibirá
interface OrderSummaryProps {
    mesaId: number;
}

const OrderSummary = ({ mesaId }: OrderSummaryProps) => { // 2. Recibimos mesaId como prop
    const { orderItems, submitOrder } = useOrder();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }, [orderItems]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // 3. Usamos el mesaId que recibimos, en lugar de un número fijo
        await submitOrder(mesaId);
        setIsSubmitting(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Comanda Actual</Typography>
            <Divider sx={{ mb: 2 }} />
            {/* ... el resto del JSX no cambia ... */}
            {orderItems.length === 0 ? (
                <Typography color="text.secondary">No hay productos en la comanda.</Typography>
            ) : (
                <List>
                    {orderItems.map(item => (
                        <ListItem key={item.id} disableGutters>
                            <ListItemText
                                primary={`${item.nombre} (x${item.cantidad})`}
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