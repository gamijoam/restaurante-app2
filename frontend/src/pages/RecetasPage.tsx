import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Alert,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getProductos } from '../services/productoService';
import type { Producto } from '../types';
import { getIngredientes, type Ingrediente } from '../services/ingredienteService';
import { getRecetasByProducto, actualizarRecetaProducto, type RecetaIngrediente } from '../services/recetaService';

const RecetasPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [recetas, setRecetas] = useState<RecetaIngrediente[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReceta, setEditingReceta] = useState<RecetaIngrediente | null>(null);
    const [formData, setFormData] = useState<RecetaIngrediente>({
        ingredienteId: 0,
        cantidad: 0,
        unidad: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productosData, ingredientesData] = await Promise.all([
                getProductos(),
                getIngredientes()
            ]);
            setProductos(productosData);
            setIngredientes(ingredientesData);
        } catch (err) {
            setError('Error al cargar los datos');
        }
    };

    const handleProductoSelect = async (producto: Producto) => {
        setSelectedProducto(producto);
        try {
            const recetasData = await getRecetasByProducto(producto.id!);
            setRecetas(recetasData);
        } catch (err) {
            setRecetas([]);
        }
    };

    const handleOpenDialog = (receta?: RecetaIngrediente) => {
        if (receta) {
            setEditingReceta(receta);
            setFormData(receta);
        } else {
            setEditingReceta(null);
            setFormData({
                ingredienteId: 0,
                cantidad: 0,
                unidad: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingReceta(null);
        setFormData({
            ingredienteId: 0,
            cantidad: 0,
            unidad: ''
        });
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async () => {
        if (!selectedProducto || !formData.ingredienteId || formData.ingredienteId === 0) {
            setError('Debes seleccionar un ingrediente válido');
            return;
        }

        if (!formData.cantidad || formData.cantidad <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        try {
            let nuevasRecetas = [...recetas];
            
            if (editingReceta) {
                // Actualizar receta existente
                nuevasRecetas = nuevasRecetas.map(r => 
                    r.id === editingReceta.id ? { ...formData, id: r.id } : r
                );
            } else {
                // Agregar nueva receta
                const ingrediente = ingredientes.find(i => i.id === formData.ingredienteId);
                if (!ingrediente) {
                    setError('Ingrediente no encontrado');
                    return;
                }
                nuevasRecetas.push({
                    ...formData,
                    ingredienteNombre: ingrediente.nombre
                });
            }

            await actualizarRecetaProducto(selectedProducto.id!, nuevasRecetas);
            setRecetas(nuevasRecetas);
            setSuccess('Receta actualizada correctamente');
            handleCloseDialog();
        } catch (err) {
            setError('Error al guardar la receta');
        }
    };

    const handleDeleteReceta = async (recetaId: number) => {
        if (!selectedProducto) return;

        if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente de la receta?')) {
            try {
                const nuevasRecetas = recetas.filter(r => r.id !== recetaId);
                await actualizarRecetaProducto(selectedProducto.id!, nuevasRecetas);
                setRecetas(nuevasRecetas);
                setSuccess('Ingrediente eliminado de la receta');
            } catch (err) {
                setError('Error al eliminar el ingrediente de la receta');
            }
        }
    };

    const getIngredienteNombre = (ingredienteId: number) => {
        const ingrediente = ingredientes.find(i => i.id === ingredienteId);
        return ingrediente?.nombre || 'Ingrediente no encontrado';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Gestión de Recetas
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box display="flex" gap={2} mb={3}>
                <FormControl fullWidth>
                    <InputLabel>Seleccionar Producto</InputLabel>
                    <Select
                        value={selectedProducto?.id || ''}
                        onChange={(e) => {
                            const producto = productos.find(p => p.id === e.target.value);
                            if (producto) handleProductoSelect(producto);
                        }}
                        label="Seleccionar Producto"
                    >
                        {productos.map((producto) => (
                            <MenuItem key={producto.id} value={producto.id}>
                                {producto.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedProducto && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Receta de: {selectedProducto.nombre}
                        </Typography>
                        
                        {recetas.length === 0 ? (
                            <Typography color="text.secondary">
                                No hay ingredientes en la receta. Agrega ingredientes para comenzar.
                            </Typography>
                        ) : (
                            <List>
                                {recetas.map((receta) => (
                                    <ListItem key={receta.id}>
                                        <ListItemText
                                            primary={getIngredienteNombre(receta.ingredienteId)}
                                            secondary={`${receta.cantidad} ${receta.unidad || 'unidades'}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteReceta(receta.id!)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                    <CardActions>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Agregar Ingrediente
                        </Button>
                    </CardActions>
                </Card>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingReceta ? 'Editar Ingrediente en Receta' : 'Agregar Ingrediente a Receta'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ingrediente</InputLabel>
                        <Select
                            value={formData.ingredienteId || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({ 
                                    ...formData, 
                                    ingredienteId: value === '' ? 0 : Number(value) 
                                });
                            }}
                            label="Ingrediente"
                        >
                            <MenuItem value="">
                                <em>Selecciona un ingrediente</em>
                            </MenuItem>
                            {ingredientes.map((ingrediente) => (
                                <MenuItem key={ingrediente.id} value={ingrediente.id}>
                                    {ingrediente.nombre} ({ingrediente.stock} {ingrediente.unidad})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Cantidad"
                        type="number"
                        value={formData.cantidad || ''}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setFormData({ ...formData, cantidad: isNaN(value) ? 0 : value });
                        }}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Unidad"
                        value={formData.unidad}
                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                        margin="normal"
                        required
                        helperText="Usa la misma unidad que definiste en el ingrediente (ej: UN, g, ml)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingReceta ? 'Actualizar' : 'Agregar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RecetasPage; 