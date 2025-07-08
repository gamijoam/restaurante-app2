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

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [license, setLicenseState] = useState<License | null>(null);

  // Cargar licencia desde localStorage al inicializar
  useEffect(() => {
    const savedLicense = localStorage.getItem('license');
    if (savedLicense) {
      try {
        const parsedLicense = JSON.parse(savedLicense);
        setLicenseState(parsedLicense);
        console.log('[LicenseContext] Licencia cargada desde localStorage:', parsedLicense);
      } catch (error) {
        console.error('[LicenseContext] Error parseando licencia guardada:', error);
        localStorage.removeItem('license');
      }
    }
  }, []);

  const setLicense = (newLicense: License | null) => {
    setLicenseState(newLicense);
    
    if (newLicense) {
      // Guardar en localStorage
      localStorage.setItem('license', JSON.stringify(newLicense));
      console.log('[LicenseContext] Licencia guardada en localStorage:', newLicense);
    } else {
      // Limpiar solo la licencia, no el fingerprint
      localStorage.removeItem('license');
      console.log('[LicenseContext] Licencia eliminada de localStorage');
    }
  };

  const clearLicense = () => {
    setLicense(null);
    localStorage.removeItem('license');
    localStorage.removeItem('fingerprint'); // También limpiar el fingerprint
    console.log('[LicenseContext] Licencia y fingerprint eliminados');
  };

  const isLicenseValid = license?.valid || false;

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