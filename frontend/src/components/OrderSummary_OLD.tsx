import { useOrder } from '../context/OrderContext';
import { Typography, List, ListItem, ListItemText, Divider, Button, Paper } from '@mui/material';
import { useMemo } from 'react';

const OrderSummary = () => {
    // Obtenemos los items de la comanda desde nuestro contexto global
    const { orderItems } = useOrder();

    // Calculamos el total de la comanda.
    // Usamos useMemo para que este cálculo solo se rehaga si los items cambian.
    const total = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }, [orderItems]);

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
                Comanda Actual
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {orderItems.length === 0 ? (
                <Typography color="text.secondary">
                    No hay productos en la comanda.
                </Typography>
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
            <Typography variant="h6" align="right">
                Total: ${total.toFixed(2)}
            </Typography>
            <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
                disabled={orderItems.length === 0}
            >
                Crear Comanda
            </Button>
        </Paper>
    );
};

export default OrderSummary;