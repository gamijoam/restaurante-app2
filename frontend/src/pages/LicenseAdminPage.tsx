import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  ContentCopy,
  Add,
  Refresh,
  Delete,
} from '@mui/icons-material';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useNotification } from '../hooks/useNotification';
import { useLicense } from '../context/LicenseContext';
import licenseService from '../services/licenseService';
import NotificationManager from '../components/NotificationManager';

interface GeneratedLicense {
  licenseCode: string;
  fingerprint: string;
  clientName: string;
  days: number;
}

const LicenseAdminPage: React.FC = () => {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<'days' | 'hours'>('days');
  const [licenseType, setLicenseType] = useState<'DAILY' | 'MONTHLY' | 'ANNUAL' | 'PERPETUAL'>('DAILY');
  const [generatedLicense, setGeneratedLicense] = useState<GeneratedLicense | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { showSuccess, showError } = useNotification();
  const { license, setLicense } = useLicense();

  const generateMockFingerprint = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `FP-${timestamp.toString(16).toUpperCase()}-${random.toUpperCase()}`;
  };

  const generateNewFingerprint = () => {
    const newFingerprint = generateMockFingerprint();
    setFingerprint(newFingerprint);
    showSuccess('Fingerprint generado', 'Nuevo código de equipo generado');
  };

  const handleGenerateLicense = async () => {
    if (!fingerprint.trim() || !clientName.trim()) {
      showError('Campos requeridos', 'Por favor completa el fingerprint y nombre del cliente');
      return;
    }

    if (duration <= 0) {
      showError('Duración inválida', 'La duración debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (durationUnit === 'hours') {
        response = await licenseService.generateLicenseByHours(fingerprint, clientName, duration);
      } else {
        response = await licenseService.generateLicense(fingerprint, clientName, licenseType, duration);
      }
      
      const newLicense: GeneratedLicense = {
        licenseCode: response.licenseCode,
        fingerprint: fingerprint,
        clientName: clientName,
        days: durationUnit === 'hours' ? Math.ceil(duration / 24) : duration
      };
      
      setGeneratedLicense(newLicense);
      showSuccess('Licencia generada', 'Licencia creada exitosamente');
    } catch (error) {
      console.error('Error generando licencia:', error);
      showError('Error', 'No se pudo generar la licencia');
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentLicense = async () => {
    if (fingerprint) {
      try {
        await fetch(`http://localhost:8081/api/license/deactivate-activation?fingerprint=${fingerprint}`, { method: 'POST' });
        showSuccess('Activación desactivada', 'La activación ha sido desactivada en el backend');
      } catch (e) {
        showError('Error', 'No se pudo desactivar la activación en el backend');
      }
    }
    setLicense(null);
    localStorage.removeItem('fingerprint'); // Limpiar también el fingerprint
    showSuccess('Licencia eliminada', 'La licencia actual ha sido eliminada del equipo');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado', 'Código copiado al portapapeles');
  };

  const getDurationLabel = (value: number, unit: 'days' | 'hours') => {
    if (unit === 'hours') {
      if (value === 1) return '1 hora';
      if (value < 24) return `${value} horas`;
      if (value === 24) return '1 día';
      if (value < 30 * 24) return `${Math.round(value / 24)} días`;
      if (value === 30 * 24) return '1 mes';
      return `${Math.round(value / (30 * 24))} meses`;
    } else {
      if (value === 1) return '1 día';
      if (value < 30) return `${value} días`;
      if (value === 30) return '1 mes';
      if (value < 365) return `${Math.round(value / 30)} meses`;
      if (value === 365) return '1 año';
      return `${Math.round(value / 365)} años`;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        Administración de Licencias (Pruebas)
      </Typography>

      {/* Botón para eliminar licencia actual */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <ModernButton
          variant="outlined"
          color="warning"
          icon="delete"
          onClick={clearCurrentLicense}
          sx={{ mb: 2 }}
        >
          Eliminar Licencia Actual
        </ModernButton>
        <Typography variant="caption" color="text.secondary" display="block">
          Elimina la licencia actual del equipo para hacer pruebas
        </Typography>
      </Box>

      {/* Estado de la licencia actual */}
      {license && (
        <Box sx={{ mb: 3 }}>
          <ModernCard title="Licencia Actual">
            <Alert severity="info" sx={{ mb: 2 }}>
              Licencia activa en este equipo
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Código
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {license.licenseCode}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Tipo
                </Typography>
                <Chip 
                  label={license.type || 'N/A'} 
                  color="primary" 
                  size="small" 
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Días Restantes
                </Typography>
                <Typography variant="h6" color="primary">
                  {license.daysRemaining || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Expira
                </Typography>
                <Typography variant="body2">
                  {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </ModernCard>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Generador de Licencias */}
        <Grid item xs={12} md={6}>
          <ModernCard title="Generar Nueva Licencia">
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Genera licencias de prueba para diferentes equipos y duraciones.
              </Typography>
              
              <TextField
                fullWidth
                label="Fingerprint"
                value={fingerprint}
                onChange={(e) => setFingerprint(e.target.value)}
                placeholder="FP-XXXX-XXXX"
                sx={{ mb: 2 }}
                InputProps={{
                  style: { fontFamily: 'monospace' }
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <ModernButton
                  variant="outlined"
                  icon="refresh"
                  onClick={generateNewFingerprint}
                >
                  Generar
                </ModernButton>
              </Box>

              <TextField
                fullWidth
                label="Nombre del Cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Duración"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  helperText={`Duración: ${getDurationLabel(duration, durationUnit)}`}
                />
                <TextField
                  select
                  label="Unidad"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as 'days' | 'hours')}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="hours">Horas</MenuItem>
                  <MenuItem value="days">Días</MenuItem>
                </TextField>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Tipo de Licencia"
                  select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as 'DAILY' | 'MONTHLY' | 'ANNUAL' | 'PERPETUAL')}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="DAILY">Diaria</MenuItem>
                  <MenuItem value="MONTHLY">Mensual</MenuItem>
                  <MenuItem value="ANNUAL">Anual</MenuItem>
                  <MenuItem value="PERPETUAL">Perpetua</MenuItem>
                </TextField>
              </Box>

              <ModernButton
                variant="primary"
                icon="add"
                onClick={handleGenerateLicense}
                loading={loading}
                fullWidth
              >
                Generar Licencia
              </ModernButton>
            </Box>
          </ModernCard>
        </Grid>

        {/* Licencia Generada */}
        <Grid item xs={12} md={6}>
          <ModernCard title="Licencia Generada">
            {generatedLicense ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Licencia generada exitosamente
                </Alert>

                <Paper sx={{ p: 2, bgcolor: 'success.50', position: 'relative', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {generatedLicense.licenseCode}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(generatedLicense.licenseCode)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Paper>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Cliente
                    </Typography>
                    <Typography variant="body1">
                      {generatedLicense.clientName}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Duración
                    </Typography>
                    <Chip 
                      label={getDurationLabel(generatedLicense.days, 'days')} 
                      color="primary" 
                      size="small" 
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Fingerprint
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {generatedLicense.fingerprint}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Genera una licencia para ver los detalles aquí
                </Typography>
              </Box>
            )}
          </ModernCard>
        </Grid>
      </Grid>
      <NotificationManager />
    </Box>
  );
};

export default LicenseAdminPage; 