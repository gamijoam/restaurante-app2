import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Key,
  CheckCircle,
  Error,
  Refresh,
  ContentCopy,
  Info,
  Warning,
} from '@mui/icons-material';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLicense } from '../context/LicenseContext';
import licenseService from '../services/licenseService';
import { generateDeviceFingerprint, getOrCreateFingerprint } from '../utils/deviceFingerprint';
import NotificationManager from '../components/NotificationManager';

interface LicenseStatus {
  valid: boolean;
  licenseCode?: string;
  type?: string;
  expiresAt?: string;
  daysRemaining?: number;
  clientName?: string;
  message?: string;
}

const LicenseActivationPage: React.FC = () => {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [licenseCode, setLicenseCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [systemInfo, setSystemInfo] = useState<string>('');
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  // 1. Elimina los estados licenseType y duration
  // 2. Elimina la función handleGenerateLicense
  // 3. Elimina del JSX los campos y botones relacionados con la generación de licencia
  // 4. Deja solo el fingerprint y el formulario para ingresar y validar el código de licencia
  
  const { showSuccess, showError } = useNotification();
  const { setLicense } = useLicense();

  // Generar fingerprint al cargar la página
  useEffect(() => {
    console.log('[LicenseActivationPage] Componente montado');
    generateFingerprint();
  }, []);

  const generateFingerprint = async () => {
    console.log('[LicenseActivationPage] Generando fingerprint...');
    setLoading(true);
    try {
      // Usar getOrCreateFingerprint para asegurar estabilidad
      const deviceFingerprint = getOrCreateFingerprint();
      console.log('[LicenseActivationPage] Fingerprint generado:', deviceFingerprint);
      setFingerprint(deviceFingerprint);
      showSuccess('Fingerprint generado', 'Código de equipo generado correctamente');
    } catch (error) {
      console.error('[LicenseActivationPage] Error generando fingerprint:', error);
      showError('Error generando fingerprint', 'No se pudo generar el código del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateLicense = async () => {
    if (!licenseCode.trim()) {
      showError('Código requerido', 'Por favor ingresa el código de licencia');
      return;
    }

    setValidating(true);
    try {
      const requestBody = {
        licenseCode: licenseCode.trim(),
        fingerprint: fingerprint,
      };
      
      console.log('[Frontend] Enviando petición al license-service:', {
        url: 'http://localhost:8081/api/license/validate',
        body: requestBody
      });
      
      const data = await licenseService.validateLicense(requestBody);
      console.log('[Frontend] Data recibida del license-service:', data);
      
      setLicenseStatus(data);

      if (data.valid) {
        showSuccess('Licencia válida', data.message || 'Licencia activada correctamente');
        setLicense(data); // Guardar en LicenseContext y localStorage
        
        // Guardar el fingerprint en localStorage para futuras validaciones
        localStorage.setItem('fingerprint', fingerprint);
        console.log('[LicenseActivation] Fingerprint guardado:', fingerprint);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        showError('Licencia inválida', data.message || 'El código de licencia no es válido');
      }
    } catch (error) {
      console.error('[Frontend] Error en la petición al license-service:', error);
      showError('Error de validación', 'No se pudo validar la licencia');
    } finally {
      setValidating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado', 'Código copiado al portapapeles');
  };

  const getStatusColor = (valid: boolean) => {
    return valid ? 'success' : 'error';
  };

  const getStatusIcon = (valid: boolean) => {
    return valid ? <CheckCircle /> : <Error />;
  };

  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearLicense = () => {
    setLicense(null);
    localStorage.removeItem('fingerprint'); // Limpiar también el fingerprint
    showSuccess('Licencia eliminada', 'La licencia ha sido eliminada del equipo');
  };

  // 1. Elimina los estados licenseType y duration
  // 2. Elimina la función handleGenerateLicense
  // 3. Elimina del JSX los campos y botones relacionados con la generación de licencia
  // 4. Deja solo el fingerprint y el formulario para ingresar y validar el código de licencia
  let data;
  const handleGenerateLicense = async () => {
    if (!fingerprint) {
      showError('Datos incompletos', 'Genera un código de equipo primero');
      return;
    }
    setLoading(true);
    try {
      const clientName = 'Cliente'; // Puedes pedirlo en el formulario si lo deseas
      data = await licenseService.generateLicense(fingerprint, clientName, 'PERPETUAL');
      if (data.valid) {
        showSuccess('Licencia generada', data.message || 'Licencia generada correctamente');
        setLicense(data);
        localStorage.setItem('fingerprint', fingerprint);
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        showError('Error', data.message || 'No se pudo generar la licencia');
      }
    } catch (error) {
      showError('Error', 'No se pudo generar la licencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        Activación de Licencia
      </Typography>

      {/* Botón para limpiar licencia (solo para pruebas) */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <ModernButton
          variant="outlined"
          color="warning"
          icon="delete"
          onClick={clearLicense}
          sx={{ mb: 2 }}
        >
          Limpiar Licencia Actual (Pruebas)
        </ModernButton>
        <Typography variant="caption" color="text.secondary" display="block">
          Solo para pruebas - elimina la licencia actual del equipo
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Fingerprint Section */}
        <Grid item xs={12} md={6}>
          <ModernCard title="Código de tu Equipo">
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Este es el código único de tu equipo. Funciona en todos los navegadores de esta PC.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50', position: 'relative' }}>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {fingerprint || 'Generando...'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(fingerprint)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopy />
                </IconButton>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <ModernButton
                variant="outlined"
                icon="refresh"
                onClick={generateFingerprint}
                loading={loading}
              >
                Regenerar
              </ModernButton>
              
              <Tooltip title="Información del sistema">
                <IconButton
                  onClick={() => setShowSystemInfo(!showSystemInfo)}
                  color="primary"
                >
                  <Info />
                </IconButton>
              </Tooltip>
            </Box>

            {showSystemInfo && (
              <Paper sx={{ mt: 2, p: 2, bgcolor: 'info.50' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {systemInfo || 'Información del sistema no disponible'}
                </Typography>
              </Paper>
            )}
          </ModernCard>
        </Grid>

        {/* License Activation Section */}
        <Grid item xs={12} md={6}>
          <ModernCard title="Activar Licencia">
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ingresa el código de licencia que recibiste.
              </Typography>
              
              <TextField
                fullWidth
                label="Código de Licencia"
                value={licenseCode}
                onChange={(e) => setLicenseCode(e.target.value)}
                placeholder="LIC-XXXX-XXXX-XXXX"
                sx={{ mb: 2 }}
                InputProps={{
                  style: { fontFamily: 'monospace' }
                }}
              />
              
              <ModernButton
                variant="primary"
                icon="save"
                onClick={handleValidateLicense}
                loading={validating}
                fullWidth
              >
                Validar Licencia
              </ModernButton>
            </Box>

            {licenseStatus && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                
                <Alert 
                  severity={getStatusColor(licenseStatus.valid) as any}
                  icon={getStatusIcon(licenseStatus.valid)}
                  sx={{ mb: 2 }}
                >
                  {licenseStatus.message}
                </Alert>

                {licenseStatus.valid && (
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tipo de Licencia
                        </Typography>
                        <Chip 
                          label={licenseStatus.type || 'N/A'} 
                          color="primary" 
                          size="small" 
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Días Restantes
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {licenseStatus.daysRemaining || 0}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Expira el
                        </Typography>
                        <Typography variant="body1">
                          {formatExpirationDate(licenseStatus.expiresAt || '')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Box>
            )}
          </ModernCard>
        </Grid>
      </Grid>
      <NotificationManager />
    </Box>
  );
};

export default LicenseActivationPage; 