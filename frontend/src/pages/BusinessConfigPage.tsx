import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Box,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    CardContent,
    Divider,
    InputAdornment,
    Button
} from '@mui/material';
import {
    Business as BusinessIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as LanguageIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { getBusinessConfig, saveBusinessConfig } from '../services/businessConfigService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernCard from '../components/ModernCard';

interface BusinessConfig {
    businessName: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    taxRate: number;
    currency: string;
    isActive: boolean;
}

const BusinessConfigPage: React.FC = () => {
    const { roles } = useAuth();
    const isGerente = roles.includes('ROLE_GERENTE');
    
    const [config, setConfig] = useState<BusinessConfig>({
        businessName: '',
        taxId: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        taxRate: 16.0,
        currency: 'USD',
        isActive: true,
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isGerente) {
            loadConfig();
        }
    }, [isGerente]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await getBusinessConfig();
            setConfig(data);
        } catch (err) {
            setError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            
            await saveBusinessConfig(config);
            setSuccess('Configuración guardada exitosamente');
            await loadConfig(); // Recargar para obtener el ID
        } catch (err) {
            setError('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: keyof BusinessConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isGerente) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    No tienes permisos para acceder a esta página.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessIcon color="primary" />
                    Configuración del Negocio
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Configura los datos de tu restaurante que aparecerán en las facturas y documentos.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Información Básica */}
                <Grid item xs={12} md={6}>
                    <ModernCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessIcon color="primary" />
                                Información Básica
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            
                            <TextField
                                fullWidth
                                label="Nombre del Negocio"
                                value={config.businessName}
                                onChange={(e) => handleInputChange('businessName', e.target.value)}
                                margin="normal"
                                required
                                helperText="Este nombre aparecerá en las facturas"
                            />
                            
                            <TextField
                                fullWidth
                                label="RIF"
                                value={config.taxId}
                                onChange={(e) => handleInputChange('taxId', e.target.value)}
                                margin="normal"
                                placeholder="J-12345678-9"
                            />
                            
                            <TextField
                                fullWidth
                                label="Dirección"
                                value={config.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                margin="normal"
                                multiline
                                rows={3}
                                placeholder="Calle Principal #123, Ciudad, Estado"
                            />
                            
                            <TextField
                                fullWidth
                                label="Descripción"
                                value={config.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                margin="normal"
                                multiline
                                rows={2}
                                placeholder="Breve descripción de tu negocio"
                            />
                        </CardContent>
                    </ModernCard>
                </Grid>

                {/* Información de Contacto */}
                <Grid item xs={12} md={6}>
                    <ModernCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon color="primary" />
                                Información de Contacto
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            
                            <TextField
                                fullWidth
                                label="Teléfono"
                                value={config.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="(555) 123-4567"
                            />
                            
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={config.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="info@mirestaurante.com"
                            />
                            
                            <TextField
                                fullWidth
                                label="Sitio Web"
                                value={config.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LanguageIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="www.mirestaurante.com"
                            />
                        </CardContent>
                    </ModernCard>
                </Grid>

                {/* Configuración Fiscal */}
                <Grid item xs={12} md={6}>
                    <ModernCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MoneyIcon color="primary" />
                                Configuración Fiscal
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            
                            <TextField
                                fullWidth
                                label="Porcentaje de Impuesto (%)"
                                type="number"
                                value={config.taxRate}
                                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                                margin="normal"
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                                helperText="Porcentaje de impuesto que se aplicará a las ventas"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={config.isActive}
                                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Configuración Activa"
                                sx={{ mb: 2 }}
                            />
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Solo una configuración puede estar activa a la vez. 
                                La configuración activa se usará en todas las facturas y documentos.
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving}
                                    startIcon={<SaveIcon />}
                                    fullWidth
                                >
                                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    onClick={loadConfig}
                                    startIcon={<RefreshIcon />}
                                >
                                    Recargar
                                </Button>
                            </Box>
                        </CardContent>
                    </ModernCard>
                </Grid>
            </Grid>

            {/* Snackbars para notificaciones */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert onClose={() => setError(null)} severity="error">
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
            >
                <Alert onClose={() => setSuccess(null)} severity="success">
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BusinessConfigPage; 