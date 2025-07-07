# 📱 Solución de Problemas de Acceso Móvil

## 🔍 Problema: Login no funciona desde móvil

### **Síntomas:**
- ✅ Frontend se carga correctamente
- ❌ Login falla o no responde
- ❌ Error de CORS en consola del navegador
- ❌ "Network Error" en las peticiones

## 🛠️ Soluciones Paso a Paso

### **1. Verificar Configuración CORS**

**Problema:** El backend no permite peticiones desde el dispositivo móvil.

**Solución:**
```bash
# Reiniciar backend con configuración local
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### **2. Verificar URLs de Acceso**

**Problema:** El frontend está usando localhost en lugar de la IP local.

**Solución:**
1. Abrir navegador en el móvil
2. Ir a: `http://192.168.100.64:3000`
3. Verificar que no haya redirecciones a localhost

### **3. Verificar Firewall**

**Problema:** El firewall bloquea las conexiones.

**Solución:**
```powershell
# Ejecutar como Administrador
netsh advfirewall firewall add rule name="Backend Puerto 8080" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Frontend Puerto 3000" dir=in action=allow protocol=TCP localport=3000
```

### **4. Verificar Proxy de Vite**

**Problema:** El proxy no está configurado correctamente.

**Solución:**
Verificar que `frontend/vite.config.ts` tenga:
```javascript
proxy: {
  '/api': {
    target: 'http://192.168.100.64:8080',
    changeOrigin: true,
    secure: false,
  }
}
```

### **5. Probar Endpoints de Diagnóstico**

**URLs de prueba:**
- `http://192.168.100.64:8080/api/test/ping`
- `http://192.168.100.64:8080/api/test/cors`
- `http://192.168.100.64:3000`

### **6. Verificar Configuración de Red**

**Comandos de diagnóstico:**
```bash
# Verificar IP
ipconfig

# Verificar puertos abiertos
netstat -an | findstr ":8080"
netstat -an | findstr ":3000"

# Verificar conectividad desde móvil
ping 192.168.100.64
```

## 🔧 Soluciones Específicas

### **Solución 1: Reiniciar Servicios con Configuración Local**

```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **Solución 2: Configurar CORS Manualmente**

Si el problema persiste, agregar manualmente en el navegador móvil:
1. Abrir DevTools (si es posible)
2. Ir a Network tab
3. Verificar que las peticiones vayan a la IP correcta

### **Solución 3: Usar IP Diferente**

Si tu IP cambia, actualizar:
1. `backend/src/main/java/com/catasoft/restaurante/backend/config/WebConfig.java`
2. `frontend/vite.config.ts`
3. Reiniciar ambos servicios

### **Solución 4: Verificar Credenciales**

**Problema:** Credenciales incorrectas o usuario no existe.

**Solución:**
1. Verificar que el usuario existe en la base de datos
2. Usar credenciales de prueba:
   - Usuario: `admin`
   - Contraseña: `admin123`

## 📱 Configuración Específica para Móviles

### **Android:**
1. Verificar que el WiFi esté conectado
2. Verificar que no haya VPN activo
3. Limpiar cache del navegador
4. Probar con navegador diferente (Chrome, Firefox)

### **iOS:**
1. Verificar configuración de WiFi
2. Limpiar cache de Safari
3. Probar en modo incógnito
4. Verificar que no haya restricciones de contenido

## 🔍 Diagnóstico Avanzado

### **1. Verificar Logs del Backend**
```bash
# Buscar errores de CORS
grep -i "cors" backend/logs/application.log

# Buscar errores de autenticación
grep -i "auth" backend/logs/application.log
```

### **2. Verificar Logs del Frontend**
1. Abrir DevTools en el móvil (si es posible)
2. Ir a Console tab
3. Buscar errores de red o CORS

### **3. Probar con Postman/Insomnia**
1. Crear petición POST a `http://192.168.100.64:8080/api/auth/login`
2. Enviar credenciales de prueba
3. Verificar respuesta

## 🚀 Solución Rápida

Si nada funciona, usar esta configuración de emergencia:

### **1. Backend - application.properties**
```properties
# Permitir todo en desarrollo
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=*
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### **2. Frontend - vite.config.ts**
```javascript
server: {
  host: '0.0.0.0',
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://192.168.100.64:8080',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### **3. Reiniciar Todo**
```bash
# Terminal 1
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 2
cd frontend && npm run dev
```

## ✅ Verificación Final

**URLs de prueba:**
1. `http://192.168.100.64:3000` - Frontend
2. `http://192.168.100.64:8080/api/test/ping` - Backend
3. `http://192.168.100.64:8080/actuator/health` - Health Check

**Si todo funciona:**
- ✅ Frontend se carga
- ✅ Backend responde
- ✅ Login funciona
- ✅ Puedes acceder desde cualquier dispositivo

---

**¡Con estas soluciones deberías poder acceder desde tu móvil sin problemas!** 📱✅ 