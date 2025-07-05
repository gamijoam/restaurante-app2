import { useOrder } from '../hooks/useOrder';
import { Typography, List, ListItem, ListItemText, Divider, Button, Paper, CircularProgress, Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. AQUÍ DEFINIMOS LAS "PROPS" QUE ESTE COMPONENTE RECIBIRÁ.
// Esto le dice a TypeScript que OrderSummary ACEPTA un 'mesaId' que es un número.
interface OrderSummaryProps {
    mesaId: number;
}

// 2. AQUÍ LE DECIMOS AL COMPONENTE QUE USE ESA DEFINICIÓN DE PROPS.
const OrderSummary = ({ mesaId }: OrderSummaryProps) => {
    const { orderItems, submitNewOrder, cancelOrder, activeComandaId } = useOrder();
    const navigate = useNavigate();
    // Importamos el contexto de autenticación para posibles redirecciones futuras por rol
    // import { useAuth } from '../context/AuthContext';
    // const { roles } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const total = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    }, [orderItems]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (!activeComandaId) {
            await submitNewOrder(mesaId);
            // Redirigimos al inicio después de crear la comanda
            navigate('/');
            // Si en el futuro quieres redirigir según rol:
            // if (roles.includes('COCINERO')) navigate('/cocina'); else navigate('/');
        }
        setIsSubmitting(false);
    };

    const handleCancel = async () => {
        if (activeComandaId && window.confirm("¿Estás seguro de que quieres cancelar esta comanda? Esta acción no se puede deshacer.")) {
            await cancelOrder(activeComandaId);
            navigate('/'); // Redirigimos al inicio después de cancelar
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>Comanda Actual</Typography>
                <Divider sx={{ mb: 2 }} />
                {orderItems.length === 0 ? (
                    <Typography color="text.secondary">No hay productos en la comanda.</Typography>
                ) : (
                    <List>
                        {orderItems.map((item, index) => (
                            <ListItem key={`${item.productoId}-${index}`} disableGutters>
                                <ListItemText
                                    primary={`${item.productoNombre} (x${item.cantidad})`}
                                    secondary={`Subtotal: $${(item.precioUnitario * item.cantidad).toFixed(2)}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
            <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" align="right">Total: ${total.toFixed(2)}</Typography>
                
                {activeComandaId ? (
                    <Button variant="outlined" color="error" fullWidth sx={{ mt: 2 }} onClick={handleCancel}>
                        Cancelar Comanda
                    </Button>
                ) : (
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
            </Box>
        </Paper>
    );
};

export default OrderSummary;