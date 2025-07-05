import React from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert
} from '@mui/material';

const InventarioHelpPage = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Guía del Sistema de Inventario
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        ¿Cómo funciona el sistema de inventario?
                    </Typography>
                    
                    <Typography paragraph>
                        El sistema de inventario funciona con <strong>ingredientes</strong> y <strong>recetas</strong>:
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText 
                                primary="Ingredientes" 
                                secondary="Son las materias primas que compras (ej: Carne Molida, Pan, Lechuga). Cada uno tiene su stock y unidad de medida."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Recetas" 
                                secondary="Definen qué ingredientes y en qué cantidad se necesitan para hacer un producto (ej: Hamburguesa necesita 150g de carne + 1 pan)."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Descuento automático" 
                                secondary="Cuando vendes un producto, el sistema automáticamente descuenta los ingredientes de la receta del stock."
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Unidades de Medida
                    </Typography>
                    
                    <Typography paragraph>
                        Puedes usar cualquier unidad que necesites. Ejemplos comunes:
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText 
                                primary="Peso" 
                                secondary="gramos (g), kilogramos (kg), libras (lb)"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Volumen" 
                                secondary="mililitros (ml), litros (L), onzas (oz)"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Unidades" 
                                secondary="unidades (un), piezas (pz), porciones (por)"
                            />
                        </ListItem>
                    </List>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Ejemplo:</strong> Si tienes 2.5 kg de carne molida y una hamburguesa usa 150g, 
                        puedes hacer 16 hamburguesas (2500g ÷ 150g = 16.67).
                    </Alert>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Flujo de Trabajo Recomendado
                    </Typography>
                    
                    <List>
                        <ListItem>
                            <ListItemText 
                                primary="1. Crear Ingredientes" 
                                secondary="Ve a 'Ingredientes' y crea todos los ingredientes que usas, con su stock inicial y unidad."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="2. Crear Productos" 
                                secondary="Ve a 'Productos' y crea los productos que vendes (sin stock, solo nombre, descripción y precio)."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="3. Definir Recetas" 
                                secondary="Ve a 'Recetas', selecciona un producto y agrega los ingredientes que necesita con sus cantidades."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="4. Vender Productos" 
                                secondary="Cuando crees una comanda, el sistema automáticamente validará y descontará los ingredientes."
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Ejemplo Práctico
                    </Typography>
                    
                    <Typography paragraph>
                        <strong>Ingredientes:</strong>
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText primary="Carne Molida: 5 kg" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Pan de Hamburguesa: 50 unidades" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Lechuga: 2 kg" />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography paragraph>
                        <strong>Receta de Hamburguesa:</strong>
                    </Typography>
                    <List dense>
                        <ListItem>
                            <ListItemText primary="150g de Carne Molida" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="1 unidad de Pan de Hamburguesa" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="30g de Lechuga" />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography paragraph>
                        <strong>Resultado:</strong> Con 5kg de carne puedes hacer 33 hamburguesas (5000g ÷ 150g = 33.33).
                        El sistema te avisará cuando no haya suficiente stock de algún ingrediente.
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};

export default InventarioHelpPage; 