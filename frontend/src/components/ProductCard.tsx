import type { Producto } from '../types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { useOrder } from '../hooks/useOrder'; // 1. Importamos nuestro hook

interface ProductCardProps {
    producto: Producto;
}

const ProductCard = ({ producto }: ProductCardProps) => {
    // 2. Obtenemos la función para añadir productos desde el contexto
    const { addProductToOrder } = useOrder();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                {/* ... (el resto del contenido de la tarjeta no cambia) ... */}
                <Typography gutterBottom variant="h5" component="h2">
                    {producto.nombre}
                </Typography>
                <Typography>
                    {producto.descripcion}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Precio: ${producto.precio.toFixed(2)}
                </Typography>
                <Typography color="text.secondary">
                    Stock: {producto.stock}
                </Typography>
            </CardContent>
            <CardActions>
                {/* 3. Le damos la funcionalidad al botón */}
                <Button size="small" onClick={() => addProductToOrder(producto)}>
                    Añadir a Comanda
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProductCard;