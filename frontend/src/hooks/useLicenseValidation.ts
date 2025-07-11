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
  const { showError, showWarning } = useNotification();
  const intervalRef = useRef<number | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const location = useLocation();

  const validateLicense = async () => {
    if (!license?.licenseCode) {
      console.log('[LicenseValidation] No hay licencia para validar');
      return;
    }

    try {
      console.log('[LicenseValidation] Verificando licencia...');
      
      // Obtener el fingerprint del localStorage (el que se usó para generar la licencia)
      const storedFingerprint = localStorage.getItem('fingerprint');
      
      if (!storedFingerprint) {
        console.log('[LicenseValidation] No se encontró fingerprint, saltando validación');
        showError('Error de licencia', 'No se encontró el fingerprint del equipo. No se puede validar la licencia.');
        // No eliminar la licencia, solo mostrar error
        return;
      }
      
      const response = await licenseService.validateLicense({
        licenseCode: license.licenseCode,
        fingerprint: storedFingerprint
      });

      if (!response.valid) {
        console.log('[LicenseValidation] Licencia expirada o inválida');
        console.log('[LicenseValidation] Motivo:', response.message);
        
        // Mostrar advertencia antes de mostrar el modal
        showWarning(
          'Licencia Expirada', 
          'Tu licencia ha expirado. Se mostrará un modal con opciones para renovar.'
        );
        
        // Limpiar licencia inválida
        setLicense(null);
        
        // Mostrar modal después de un breve delay
        setTimeout(() => {
          setShowExpiredModal(true);
        }, 1000);
        
        return false;
      }

      // Verificar si la licencia está próxima a expirar (menos de 7 días)
      if (response.daysRemaining && response.daysRemaining <= 7) {
        showWarning(
          'Licencia próxima a expirar',
          `Tu licencia expira en ${response.daysRemaining} días. Considera renovarla pronto.`
        );
      }

      // Actualizar la licencia con la información más reciente
      setLicense(response);
      console.log('[LicenseValidation] Licencia válida, días restantes:', response.daysRemaining);
      return true;
    } catch (error) {
      console.error('[LicenseValidation] Error verificando licencia:', error);
      showError('Error de validación', 'No se pudo verificar la licencia. Verifica tu conexión.');
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