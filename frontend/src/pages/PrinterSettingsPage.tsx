import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Paper, TextField, Button, Select, MenuItem,
    List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, FormControl, InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
    getAllPrinterConfigs,
    savePrinterConfig,
    deletePrinterConfig,
    type PrinterConfig
} from '../services/printerConfigService';

const PrinterSettingsPage = () => {
    const [configs, setConfigs] = useState<PrinterConfig[]>([]);
    const [currentConfig, setCurrentConfig] = useState<Partial<PrinterConfig>>({
        role: 'COCINA',
        printerType: 'TCP',
        printerTarget: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const fetchConfigs = useCallback(async () => {
        try {
            const data = await getAllPrinterConfigs();
            setConfigs(data);
        } catch (error) {
            alert('Error al cargar las configuraciones.');
        }
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setCurrentConfig(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentConfig.role || !currentConfig.printerType || !currentConfig.printerTarget) {
            alert('Todos los campos son obligatorios.');
            return;
        }
        try {
            await savePrinterConfig(currentConfig as PrinterConfig);
            alert('Configuración guardada exitosamente.');
            fetchConfigs(); // Recargar la lista
            resetForm();
        } catch (error) {
            alert('Error al guardar la configuración.');
        }
    };

    const handleEdit = (config: PrinterConfig) => {
        setCurrentConfig(config);
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
            try {
                await deletePrinterConfig(id);
                alert('Configuración eliminada.');
                fetchConfigs();
            } catch (error) {
                alert('Error al eliminar la configuración.');
            }
        }
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setCurrentConfig({
            role: 'COCINA',
            printerType: 'TCP',
            printerTarget: ''
        });
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Configuración de Impresoras</Typography>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>{isEditing ? 'Editar Configuración' : 'Añadir Nueva Configuración'}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                name="role"
                                value={currentConfig.role || 'COCINA'}
                                onChange={handleInputChange as any}
                                label="Rol"
                            >
                                <MenuItem value="COCINA">Cocina</MenuItem>
                                <MenuItem value="CAJA">Caja</MenuItem>
                                <MenuItem value="BARRA">Barra</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Conexión</InputLabel>
                            <Select
                                name="printerType"
                                value={currentConfig.printerType || 'TCP'}
                                onChange={handleInputChange as any}
                                label="Tipo de Conexión"
                            >
                                <MenuItem value="TCP">Red (TCP/IP)</MenuItem>
                                <MenuItem value="USB">USB</MenuItem>
                                <MenuItem value="WIN">Driver de Windows</MenuItem>
                                <MenuItem value="SERIAL">Serial</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="printerTarget"
                            label="Destino (ej: 192.168.1.100:9100 o EPSON-TM-T20)"
                            value={currentConfig.printerTarget || ''}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {isEditing ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                       {isEditing && <Button onClick={resetForm} variant="outlined" fullWidth>Cancelar Edición</Button>}
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>Configuraciones Actuales</Typography>
            <List component={Paper}>
                {configs.map(config => (
                    <ListItem key={config.id} divider>
                        <ListItemText
                            primary={`Rol: ${config.role}`}
                            secondary={`Tipo: ${config.printerType} | Destino: ${config.printerTarget}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(config)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(config.id!)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

// Necesitas importar Grid
import { Grid } from '@mui/material';
export default PrinterSettingsPage;