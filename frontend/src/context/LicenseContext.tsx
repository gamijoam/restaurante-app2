import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  setLicense: (license: License | null) => void;
  isLicenseValid: boolean;
  clearLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

interface LicenseProviderProps {
  children: ReactNode;
}

const LICENSE_DISABLED = import.meta.env.VITE_DISABLE_LICENSE === 'true';

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [license, setLicenseState] = useState<License | null>(null);

  // Si la licencia está desactivada, mockear una licencia válida
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
    } else {
      // Cargar licencia desde localStorage al inicializar
      const savedLicense = localStorage.getItem('license');
      if (savedLicense) {
        try {
          const parsedLicense = JSON.parse(savedLicense);
          if (typeof parsedLicense === 'object' && parsedLicense !== null && 'valid' in parsedLicense) {
            setLicenseState(parsedLicense);
            console.log('[LicenseContext] Licencia cargada desde localStorage:', parsedLicense);
          } else {
            console.error('[LicenseContext] El valor de license en localStorage no es un objeto de licencia válido:', parsedLicense);
          }
        } catch (error) {
          console.error('[LicenseContext] Error parseando licencia guardada. No se eliminará automáticamente. Corrige el valor en localStorage:', error, savedLicense);
        }
      }
    }
  }, []);

  const setLicense = (newLicense: License | null) => {
    if (LICENSE_DISABLED) return; // No permitir cambios si está desactivado
    setLicenseState(newLicense);
    if (newLicense) {
      try {
        const serialized = JSON.stringify(newLicense);
        localStorage.setItem('license', serialized);
        console.log('[LicenseContext] Licencia guardada en localStorage:', newLicense);
      } catch (err) {
        console.error('[LicenseContext] Error serializando licencia antes de guardar:', err, newLicense);
      }
    } else {
      localStorage.removeItem('license');
      console.log('[LicenseContext] Licencia eliminada de localStorage');
    }
  };

  const clearLicense = () => {
    if (LICENSE_DISABLED) return;
    setLicense(null);
    localStorage.removeItem('license');
    localStorage.removeItem('fingerprint'); // También limpiar el fingerprint
    console.log('[LicenseContext] Licencia y fingerprint eliminados');
  };

  const isLicenseValid = LICENSE_DISABLED ? true : license?.valid || false;

  const value: LicenseContextType = {
    license,
    setLicense,
    isLicenseValid,
    clearLicense,
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