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
    Chip,
    Grid,
    Paper,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Autocomplete,
    Snackbar,
    Fab
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Add as AddIcon,
    Restaurant as RestaurantIcon,
    Inventory as InventoryIcon,
    MenuBook as RecipeIcon,
    Add as AddProductIcon
} from '@mui/icons-material';
import { getProductos, createProducto } from '../services/productoService';
import type { Producto } from '../types';
import { getIngredientes, type Ingrediente } from '../services/ingredienteService';
import { getRecetasByProducto, actualizarRecetaProducto, type RecetaIngrediente } from '../services/recetaService';

const RecetasPage = () => {
    // Estados principales
    const [productos, setProductos] = useState<Producto[]>([]);
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [recetas, setRecetas] = useState<RecetaIngrediente[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    
    // Estados para el modal de añadir ingrediente
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReceta, setEditingReceta] = useState<RecetaIngrediente | null>(null);
    const [formData, setFormData] = useState<RecetaIngrediente>({
        ingredienteId: 0,
        cantidad: 0,
        unidad: ''
    });
    
    // Estados para el modal de crear producto
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [newProductData, setNewProductData] = useState<Omit<Producto, 'id'>>({
        nombre: '',
        descripcion: '',
        precio: 0
    });
    
    // Estados para feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    
    // Estado para búsqueda
    const [searchTerm, setSearchTerm] = useState('');

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
            showSnackbar('Error al cargar los datos', 'error');
        }
    };

    const handleProductoSelect = async (producto: Producto) => {
        setSelectedProducto(producto);
        setActiveStep(1);
        try {
            const recetasData = await getRecetasByProducto(producto.id!);
            setRecetas(recetasData);
            showSnackbar(`Receta cargada para: ${producto.nombre}`, 'success');
        } catch (err) {
            setRecetas([]);
            showSnackbar('No se encontró receta para este producto', 'error');
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

    const handleOpenProductDialog = () => {
        setNewProductData({
            nombre: '',
            descripcion: '',
            precio: 0
        });
        setOpenProductDialog(true);
    };

    const handleCloseProductDialog = () => {
        setOpenProductDialog(false);
        setNewProductData({
            nombre: '',
            descripcion: '',
            precio: 0
        });
        setError(null);
    };

    const handleCreateProduct = async () => {
        if (!newProductData.nombre.trim()) {
            setError('El nombre del producto es obligatorio');
            return;
        }

        if (newProductData.precio <= 0) {
            setError('El precio debe ser mayor a 0');
            return;
        }

        try {
            const nuevoProducto = await createProducto(newProductData);
            setProductos([...productos, nuevoProducto]);
            showSnackbar(`Producto "${nuevoProducto.nombre}" creado exitosamente`, 'success');
            handleCloseProductDialog();
            
            // Opcional: seleccionar automáticamente el nuevo producto
            handleProductoSelect(nuevoProducto);
        } catch (err) {
            showSnackbar('Error al crear el producto', 'error');
        }
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
            showSnackbar(
                editingReceta 
                    ? 'Ingrediente actualizado en la receta' 
                    : 'Ingrediente añadido a la receta', 
                'success'
            );
            handleCloseDialog();
        } catch (err) {
            showSnackbar('Error al guardar la receta', 'error');
        }
    };

    const handleDeleteReceta = async (recetaId: number) => {
        if (!selectedProducto) return;

        if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente de la receta?')) {
            try {
                const nuevasRecetas = recetas.filter(r => r.id !== recetaId);
                await actualizarRecetaProducto(selectedProducto.id!, nuevasRecetas);
                setRecetas(nuevasRecetas);
                showSnackbar('Ingrediente eliminado de la receta', 'success');
            } catch (err) {
                showSnackbar('Error al eliminar el ingrediente de la receta', 'error');
            }
        }
    };

    const getIngredienteNombre = (receta: RecetaIngrediente) => {
        // Si la receta ya tiene ingredienteNombre, usarlo
        if (receta.ingredienteNombre) {
            return receta.ingredienteNombre;
        }
        // Si no, buscar en la lista local de ingredientes
        const ingrediente = ingredientes.find(i => i.id === receta.ingredienteId);
        return ingrediente?.nombre || 'Ingrediente no encontrado';
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const steps = [
        {
            label: 'Seleccionar Producto',
            description: 'Elige el producto para el cual quieres gestionar la receta'
        },
        {
            label: 'Gestionar Receta',
            description: 'Añade, edita o elimina ingredientes de la receta'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RecipeIcon fontSize="large" />
                Gestión de Recetas
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={activeStep} orientation="horizontal">
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Paso 1: Selección de Producto */}
            {activeStep === 0 && (
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RestaurantIcon />
                                Paso 1: Selecciona un Producto
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddProductIcon />}
                                onClick={handleOpenProductDialog}
                                color="primary"
                            >
                                Crear Nuevo Producto
                            </Button>
                        </Box>
                        
                        <TextField
                            fullWidth
                            label="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ mb: 3 }}
                            placeholder="Escribe para buscar productos..."
                        />

                        <Grid container spacing={2}>
                            {filteredProductos.map((producto) => (
                                <Grid item xs={12} sm={6} md={4} key={producto.id}>
                                    <Card 
                                        variant="outlined" 
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': { 
                                                backgroundColor: 'action.hover',
                                                borderColor: 'primary.main'
                                            }
                                        }}
                                        onClick={() => handleProductoSelect(producto)}
                                    >
                                        <CardContent>
                                            <Typography variant="h6" component="div">
                                {producto.nombre}
                                            </Typography>
                                            <Typography color="text.secondary" gutterBottom>
                                                ${producto.precio}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {producto.descripcion}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                        ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Paso 2: Gestión de Receta */}
            {activeStep === 1 && selectedProducto && (
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InventoryIcon />
                            Receta de: {selectedProducto.nombre}
                        </Typography>
                            <Button 
                                variant="outlined" 
                                onClick={() => {
                                    setActiveStep(0);
                                    setSelectedProducto(null);
                                    setRecetas([]);
                                }}
                            >
                                Cambiar Producto
                            </Button>
                        </Box>
                        
                        {recetas.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                No hay ingredientes en la receta. Agrega ingredientes para comenzar.
                            </Alert>
                        ) : (
                            <List>
                                {recetas.map((receta) => (
                                    <ListItem key={receta.id} divider>
                                        <ListItemText
                                            primary={getIngredienteNombre(receta)}
                                            secondary={`${receta.cantidad} ${receta.unidad || 'unidades'}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog(receta)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
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
                            size="large"
                        >
                            Añadir Ingrediente
                        </Button>
                    </CardActions>
                </Card>
            )}

            {/* Modal para añadir/editar ingrediente */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingReceta ? 'Editar Ingrediente en Receta' : 'Añadir Ingrediente a Receta'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ingrediente</InputLabel>
                        <Select
                            value={formData.ingredienteId || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                const ingrediente = ingredientes.find(i => i.id === value);
                                setFormData({ 
                                    ...formData, 
                                    ingredienteId: value === '' ? 0 : Number(value),
                                    unidad: ingrediente?.unidad || ''
                                });
                            }}
                            label="Ingrediente"
                        >
                            <MenuItem value="">
                                <em>Selecciona un ingrediente</em>
                            </MenuItem>
                            {ingredientes.map((ingrediente) => (
                                <MenuItem key={ingrediente.id} value={ingrediente.id}>
                                    {ingrediente.nombre} (Stock: {ingrediente.stock} {ingrediente.unidad})
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
                        inputProps={{ min: 0, step: 0.01 }}
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
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingReceta ? 'Actualizar' : 'Añadir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal para crear nuevo producto */}
            <Dialog open={openProductDialog} onClose={handleCloseProductDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Crear Nuevo Producto
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre del Producto"
                        value={newProductData.nombre}
                        onChange={(e) => setNewProductData({ ...newProductData, nombre: e.target.value })}
                        margin="normal"
                        required
                        placeholder="Ej: Hamburguesa Clásica"
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={newProductData.descripcion}
                        onChange={(e) => setNewProductData({ ...newProductData, descripcion: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                        placeholder="Describe el producto..."
                    />
                    <TextField
                        fullWidth
                        label="Precio"
                        type="number"
                        value={newProductData.precio || ''}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setNewProductData({ ...newProductData, precio: isNaN(value) ? 0 : value });
                        }}
                        margin="normal"
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                        placeholder="0.00"
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProductDialog}>Cancelar</Button>
                    <Button onClick={handleCreateProduct} variant="contained">
                        Crear Producto
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RecetasPage; 