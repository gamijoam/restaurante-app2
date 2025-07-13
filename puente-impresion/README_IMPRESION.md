# Sistema de Impresión Mejorado - Catasoft Restaurante

## 🚀 Inicio Rápido

### Opción 1: Gestor Automático (Recomendado)
```bash
# En Windows
start-print-bridge.bat

# En Linux/Mac
node start-print-bridge.js
```

### Opción 2: Inicio Manual
```bash
node index.js
```

## 🔧 Configuración

### Variables de Entorno
Crear archivo `.env` en el directorio del puente de impresión:

```env
WEBSOCKET_URL=ws://localhost:8080/ws
```

### Configuración de Impresoras
El sistema detecta automáticamente las impresoras disponibles. Para configurar manualmente:

1. Ejecutar `node listar_impresoras.js` para ver impresoras disponibles
2. Usar el nombre exacto de la impresora en la configuración

## 📊 Monitoreo

### Monitor de Salud (Frontend)
- **Ubicación**: Esquina inferior derecha de la aplicación
- **Funcionalidades**:
  - Estado de conexión WebSocket
  - Contador de impresiones
  - Botón de reconexión manual
  - Última impresión realizada

### Logs del Sistema
- **Archivo**: `print-bridge.log`
- **Ubicación**: Directorio del puente de impresión
- **Contenido**: Todos los eventos y errores del sistema

## 🔄 Reconexión Automática

### Características
- **Reconexión automática**: Cada 30 segundos
- **Máximo de intentos**: 10 reconexiones
- **Delay entre intentos**: 5 segundos
- **Timeout de impresión**: 30 segundos

### Estados de Conexión
- ✅ **Conectado**: Sistema funcionando normalmente
- ❌ **Desconectado**: Problemas de conexión
- 🔄 **Reconectando**: Intentando restablecer conexión

## 🛠️ Solución de Problemas

### Problema: La aplicación se congela después de imprimir

**Síntomas**:
- Páginas no cargan después de imprimir
- La aplicación se vuelve lenta
- Necesitas reiniciar el launcher

**Soluciones**:

1. **Verificar conexión WebSocket**:
   ```bash
   # En la consola del navegador
   console.log('WebSocket status:', window.stompClient?.connected)
   ```

2. **Reiniciar el puente de impresión**:
   ```bash
   # Detener proceso actual
   Ctrl+C
   
   # Reiniciar con gestor
   start-print-bridge.bat
   ```

3. **Verificar logs**:
   ```bash
   # Ver últimos errores
   tail -f print-bridge.log
   ```

### Problema: Impresora no responde

**Síntomas**:
- Timeout de impresión
- Error "Impresora no disponible"
- Impresión no se completa

**Soluciones**:

1. **Verificar conexión física**:
   - Cable USB conectado
   - Impresora encendida
   - Sin papel atascado

2. **Verificar drivers**:
   ```bash
   # Listar impresoras
   node listar_impresoras.js
   ```

3. **Reiniciar impresora**:
   - Apagar y encender la impresora
   - Esperar 30 segundos
   - Intentar imprimir nuevamente

### Problema: WebSocket no se conecta

**Síntomas**:
- Monitor muestra "Desconectado"
- No se pueden enviar impresiones
- Errores de conexión en consola

**Soluciones**:

1. **Verificar backend**:
   ```bash
   # Verificar que el backend esté corriendo
   curl http://localhost:8080/actuator/health
   ```

2. **Verificar puerto WebSocket**:
   - Backend debe estar en puerto 8080
   - WebSocket endpoint: `/ws`

3. **Reiniciar todo el sistema**:
   ```bash
   # 1. Detener backend
   # 2. Detener puente de impresión
   # 3. Reiniciar backend
   # 4. Reiniciar puente de impresión
   ```

## 📋 Comandos Útiles

### Verificar Estado del Sistema
```bash
# Ver logs en tiempo real
tail -f print-bridge.log

# Ver impresoras disponibles
node listar_impresoras.js

# Verificar conexión WebSocket
curl -I http://localhost:8080/ws
```

### Reiniciar Servicios
```bash
# Reiniciar puente de impresión
Ctrl+C
node index.js

# Reiniciar con gestor
start-print-bridge.bat
```

### Debugging
```bash
# Modo debug
DEBUG=* node index.js

# Ver logs detallados
node index.js 2>&1 | tee debug.log
```

## 🔧 Configuración Avanzada

### Timeouts Personalizados
Editar `index.js`:

```javascript
const PRINT_TIMEOUT = 30000; // 30 segundos
const RECONNECT_DELAY = 5000; // 5 segundos
const MAX_RECONNECT_ATTEMPTS = 10;
```

### Logging Personalizado
```javascript
// En index.js
console.log('🖨️ [IMPRESION] Mensaje personalizado');
console.error('❌ [ERROR] Error personalizado');
```

## 📞 Soporte

### Información para Reportar Problemas
- **Versión del sistema**: Ver en la aplicación
- **Logs**: Adjuntar `print-bridge.log`
- **Configuración**: Adjuntar `.env`
- **Pasos para reproducir**: Describir exactamente qué pasos llevan al problema

### Contacto
- **Desarrollador**: Gabriel
- **Proyecto**: Catasoft Restaurante
- **Fecha**: 2024

## 🎯 Mejoras Implementadas

### v2.0 - Sistema Robusto
- ✅ Reconexión automática
- ✅ Timeouts de impresión
- ✅ Manejo de errores mejorado
- ✅ Monitor de salud en tiempo real
- ✅ Logging detallado
- ✅ Gestor de procesos automático
- ✅ Limpieza de recursos
- ✅ Manejo de señales de terminación

### Próximas Mejoras
- [ ] Interfaz de configuración gráfica
- [ ] Estadísticas detalladas de impresión
- [ ] Notificaciones push de errores
- [ ] Backup automático de configuración 