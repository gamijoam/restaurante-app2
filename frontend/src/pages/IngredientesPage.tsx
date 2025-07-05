import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Alert,
    Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getIngredientes, createIngrediente, updateIngrediente, deleteIngrediente, type Ingrediente } from '../services/ingredienteService';

const IngredientesPage = () => {
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null);
    const [formData, setFormData] = useState<Ingrediente>({
        nombre: '',
        stock: 0,
        unidad: '',
        descripcion: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadIngredientes();
    }, []);

    const loadIngredientes = async () => {
        try {
            const data = await getIngredientes();
            setIngredientes(data);
        } catch (err) {
            setError('Error al cargar los ingredientes');
        }
    };

    const handleOpenDialog = (ingrediente?: Ingrediente) => {
        if (ingrediente) {
            setEditingIngrediente(ingrediente);
            setFormData(ingrediente);
        } else {
            setEditingIngrediente(null);
            setFormData({
                nombre: '',
                stock: 0,
                unidad: '',
                descripcion: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingIngrediente(null);
        setFormData({
            nombre: '',
            stock: 0,
            unidad: '',
            descripcion: ''
        });
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingIngrediente) {
                await updateIngrediente(editingIngrediente.id!, formData);
                setSuccess('Ingrediente actualizado correctamente');
            } else {
                await createIngrediente(formData);
                setSuccess('Ingrediente creado correctamente');
            }
            handleCloseDialog();
            loadIngredientes();
        } catch (err) {
            setError('Error al guardar el ingrediente');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
            try {
                await deleteIngrediente(id);
                setSuccess('Ingrediente eliminado correctamente');
                loadIngredientes();
            } catch (err) {
                setError('Error al eliminar el ingrediente');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Gestión de Ingredientes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nuevo Ingrediente
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Unidad</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ingredientes.map((ingrediente) => (
                            <TableRow key={ingrediente.id}>
                                <TableCell>{ingrediente.nombre}</TableCell>
                                <TableCell>{ingrediente.stock}</TableCell>
                                <TableCell>{ingrediente.unidad}</TableCell>
                                <TableCell>{ingrediente.descripcion}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(ingrediente)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(ingrediente.id!)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
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
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingIngrediente ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default IngredientesPage; 