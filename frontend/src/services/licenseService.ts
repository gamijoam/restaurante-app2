import { generateDeviceFingerprint } from '../utils/deviceFingerprint';

export interface LicenseValidationRequest {
  licenseCode: string;
  fingerprint: string;
}

export interface LicenseValidationResponse {
  valid: boolean;
  licenseCode?: string;
  type?: string;
  expiresAt?: string;
  daysRemaining?: number;
  clientName?: string;
  message?: string;
}

const LICENSE_SERVICE_URL = 'http://localhost:8081';

class LicenseService {
  async validateLicense(request: LicenseValidationRequest): Promise<LicenseValidationResponse> {
    try {
      console.log('[LicenseService] Validando licencia:', request);
      
      const response = await fetch(`${LICENSE_SERVICE_URL}/api/license/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LicenseService] Error en respuesta:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[LicenseService] Respuesta recibida:', data);
      return data;
    } catch (error) {
      console.error('[LicenseService] Error validando licencia:', error);
      throw error;
    }
  }

  async generateFingerprint(): Promise<string> {
    try {
      // Usar el nuevo fingerprint basado en el equipo
      const deviceFingerprint = generateDeviceFingerprint();
      console.log('[LicenseService] Fingerprint generado:', deviceFingerprint);
      return deviceFingerprint;
    } catch (error) {
      console.error('[LicenseService] Error generando fingerprint:', error);
      throw error;
    }
  }

  async checkLicenseStatus(): Promise<LicenseValidationResponse | null> {
    try {
      const savedLicense = localStorage.getItem('license');
      const savedFingerprint = localStorage.getItem('fingerprint');
      
      if (!savedLicense || !savedFingerprint) {
        return null;
      }

      const license = JSON.parse(savedLicense);
      const request: LicenseValidationRequest = {
        licenseCode: license.licenseCode || '',
        fingerprint: savedFingerprint,
      };

      return await this.validateLicense(request);
    } catch (error) {
      console.error('[LicenseService] Error verificando estado de licencia:', error);
      return null;
    }
  }

  async generateLicense(fingerprint: string, clientName: string, licenseType: string, duration?: number): Promise<any> {
    try {
      console.log('[LicenseService] Generando licencia:', { fingerprint, clientName, licenseType, duration });
      const body: any = {
        fingerprint,
        clientName,
        licenseType,
        notes: `Licencia generada por ${duration} ${licenseType === 'DAILY' ? 'días' : licenseType === 'MONTHLY' ? 'meses' : licenseType === 'ANNUAL' ? 'años' : ''}`
      };
      if (duration !== undefined) {
        body.duration = duration;
      }
      const response = await fetch(`${LICENSE_SERVICE_URL}/api/license/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LicenseService] Error generando licencia:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('[LicenseService] Licencia generada:', data);
      return data;
    } catch (error) {
      console.error('[LicenseService] Error generando licencia:', error);
      throw error;
    }
  }

  async generateLicenseByHours(fingerprint: string, clientName: string, hours: number): Promise<any> {
    try {
      console.log('[LicenseService] Generando licencia por horas:', { fingerprint, clientName, hours });
      
      const response = await fetch(`${LICENSE_SERVICE_URL}/api/license/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint,
          clientName,
          licenseType: 'HOURLY',
          duration: hours,
          notes: `Licencia generada por ${hours} horas`
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LicenseService] Error generando licencia por horas:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[LicenseService] Licencia por horas generada:', data);
      return data;
    } catch (error) {
      console.error('[LicenseService] Error generando licencia por horas:', error);
      throw error;
    }
  }
}

const licenseService = new LicenseService();
export default licenseService; 