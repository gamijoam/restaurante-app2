import { useEffect, useRef, useState } from 'react';
import { useLicense } from '../context/LicenseContext';
import { useNotification } from './useNotification';
import licenseService from '../services/licenseService';
import { useLocation } from 'react-router-dom';

interface UseLicenseValidationOptions {
  checkInterval?: number; // Intervalo en milisegundos (por defecto 5 minutos)
  enabled?: boolean; // Si está habilitada la verificación
}

export const useLicenseValidation = (options: UseLicenseValidationOptions = {}) => {
  const { checkInterval = 5 * 60 * 1000, enabled = true } = options; // 5 minutos por defecto
  const { license, setLicense } = useLicense();
  const { showError } = useNotification();
  const intervalRef = useRef<number | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const location = useLocation();

  const validateLicense = async () => {
    if (!license?.licenseCode) {
      return;
    }

    try {
      console.log('[LicenseValidation] Verificando licencia...');
      
      // Obtener el fingerprint del localStorage (el que se usó para generar la licencia)
      const storedFingerprint = localStorage.getItem('fingerprint');
      
      if (!storedFingerprint) {
        console.log('[LicenseValidation] No se encontró fingerprint, saltando validación');
        return;
      }
      
      const response = await licenseService.validateLicense({
        licenseCode: license.licenseCode,
        fingerprint: storedFingerprint
      });

      if (!response.valid) {
        console.log('[LicenseValidation] Licencia expirada o inválida');
        showError('Licencia expirada', 'Tu licencia ha expirado. Por favor, renueva tu licencia.');
        setLicense(null); // Limpiar licencia inválida
        setShowExpiredModal(true); // Mostrar modal
        return false;
      }

      // Actualizar la licencia con la información más reciente
      setLicense(response);
      console.log('[LicenseValidation] Licencia válida, días restantes:', response.daysRemaining);
      return true;
    } catch (error) {
      console.error('[LicenseValidation] Error verificando licencia:', error);
      return false;
    }
  };

  const startValidation = () => {
    if (!enabled || !license) return;

    console.log('[LicenseValidation] Iniciando verificación periódica cada', checkInterval / 1000, 'segundos');
    
    // Verificar inmediatamente
    validateLicense();

    // Configurar verificación periódica
    intervalRef.current = window.setInterval(validateLicense, checkInterval);
  };

  const stopValidation = () => {
    if (intervalRef.current) {
      console.log('[LicenseValidation] Deteniendo verificación periódica');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Detener validación si estamos en /license o /license-admin
    if (location.pathname === '/license' || location.pathname === '/license-admin') {
      stopValidation();
      return;
    }
    if (enabled && license) {
      startValidation();
    } else {
      stopValidation();
    }

    // Cleanup al desmontar
    return () => {
      stopValidation();
    };
  }, [enabled, license, checkInterval, location.pathname]);

  // Limpiar intervalo cuando cambie la licencia
  useEffect(() => {
    if (!license) {
      stopValidation();
    }
  }, [license]);

  return {
    validateLicense,
    startValidation,
    stopValidation,
    showExpiredModal,
    setShowExpiredModal
  };
}; 