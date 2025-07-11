import React, { createContext, useContext, useState, useEffect } from 'react';
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
  setLicense: (license: License | null) => void;
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
        } else {
          setLicenseState(null);
        }
        setIsLoadingLicense(false);
      });
    }
  }, []);

  const setLicense = (newLicense: License | null) => {
    if (LICENSE_DISABLED) return;
    setLicenseState(newLicense);
    if (newLicense) {
      licenseService.saveLocalLicense(newLicense).then((ok) => {
        if (ok) {
          console.log('[LicenseContext] Licencia guardada en backend local:', newLicense);
        } else {
          console.error('[LicenseContext] Error guardando licencia en backend local:', newLicense);
        }
      });
    } else {
      licenseService.deleteLocalLicense().then((ok) => {
        if (ok) {
          console.log('[LicenseContext] Licencia eliminada del backend local');
        } else {
          console.error('[LicenseContext] Error eliminando licencia del backend local');
        }
      });
    }
  };

  const clearLicense = () => {
    if (LICENSE_DISABLED) return;
    setLicense(null);
    licenseService.deleteLocalLicense().then((ok) => {
      if (ok) {
        console.log('[LicenseContext] Licencia eliminada del backend local');
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