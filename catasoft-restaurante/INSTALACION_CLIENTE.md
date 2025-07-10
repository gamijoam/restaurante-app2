# 🍽️ Catasoft Restaurante - Instalación para Cliente

## 📋 Requisitos del Sistema

### Mínimos:
- **Windows 10** o superior
- **4 GB RAM** mínimo (8 GB recomendado)
- **2 GB** espacio libre en disco
- **Java 11** o superior
- **Node.js 16** o superior

### Recomendados:
- **Windows 11**
- **8 GB RAM**
- **5 GB** espacio libre
- **Java 17**
- **Node.js 18**

## 🚀 Instalación Automática

### Opción 1: Instalador Automático (Recomendado)

1. **Descargar el instalador:**
   - Busca el archivo `Catasoft-Restaurante-Setup.exe` en la carpeta
   - Haz doble click para ejecutar

2. **Seguir el asistente:**
   - Acepta los términos de licencia
   - Selecciona la carpeta de instalación (recomendado: `C:\Catasoft-Restaurante`)
   - El instalador automáticamente:
     - Instalará Java si no está presente
     - Instalará Node.js si no está presente
     - Copiará todos los archivos necesarios
     - Creará accesos directos en el escritorio y menú inicio

3. **Iniciar el sistema:**
   - Busca el acceso directo "Catasoft Restaurante" en el escritorio
   - Haz doble click para abrir el launcher
   - Presiona "Iniciar Sistema"
   - El navegador se abrirá automáticamente

### Opción 2: Instalación Manual

Si no tienes el instalador automático:

1. **Verificar Java:**
   ```cmd
   java -version
   ```
   Si no está instalado, descarga desde: https://adoptium.net/

2. **Verificar Node.js:**
   ```cmd
   node --version
   ```
   Si no está instalado, descarga desde: https://nodejs.org/

3. **Copiar archivos:**
   - Copia toda la carpeta `catasoft-restaurante` a `C:\Catasoft-Restaurante`
   - Asegúrate de que la estructura sea:
   ```
   C:\Catasoft-Restaurante\
   ├── Catasoft Restaurante.exe
   ├── backend\
   ├── license-service\
   ├── puente-impresion\
   └── frontend\
   ```

4. **Crear acceso directo:**
   - Click derecho en `Catasoft Restaurante.exe`
   - "Enviar a" → "Escritorio (crear acceso directo)"

## 🎯 Primer Uso

1. **Ejecutar el launcher:**
   - Doble click en "Catasoft Restaurante" (escritorio)
   - Espera a que se abra la ventana del launcher

2. **Iniciar servicios:**
   - Presiona el botón "Iniciar Sistema"
   - Espera unos segundos hasta que todos los servicios estén "Ejecutándose"
   - El navegador se abrirá automáticamente

3. **Acceder al sistema:**
   - Si el navegador no se abre automáticamente, presiona "Abrir Sistema"
   - La dirección será: `http://localhost:5173`

## 🔧 Configuración de Impresoras

### Configurar Impresoras Térmicas:

1. **Acceder a configuración:**
   - En el sistema, ve a "Configuración" → "Impresoras"
   - O navega a: `http://localhost:5173/configuracion/impresoras`

2. **Agregar impresora:**
   - Click en "Agregar Impresora"
   - Selecciona el tipo: "Térmica"
   - Configura el puerto (USB, Red, etc.)
   - Prueba la impresión

3. **Configurar tickets:**
   - Ve a "Configuración" → "Templates de Tickets"
   - Personaliza el formato de los tickets

## 🛠️ Solución de Problemas

### Error: "Java no encontrado"
- Descarga e instala Java desde: https://adoptium.net/
- Reinicia el launcher

### Error: "Node.js no encontrado"
- Descarga e instala Node.js desde: https://nodejs.org/
- Reinicia el launcher

### Error: "Puerto ya en uso"
- Cierra otros programas que usen los puertos 8080, 8081, 3000, 5173
- Reinicia el launcher

### Error: "No se puede conectar al backend"
- Verifica que Java esté instalado correctamente
- Revisa que no haya otro proceso usando el puerto 8080
- Reinicia el launcher

### Error: "No se puede conectar al license service"
- Verifica que Java esté instalado correctamente
- Revisa que no haya otro proceso usando el puerto 8081
- Reinicia el launcher

### Error: "No se puede conectar al puente de impresión"
- Verifica que Node.js esté instalado correctamente
- Revisa que no haya otro proceso usando el puerto 3000
- Reinicia el launcher

### Error: "Frontend no carga"
- Verifica que no haya otro proceso usando el puerto 5173
- Intenta acceder directamente a: `http://localhost:5173`
- Reinicia el launcher

## 📞 Soporte Técnico

Si tienes problemas:

1. **Revisar logs:**
   - En el launcher, revisa los mensajes de estado
   - Los logs aparecen en la consola del launcher

2. **Contactar soporte:**
   - **Email:** soporte@catasoft.com
   - **Teléfono:** +1 (555) 123-4567
   - **Horario:** Lunes a Viernes, 9:00 AM - 6:00 PM

3. **Información necesaria:**
   - Versión de Windows
   - Versión de Java (`java -version`)
   - Versión de Node.js (`node --version`)
   - Mensaje de error específico
   - Captura de pantalla del problema

## 🔄 Actualizaciones

### Actualizar el Sistema:

1. **Descargar nueva versión:**
   - Descarga la nueva versión desde el enlace proporcionado
   - Haz backup de tu configuración actual

2. **Instalar actualización:**
   - Cierra el launcher actual
   - Reemplaza los archivos con la nueva versión
   - Reinicia el launcher

3. **Verificar funcionamiento:**
   - Inicia el sistema
   - Verifica que todo funcione correctamente

## 📝 Notas Importantes

- **No muevas ni borres** ninguna carpeta del sistema
- **No modifiques** los archivos .jar o .exe
- **Mantén actualizado** Java y Node.js
- **Haz backup** de tu configuración regularmente
- **Cierra el launcher** antes de apagar la computadora

---

**© 2024 Catasoft. Todos los derechos reservados.**
**Versión 1.0.0** 