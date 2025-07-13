import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import licenseService from '../services/licenseService';

export interface License {
  valid: boolean;
  licenseCode?: string;
  type?: string;
  expiresAt?: string;
  daysRemaining?: number;
  clientName?: string;
  message?: string;
}

interface LicenseContextType {
  license: License | null;
  setLicense: (license: License | null, saveToBackend?: boolean) => void;
  isLicenseValid: boolean;
  clearLicense: () => void;
  isLoadingLicense: boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

interface LicenseProviderProps {
  children: ReactNode;
}

const LICENSE_DISABLED = import.meta.env.VITE_DISABLE_LICENSE === 'true';

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [license, setLicenseState] = useState<License | null>(null);
  const [isLoadingLicense, setIsLoadingLicense] = useState(true);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSavedLicense = useRef<string>('');

  useEffect(() => {
    if (LICENSE_DISABLED) {
      setLicenseState({
        valid: true,
        licenseCode: 'MOCK-LICENSE',
        type: 'DEMO',
        expiresAt: '2099-12-31',
        daysRemaining: 9999,
        clientName: 'DEMO',
        message: 'Licencia desactivada por entorno',
      });
      setIsLoadingLicense(false);
    } else {
      // Cargar licencia desde backend local al inicializar
      licenseService.getLocalLicense().then((lic) => {
        if (lic && lic.valid) {
          setLicenseState(lic);
          console.log('[LicenseContext] Licencia cargada desde backend local:', lic);
          // Guardar referencia de la última licencia guardada
          lastSavedLicense.current = JSON.stringify(lic);
        } else {
          setLicenseState(null);
        }
        setIsLoadingLicense(false);
      });
    }
  }, []);

  const setLicense = (newLicense: License | null, saveToBackend: boolean = true) => {
    if (LICENSE_DISABLED) return;
    
    // Evitar actualizaciones innecesarias
    const newLicenseStr = JSON.stringify(newLicense);
    if (newLicenseStr === lastSavedLicense.current) {
      console.log('[LicenseContext] Licencia sin cambios, saltando guardado');
      setLicenseState(newLicense);
      return;
    }

    setLicenseState(newLicense);
    
    // Solo guardar en backend si se solicita explícitamente
    if (saveToBackend) {
      // Limpiar timeout anterior si existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce para evitar múltiples llamadas al backend
      saveTimeoutRef.current = setTimeout(() => {
        if (newLicense) {
          licenseService.saveLocalLicense(newLicense).then((ok) => {
            if (ok) {
              console.log('[LicenseContext] Licencia guardada en backend local:', newLicense);
              lastSavedLicense.current = newLicenseStr;
            } else {
              console.error('[LicenseContext] Error guardando licencia en backend local:', newLicense);
            }
          });
        } else {
          licenseService.deleteLocalLicense().then((ok) => {
            if (ok) {
              console.log('[LicenseContext] Licencia eliminada del backend local');
              lastSavedLicense.current = '';
            } else {
              console.error('[LicenseContext] Error eliminando licencia del backend local');
            }
          });
        }
      }, 1000); // Esperar 1 segundo antes de guardar
    }
  };

  const clearLicense = () => {
    if (LICENSE_DISABLED) return;
    setLicense(null, true); // Forzar guardado al eliminar
    licenseService.deleteLocalLicense().then((ok) => {
      if (ok) {
        console.log('[LicenseContext] Licencia eliminada del backend local');
        lastSavedLicense.current = '';
      } else {
        console.error('[LicenseContext] Error eliminando licencia del backend local');
      }
    });
  };

  const isLicenseValid = LICENSE_DISABLED ? true : license?.valid || false;

  const value: LicenseContextType = {
    license,
    setLicense,
    isLicenseValid,
    clearLicense,
    isLoadingLicense,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}; 