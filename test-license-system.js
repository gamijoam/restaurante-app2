const axios = require('axios');

const LICENSE_SERVICE_URL = 'http://localhost:8081';
const RESTAURANT_APP_URL = 'http://localhost:8080';

// Simular fingerprint del equipo
const generateMockFingerprint = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `FP-${timestamp.toString(16).toUpperCase()}-${random.toUpperCase()}`;
};

// Función para generar una licencia
async function generateLicense() {
  try {
    const fingerprint = generateMockFingerprint();
    console.log('🔑 Generando licencia...');
    console.log(`Fingerprint: ${fingerprint}`);
    
    const response = await axios.post(`${LICENSE_SERVICE_URL}/api/license/generate`, {
      fingerprint: fingerprint,
      licenseType: 'MONTHLY',
      clientName: 'Restaurante Test',
      clientContact: 'test@restaurante.com',
      notes: 'Licencia de prueba'
    });
    
    console.log('✅ Licencia generada exitosamente:');
    console.log(`Código: ${response.data.licenseCode}`);
    console.log(`Tipo: ${response.data.type}`);
    console.log(`Expira: ${response.data.expiresAt}`);
    console.log(`Días restantes: ${response.data.daysRemaining}`);
    
    return {
      licenseCode: response.data.licenseCode,
      fingerprint: fingerprint
    };
  } catch (error) {
    console.error('❌ Error generando licencia:', error.response?.data || error.message);
    return null;
  }
}

// Función para validar una licencia
async function validateLicense(licenseCode, fingerprint) {
  try {
    console.log('🔍 Validando licencia...');
    
    const response = await axios.post(`${LICENSE_SERVICE_URL}/api/license/validate`, {
      licenseCode: licenseCode,
      fingerprint: fingerprint
    });
    
    if (response.data.valid) {
      console.log('✅ Licencia válida:');
      console.log(`Mensaje: ${response.data.message}`);
      console.log(`Días restantes: ${response.data.daysRemaining}`);
    } else {
      console.log('❌ Licencia inválida:');
      console.log(`Mensaje: ${response.data.message}`);
    }
    
    return response.data.valid;
  } catch (error) {
    console.error('❌ Error validando licencia:', error.response?.data || error.message);
    return false;
  }
}

// Función para probar el servicio de salud
async function checkHealth() {
  try {
    console.log('🏥 Verificando salud del servicio...');
    
    const response = await axios.get(`${LICENSE_SERVICE_URL}/api/license/health`);
    console.log('✅ Servicio de licencias disponible');
    console.log('Estado:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Servicio de licencias no disponible:', error.message);
    return false;
  }
}

// Función para obtener estadísticas
async function getStats() {
  try {
    console.log('📊 Obteniendo estadísticas...');
    
    const response = await axios.get(`${LICENSE_SERVICE_URL}/api/license/stats`);
    console.log('✅ Estadísticas:');
    console.log(`Total de licencias: ${response.data.totalLicenses}`);
    console.log(`Licencias activas: ${response.data.activeLicenses}`);
    console.log(`Licencias mensuales: ${response.data.monthlyLicenses}`);
    console.log(`Licencias anuales: ${response.data.annualLicenses}`);
    console.log(`Licencias perpetuas: ${response.data.perpetualLicenses}`);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
  }
}

// Función principal de prueba
async function runTests() {
  console.log('🚀 Iniciando pruebas del sistema de licencias...\n');
  
  // 1. Verificar salud del servicio
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.log('❌ No se puede continuar, el servicio no está disponible');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. Obtener estadísticas iniciales
  await getStats();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 3. Generar licencia
  const licenseData = await generateLicense();
  if (!licenseData) {
    console.log('❌ No se pudo generar la licencia');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 4. Validar licencia
  const isValid = await validateLicense(licenseData.licenseCode, licenseData.fingerprint);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 5. Probar con fingerprint incorrecto
  console.log('🔍 Probando con fingerprint incorrecto...');
  await validateLicense(licenseData.licenseCode, 'FP-INVALID-FINGERPRINT');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 6. Obtener estadísticas finales
  await getStats();
  
  console.log('\n✅ Pruebas completadas');
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  generateLicense,
  validateLicense,
  checkHealth,
  getStats,
  generateMockFingerprint
}; 