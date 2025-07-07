# 🌐 Guía de Conexión Local

## 📋 Requisitos Previos

- ✅ Backend y Frontend corriendo en el servidor
- ✅ Dispositivos conectados a la misma red WiFi
- ✅ Firewall configurado para permitir conexiones

## 🚀 Pasos para Conexión Local

### 1. **Iniciar Backend en Modo Local**

```bash
# Opción 1: Usar el script
start-backend-local.bat

# Opción 2: Comando manual
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**URL del Backend:** `http://192.168.100.64:8080`

### 2. **Iniciar Frontend en Modo Local**

```bash
# Opción 1: Usar el script
start-frontend-local.bat

# Opción 2: Comando manual
cd frontend
npm run dev
```

**URL del Frontend:** `http://192.168.100.64:3000`

### 3. **Acceder desde Otros Dispositivos**

#### 📱 **Desde Móvil/Tablet:**
1. Abrir navegador web
2. Ir a: `http://192.168.100.64:3000`
3. Iniciar sesión con credenciales existentes

#### 💻 **Desde Otro PC:**
1. Abrir navegador web
2. Ir a: `http://192.168.100.64:3000`
3. Iniciar sesión con credenciales existentes

## 🔧 Configuración de Firewall

### **Windows:**
1. Abrir "Firewall de Windows Defender"
2. Ir a "Permitir una aplicación o característica"
3. Agregar:
   - Puerto 8080 (Backend)
   - Puerto 3000 (Frontend)

### **Comandos PowerShell (Administrador):**
```powershell
# Permitir puerto 8080 (Backend)
netsh advfirewall firewall add rule name="Backend Puerto 8080" dir=in action=allow protocol=TCP localport=8080

# Permitir puerto 3000 (Frontend)
netsh advfirewall firewall add rule name="Frontend Puerto 3000" dir=in action=allow protocol=TCP localport=3000
```

## 📊 URLs de Acceso

| Servicio | URL Local | Descripción |
|----------|-----------|-------------|
| **Frontend** | `http://192.168.100.64:3000` | Interfaz web principal |
| **Backend API** | `http://192.168.100.64:8080` | API REST del sistema |
| **Health Check** | `http://192.168.100.64:8080/actuator/health` | Estado del backend |

## 🔍 Verificar Conexión

### **Desde el Servidor:**
```bash
# Verificar que el backend responde
curl http://localhost:8080/actuator/health

# Verificar que el frontend responde
curl http://localhost:3000
```

### **Desde Otro Dispositivo:**
```bash
# Verificar conectividad
ping 192.168.100.64

# Verificar puertos
telnet 192.168.100.64 8080
telnet 192.168.100.64 3000
```

## 🛠️ Solución de Problemas

### **Problema: No se puede acceder desde otros dispositivos**

**Solución:**
1. Verificar que ambos servicios estén corriendo
2. Verificar configuración del firewall
3. Verificar que la IP sea correcta
4. Reiniciar servicios con configuración local

### **Problema: Error de CORS**

**Solución:**
- El backend ya está configurado para permitir CORS desde cualquier origen en modo local

### **Problema: Conexión lenta**

**Solución:**
1. Verificar velocidad de la red WiFi
2. Cerrar aplicaciones innecesarias en el servidor
3. Verificar que no haya otros servicios usando los mismos puertos

## 📱 Acceso Móvil Optimizado

### **Características del Acceso Móvil:**
- ✅ Diseño responsive completo
- ✅ FAB (Floating Action Button) para móviles
- ✅ Navegación optimizada para touch
- ✅ Interfaz adaptada a pantallas pequeñas

### **Roles Disponibles:**
- **Gerente:** Acceso completo a todas las funciones
- **Cocinero:** Vista de cocina y gestión de recetas
- **Cajero:** Vista de caja y gestión de pedidos

## 🔒 Seguridad

### **Consideraciones de Seguridad:**
- ⚠️ Solo usar en redes confiables
- ⚠️ No exponer en Internet sin configuración adicional
- ⚠️ Cambiar credenciales por defecto
- ⚠️ Usar HTTPS en producción

## 📞 Soporte

Si tienes problemas con la conexión local:

1. **Verificar logs del backend:** `backend/logs/`
2. **Verificar logs del frontend:** Consola del navegador
3. **Verificar conectividad de red:** `ipconfig` y `ping`
4. **Reiniciar servicios:** Usar los scripts de inicio

---

**¡Listo para usar la aplicación desde cualquier dispositivo en tu red local!** 🎉 