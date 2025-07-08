/**
 * Genera un fingerprint único basado en características del equipo
 * Esto permite que la misma licencia funcione en todos los navegadores del mismo equipo
 */
export const generateDeviceFingerprint = (): string => {
  try {
    // Recopilar información del equipo
    const deviceInfo = {
      // Información del navegador
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      
      // Información de la pantalla
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      
      // Información de la ventana
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Información de timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Información de hardware (si está disponible)
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0
      // NO incluir timestamp aquí
    };

    // Crear un string con toda la información
    const deviceString = JSON.stringify(deviceInfo);
    
    // Generar un hash simple del string
    let hash = 0;
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    
    // Convertir a formato hexadecimal y crear el fingerprint
    const hashHex = Math.abs(hash).toString(16).toUpperCase();
    // Usar un identificador fijo
    const staticId = '197E';
    
    // Formato: FP-DEVICE-XXXX-197E
    return `FP-DEVICE-${hashHex.substring(0, 4)}-${staticId}`;
    
  } catch (error) {
    console.error('Error generando fingerprint del equipo:', error);
    // Fallback: generar fingerprint aleatorio
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `FP-DEVICE-${timestamp.toString(16).toUpperCase()}-${random.toUpperCase()}`;
  }
};

/**
 * Verifica si el fingerprint actual es válido para este equipo
 */
export const validateDeviceFingerprint = (fingerprint: string): boolean => {
  if (!fingerprint || !fingerprint.startsWith('FP-DEVICE-')) {
    return false;
  }
  
  // Generar el fingerprint actual del equipo
  const currentFingerprint = generateDeviceFingerprint();
  
  // Comparar solo la parte del hash (no el timestamp)
  const currentHash = currentFingerprint.split('-')[2];
  const storedHash = fingerprint.split('-')[2];
  
  return currentHash === storedHash;
}; 

/**
 * Obtiene el fingerprint del equipo, generándolo y guardándolo solo si no existe.
 */
export const getOrCreateFingerprint = (): string => {
  let fingerprint = localStorage.getItem('fingerprint');
  if (!fingerprint) {
    fingerprint = generateDeviceFingerprint();
    localStorage.setItem('fingerprint', fingerprint);
  }
  return fingerprint;
}; 