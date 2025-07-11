import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useLicense } from '../context/LicenseContext';
import { useNavigate, useLocation } from 'react-router-dom';
import licenseService from '../services/licenseService';
import { validateDeviceFingerprint, getOrCreateFingerprint } from '../utils/deviceFingerprint';
import ModernButton from './ModernButton';
import { useAuth } from '../context/AuthContext';

interface LicenseGuardProps {
  children: React.ReactNode;
}

const LICENSE_DISABLED = import.meta.env.VITE_DISABLE_LICENSE === 'true';

const LicenseGuard: React.FC<LicenseGuardProps> = ({ children }) => {
  if (LICENSE_DISABLED) {
    return <>{children}</>;
  }

  const { license, setLicense, isLoadingLicense } = useLicense();
  const { isAuthenticated } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoadingLicense) return; // Espera a que termine de cargar
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
      return;
    }
    if (isAuthenticated && !license && location.pathname !== '/license' && location.pathname !== '/license-admin') {
      navigate('/license');
      return;
    }
  }, [isAuthenticated, license, location.pathname, navigate, isLoadingLicense]);

  const validateLicense = async () => {
    if (!license || !isAuthenticated) {
      setIsValidating(false);
      navigate('/license');
      return;
    }
    setIsValidating(true);
    setValidationError(null);
    try {
      const storedFingerprint = localStorage.getItem('fingerprint');
      if (!storedFingerprint) {
        const newFingerprint = getOrCreateFingerprint();
        localStorage.setItem('fingerprint', newFingerprint);
        setIsValidating(false);
        return;
      }
      if (!validateDeviceFingerprint(storedFingerprint)) {
        setLicense(null);
        // localStorage.removeItem('fingerprint'); // No eliminar automáticamente
        setIsValidating(false);
        navigate('/license');
        return;
      }
      const requestBody = {
        licenseCode: license.licenseCode || '',
        fingerprint: storedFingerprint,
      };
      const response = await licenseService.validateLicense(requestBody);
      if (!response.valid) {
        setLicense(null);
        // localStorage.removeItem('fingerprint'); // No eliminar automáticamente
        setValidationError(response.message || 'Licencia inválida');
        setIsValidating(false);
        setTimeout(() => {
          navigate('/license');
        }, 2500);
        return;
      }
      // Solo actualiza la licencia si cambió
      if (JSON.stringify(license) !== JSON.stringify(response)) {
        setLicense(response);
      }
      setIsValidating(false);
      if (window.location.pathname === '/license') {
        navigate('/login');
      }
    } catch (error) {
      setValidationError('Error de conexión al validar licencia');
      setIsValidating(false);
      if (license) {
        return;
      } else {
        navigate('/license');
      }
    }
  };

  const handleRetry = () => {
    validateLicense();
  };

  const handleGoToLicense = () => {
    navigate('/license');
  };

  // Si la licencia está cargando, mostrar loader y no redirigir
  if (isLoadingLicense) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando licencia...
        </Typography>
      </Box>
    );
  }

  // Permitir acceso libre a /login, /license y /license-admin
  if (
    location.pathname === '/login' ||
    location.pathname === '/license' ||
    location.pathname === '/license-admin'
  ) {
    return <>{children}</>;
  }

  // Si no está autenticado o no hay licencia, no renderizar nada (la redirección la maneja useEffect)
  if (!isAuthenticated || !license) {
    return null;
  }

  // Si hay error de validación, mostrar mensaje
  if (validationError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        p: 3,
        gap: 2
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ModernButton variant="outlined" onClick={handleRetry}>
            Reintentar
          </ModernButton>
          <ModernButton variant="primary" onClick={handleGoToLicense}>
            Ir a Activación
          </ModernButton>
        </Box>
      </Box>
    );
  }

  // Si está validando, mostrar loading
  if (isValidating) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Validando licencia...
        </Typography>
      </Box>
    );
  }

  // Si la licencia es válida, mostrar el contenido
  return <>{children}</>;
};

export default LicenseGuard; 